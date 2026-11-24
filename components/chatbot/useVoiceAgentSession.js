import { useCallback, useEffect, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';

export const useVoiceAgentSession = ({ apiBaseUrl, leadId, isChatbotOpen }) => {
  const [voiceAgentMode, setVoiceAgentMode] = useState('idle');
  const [voiceAgentError, setVoiceAgentError] = useState(null);

  const voiceConversationRef = useRef(null);
  const voiceAutoEndTimerRef = useRef(null);

  const stopVoiceAgentSession = useCallback(async () => {
    if (voiceAutoEndTimerRef.current) {
      clearTimeout(voiceAutoEndTimerRef.current);
      voiceAutoEndTimerRef.current = null;
    }

    const activeConversation = voiceConversationRef.current;
    voiceConversationRef.current = null;

    if (activeConversation) {
      try {
        await activeConversation.endSession();
      } catch (_error) {
      }
    }

    setVoiceAgentMode('idle');
  }, []);

  const startVoiceAgentSession = useCallback(async () => {
    if (!leadId) {
      setVoiceAgentError('Lead ID not available. Please submit the form again.');
      return;
    }

    setVoiceAgentError(null);
    setVoiceAgentMode('connecting');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const signedUrlResponse = await fetch(
        `${apiBaseUrl}/elevenlabs/signed-url?lead_id=${encodeURIComponent(leadId)}`,
        { headers: { accept: 'application/json' } }
      );

      if (!signedUrlResponse.ok) {
        let errorDetail = `HTTP ${signedUrlResponse.status}`;
        try {
          const errorBody = await signedUrlResponse.json();
          errorDetail = errorBody?.detail || errorBody?.error || errorDetail;
        } catch (_error) {
        }
        throw new Error(errorDetail);
      }

      const signedUrlPayload = await signedUrlResponse.json();
      const signedUrl = signedUrlPayload?.signed_url;
      const maxDurationSeconds = signedUrlPayload?.max_duration_seconds;

      if (!signedUrl) {
        throw new Error('Signed URL missing from server response');
      }

      const conversation = await Conversation.startSession({
        signedUrl,
        dynamicVariables: { lead_id: leadId },
        onConnect: () => {
          setVoiceAgentMode('listening');
          if (typeof maxDurationSeconds === 'number' && maxDurationSeconds > 0) {
            voiceAutoEndTimerRef.current = setTimeout(() => {
              stopVoiceAgentSession();
            }, maxDurationSeconds * 1000);
          }
        },
        onDisconnect: () => {
          stopVoiceAgentSession();
        },
        onError: (error) => {
          const errorMessage =
            typeof error === 'string'
              ? error
              : (error?.message || 'Voice session error');
          setVoiceAgentError(errorMessage);
          stopVoiceAgentSession();
        },
        onModeChange: ({ mode }) => {
          if (mode === 'speaking' || mode === 'listening') {
            setVoiceAgentMode(mode);
          }
        },
      });

      voiceConversationRef.current = conversation;
    } catch (error) {
      const errorMessage = error?.message || 'Failed to start voice call';
      setVoiceAgentError(errorMessage);
      setVoiceAgentMode('idle');
    }
  }, [apiBaseUrl, leadId, stopVoiceAgentSession]);

  const resetVoiceAgentSession = useCallback(() => {
    if (voiceAutoEndTimerRef.current) {
      clearTimeout(voiceAutoEndTimerRef.current);
      voiceAutoEndTimerRef.current = null;
    }

    const activeVoiceConversation = voiceConversationRef.current;
    voiceConversationRef.current = null;

    if (activeVoiceConversation) {
      Promise.resolve(activeVoiceConversation.endSession()).catch(() => {});
    }

    setVoiceAgentMode('idle');
    setVoiceAgentError(null);
  }, []);

  useEffect(() => {
    if (!isChatbotOpen && voiceConversationRef.current) {
      stopVoiceAgentSession();
    }
  }, [isChatbotOpen, stopVoiceAgentSession]);

  useEffect(() => {
    return () => {
      resetVoiceAgentSession();
    };
  }, [resetVoiceAgentSession]);

  return {
    voiceAgentMode,
    voiceAgentError,
    startVoiceAgentSession,
    stopVoiceAgentSession,
    resetVoiceAgentSession,
  };
};
