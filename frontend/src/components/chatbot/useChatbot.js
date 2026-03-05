import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const useChatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your JanSoochna Assistant. How can I help you today?', timestamp: new Date() }
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, scrollToBottom]);

    const sendMessage = async (content) => {
        if (!content.trim()) return;

        const userMessage = { role: 'user', content, timestamp: new Date() };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/chatbot/message`,
                { message: content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessages(prev => [...prev, {
                ...res.data,
                role: 'assistant',
                content: res.data.reply,
                timestamp: new Date()
            }]);
        } catch (err) {
            console.error('Chatbot error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I am having trouble connecting to my brain. Please try again soon!',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/chatbot/session`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you?', timestamp: new Date() }]);
        } catch (err) {
            console.error('Clear session error:', err);
        }
    };

    return {
        messages,
        isOpen,
        setIsOpen,
        isTyping,
        sendMessage,
        clearChat,
        scrollRef
    };
};
