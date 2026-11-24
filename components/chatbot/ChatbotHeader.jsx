import React from 'react';

const ChatbotHeader = ({
  chatPhase,
  onResetInputFields,
  onBack,
  onResetChat,
  onToggleChatbot,
}) => {
  const isFormPhase = chatPhase === 'leadForm' || chatPhase === 'callForm';
  const isChatPhase =
    chatPhase === 'chatting' ||
    chatPhase === 'completed' ||
    chatPhase === 'calling' ||
    chatPhase === 'callCompleted' ||
    chatPhase === 'voiceAgent';

  return (
    <div className="chatbot-header">
      <div className="chatbot-header-info">
        <div className="chatbot-avatar">
          <img
            src="https://matchmaking-vfe-admin.s3.ap-south-1.amazonaws.com/images/1754258937576.webp"
            alt=""
            width={25}
            height={24}
          />
        </div>
        <div>
          <h5 className='text-white text-xl font-times-roman'>Vows for Eternity</h5>
          <p>We are here to help</p>
        </div>
      </div>
      <div className="chatbot-header-buttons">
        {isFormPhase && (
          <button
            className="chatbot-reset"
            onClick={onResetInputFields}
            title="Reset Input Fields"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.50201 19.8525 6.12132 18.1209"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 18L6 18L6 15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {isFormPhase && (
          <button
            className="chatbot-back chatbot-close"
            onClick={onToggleChatbot}
            title="Back"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {isChatPhase && (
          <button
            className="chatbot-reset"
            onClick={onResetChat}
            title="Start New Chat"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.61386 21 7.50201 19.8525 6.12132 18.1209"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 18L6 18L6 15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <button className="chatbot-close" onClick={onToggleChatbot}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatbotHeader;

