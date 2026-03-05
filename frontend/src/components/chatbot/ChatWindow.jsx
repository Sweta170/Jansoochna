import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Send, X, Trash, Bot, Mic } from 'lucide-react';
import VoiceInput from '../common/VoiceInput';

const ChatWindow = ({ messages, isOpen, setIsOpen, isTyping, sendMessage, clearChat, scrollRef }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    const handleTranscription = (text) => {
        setInput(text);
        // Optionally send immediately: sendMessage(text);
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Header */}
            <div className="chatbot-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', background: 'rgba(255,255,255,0.2)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)', justifyContent: 'center' }}>
                        <Bot size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>JanSoochna AI</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, opacity: 0.8 }}>Online</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={clearChat}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background 0.3s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        title="Clear Chat"
                    >
                        <Trash size={20} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem', transition: 'background 0.3s' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="chatbot-messages-area">
                {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                ))}

                {isTyping && (
                    <div className="chat-bubble assistant" style={{ display: 'flex', gap: '4px', width: 'fit-content' }}>
                        <div style={{ width: '6px', height: '6px', background: 'currentColor', opacity: 0.4, borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                        <div style={{ width: '6px', height: '6px', background: 'currentColor', opacity: 0.4, borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
                        <div style={{ width: '6px', height: '6px', background: 'currentColor', opacity: 0.4, borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
                    </div>
                )}
            </div>

            {/* Footer / Input */}
            <div className="chatbot-input-footer">
                <form onSubmit={handleSubmit} style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '1rem', border: '1px solid var(--border)', padding: '0.25rem 0.5rem', gap: '0.25rem', alignItems: 'center' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or speak..."
                        style={{ flex: 1, background: 'transparent', border: 'none', padding: '0.5rem', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }}
                    />
                    <VoiceInput onTranscription={handleTranscription} iconOnly={true} />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: !input.trim() ? 0.5 : 1 }}
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p style={{ margin: '0.75rem 0 0', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Jan AI Assistant can make mistakes. Please verify important info.
                </p>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
            `}</style>
        </div>
    );
};

export default ChatWindow;
