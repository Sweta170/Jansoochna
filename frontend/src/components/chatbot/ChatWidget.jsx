import React from 'react';
import ChatWindow from './ChatWindow';
import { Bot, X } from 'lucide-react';
import { useChatbot } from './useChatbot';

const ChatWidget = () => {
    const {
        messages,
        isOpen,
        setIsOpen,
        isTyping,
        sendMessage,
        clearChat,
        scrollRef
    } = useChatbot();

    return (
        <>
            {/* Vertical Sidebar Tab */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`chatbot-sidebar-tab ${isOpen ? 'open' : ''}`}
                aria-label="Toggle Jan Assistant"
            >
                <div className="chatbot-tab-content">
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.75rem', backdropFilter: 'blur(8px)' }}>
                        <Bot size={24} strokeWidth={2.5} />
                    </div>
                    <span>Jan Assistant</span>
                    <div style={{ width: '6px', height: '6px', background: '#FACC15', borderRadius: '50%', boxShadow: '0 0 10px #FACC15' }}></div>
                </div>
            </button>

            {/* Chat Window Container */}
            <div className={`chatbot-drawer-container ${!isOpen ? 'closed' : ''}`}>
                <ChatWindow
                    messages={messages}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    isTyping={isTyping}
                    sendMessage={sendMessage}
                    clearChat={clearChat}
                    scrollRef={scrollRef}
                />
            </div>
        </>
    );
};

export default ChatWidget;
