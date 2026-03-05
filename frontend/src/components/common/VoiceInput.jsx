import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

const VoiceInput = ({ onTranscription, label = "Record Voice", iconOnly = false, customStyle = {} }) => {
    const [isListening, setIsListening] = useState(false);
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSupported(false);
        }
    }, []);

    const toggleListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        if (!isListening) {
            recognition.start();
            setIsListening(true);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onTranscription(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    };

    if (!supported) return null;

    if (iconOnly) {
        return (
            <button
                type="button"
                onClick={toggleListening}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: isListening ? 'var(--danger)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    padding: '0.25rem',
                    ...customStyle
                }}
                title={isListening ? "Listening..." : "Voice Input"}
            >
                <div style={{ position: 'relative' }}>
                    <Mic size={20} className={isListening ? 'pulse' : ''} />
                    {isListening && (
                        <div style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '6px',
                            height: '6px',
                            background: 'var(--danger)',
                            borderRadius: '50%'
                        }}></div>
                    )}
                </div>
                <style>{`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.2); opacity: 0.7; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    .pulse {
                        animation: pulse 1.5s infinite;
                    }
                `}</style>
            </button>
        );
    }

    return (
        <div style={{ marginBottom: '1rem', ...customStyle }}>
            <button
                type="button"
                onClick={toggleListening}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: isListening ? 'var(--danger)' : 'var(--surface)',
                    color: isListening ? 'white' : 'var(--text-main)',
                    border: '1px solid var(--border)',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    width: 'fit-content'
                }}
            >
                {isListening ? (
                    <>
                        <span className="pulse-dot" style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%' }}></span>
                        Listening... (Speak Now)
                    </>
                ) : (
                    <><Mic size={18} /> {label}</>
                )}
            </button>
            {isListening && (
                <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.4rem', fontWeight: 'bold' }}>
                    Tip: Speak clearly about the issue (e.g., "Pothole on Main Street")
                </p>
            )}

            <style>
                {`
                    @keyframes pulse-dot {
                        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
                        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
                        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
                    }
                    .pulse-dot {
                        animation: pulse-dot 2s infinite;
                    }
                `}
            </style>
        </div>
    );
};

export default VoiceInput;
