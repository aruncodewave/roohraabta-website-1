import React from 'react';

const ChatbotVoiceAgentPanel = ({
  mode,
  errorMessage,
  onStartCall,
  onEndCall,
  onBack,
}) => {
  return (
    <div className="chatbot-call-status">
      <div className="call-status-content">
        <h4>Voice Agent</h4>
        <p>Status: {mode}</p>
        {errorMessage && (
          <p style={{ color: '#ef4444' }}>{errorMessage}</p>
        )}
        <div className="call-actions">
          <button
            className="submit-button"
            type="button"
            onClick={onStartCall}
            disabled={mode !== 'idle'}
          >
            Start Call
          </button>
          <button
            className="submit-button secondary"
            type="button"
            onClick={onEndCall}
            disabled={mode === 'idle'}
          >
            End Call
          </button>
          <button
            className="submit-button secondary"
            type="button"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotVoiceAgentPanel;
