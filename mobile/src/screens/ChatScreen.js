import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ChatScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [messages, setMessages] = useState([
        { id: '1', role: 'assistant', content: 'Hello! I am your JanSoochna Assistant. How can I help you today?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef(null);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post('chatbot/message', { message: userMsg.content });

            const botMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: res.data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I am having trouble connecting. Please try again later.',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[
                styles.messageWrapper,
                isUser ? styles.userWrapper : styles.botWrapper
            ]}>
                {!isUser && (
                    <View style={[styles.avatarMini, { backgroundColor: colors.primary }]}>
                        <MaterialCommunityIcons name="robot" size={14} color="#fff" />
                    </View>
                )}
                <View style={[
                    styles.messageBubble,
                    isUser
                        ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
                        : { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderColor: colors.border, borderWidth: 1 }
                ]}>
                    <Text style={[
                        styles.messageText,
                        { color: isUser ? '#fff' : colors.textMain }
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.timestamp,
                        { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted }
                    ]}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textMain} />
                </Pressable>
                <View style={[styles.botIconMain, { backgroundColor: colors.primary + '15' }]}>
                    <MaterialCommunityIcons name="robot-happy" size={24} color={colors.primary} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Civic Assistant</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                        <Text style={[styles.headerStatus, { color: colors.textMuted }]}>Always active</Text>
                    </View>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {isTyping && (
                <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { backgroundColor: colors.primary }]} />
                    <View style={[styles.typingDot, { backgroundColor: colors.primary, opacity: 0.6 }]} />
                    <View style={[styles.typingDot, { backgroundColor: colors.primary, opacity: 0.3 }]} />
                </View>
            )}

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { color: colors.textMain }]}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask anything..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                    />
                    <Pressable
                        style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.border }]}
                        onPress={handleSend}
                        disabled={!input.trim()}
                    >
                        <MaterialCommunityIcons name="send" size={20} color={input.trim() ? "#fff" : colors.textMuted} />
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1.5,
    },
    backBtn: { marginRight: 15 },
    botIconMain: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: { marginLeft: 12, flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    headerStatus: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    listContent: { padding: 20, paddingBottom: 32 },
    messageWrapper: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%' },
    userWrapper: { alignSelf: 'flex-end' },
    botWrapper: { alignSelf: 'flex-start' },
    avatarMini: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
    messageBubble: {
        padding: 16,
        borderRadius: 20,
    },
    messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    timestamp: { fontSize: 9, marginTop: 6, fontWeight: '700', opacity: 0.6 },

    typingIndicator: { flexDirection: 'row', paddingLeft: 52, marginBottom: 16, gap: 4 },
    typingDot: { width: 6, height: 6, borderRadius: 3 },

    footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1.5,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        maxHeight: 100,
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 8,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    }
});
