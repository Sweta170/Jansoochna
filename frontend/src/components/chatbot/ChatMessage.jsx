import React, { useState, useEffect } from 'react';
import { User, Bot, Volume2, VolumeX } from 'lucide-react';

const ChatMessage = ({ message }) => {
    const isAssistant = message.role === 'assistant';
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Monitor for speech ending to reset button state
    useEffect(() => {
        const checkSpeech = () => {
            if (!window.speechSynthesis.speaking) {
                setIsSpeaking(false);
            }
        };
        const interval = setInterval(checkSpeech, 500);
        return () => clearInterval(interval);
    }, []);

    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Modern voices selection if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            marginBottom: '1rem',
            justifyContent: isAssistant ? 'flex-start' : 'flex-end',
            gap: '0.75rem',
            alignItems: 'flex-end'
        }}>
            {isAssistant && (
                <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Bot size={16} />
                </div>
            )}

            <div className={`chat-bubble ${isAssistant ? 'assistant' : 'user'}`} style={{
                position: 'relative',
                paddingRight: isAssistant ? '2.5rem' : undefined
            }}>
                {message.content}

                {isAssistant && (
                    <button
                        onClick={handleSpeak}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.5rem',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: isSpeaking ? '#4ade80' : 'rgba(255,255,255,0.7)',
                            transition: 'all 0.2s ease',
                            zIndex: 10
                        }}
                        title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
                    >
                        {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                )}

                <div style={{
                    fontSize: '9px',
                    marginTop: '0.25rem',
                    opacity: 0.6,
                    textAlign: isAssistant ? 'left' : 'right'
                }}>
                    {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {!isAssistant && (
                <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'var(--surface-2)',
                    color: 'var(--primary)',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)',
                    flexShrink: 0
                }}>
                    <User size={16} />
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
