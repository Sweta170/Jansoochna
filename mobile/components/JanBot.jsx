import React, { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal, DeviceEventEmitter } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, FadeInUp, FadeIn } from 'react-native-reanimated'
import api from '../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'

// Emoji data organized by category
const EMOJI_DATA = {
  '😀 Smileys': ['😀', '😊', '😄', '🤗', '😎', '🤔', '😢', '😡', '🙏', '👋', '🥺', '😲'],
  '👍 Hands': ['👍', '👎', '👏', '🤝', '✌️', '🙌', '💪', '☝️', '👆', '👇', '👈', '👉'],
  '❤️ Symbols': ['❤️', '⭐', '🔥', '✅', '❌', '⚠️', '📌', '🎯', '💡', '📞', '🏠', '📄'],
  '🏛️ Civic': ['🏛️', '🗳️', '🚰', '💡', '🛣️', '🗑️', '🚗', '🌾', '👶', '💍', '🆔', '💰']
}

export default function JanBot() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('open-janbot', () => {
      setIsOpen(true)
    })
    return () => {
      subscription.remove()
    }
  }, [])
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState(Object.keys(EMOJI_DATA)[0])
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  const scrollRef = useRef(null)
  const recognitionRef = useRef(null)
  const nativeTimeoutRef = useRef(null)
  const nativeIntervalRef = useRef(null)

  // Waveform heights for animated sound waves
  const bar1 = useSharedValue(1)
  const bar2 = useSharedValue(1)
  const bar3 = useSharedValue(1)
  const bar4 = useSharedValue(1)
  const bar5 = useSharedValue(1)

  useEffect(() => {
    if (isListening) {
      bar1.value = withRepeat(withTiming(2.5, { duration: 400 }), -1, true)
      bar2.value = withRepeat(withTiming(3.2, { duration: 550 }), -1, true)
      bar3.value = withRepeat(withTiming(1.8, { duration: 300 }), -1, true)
      bar4.value = withRepeat(withTiming(3.5, { duration: 600 }), -1, true)
      bar5.value = withRepeat(withTiming(2.2, { duration: 450 }), -1, true)
    } else {
      bar1.value = withTiming(1)
      bar2.value = withTiming(1)
      bar3.value = withTiming(1)
      bar4.value = withTiming(1)
      bar5.value = withTiming(1)
    }
  }, [isListening])

  const barStyle1 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar1.value }] }))
  const barStyle2 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar2.value }] }))
  const barStyle3 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar3.value }] }))
  const barStyle4 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar4.value }] }))
  const barStyle5 = useAnimatedStyle(() => ({ transform: [{ scaleY: bar5.value }] }))
  
  // TTS module (loaded conditionally)
  const Speech = useRef(null)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        Speech.current = require('expo-speech')
      } catch (e) {
        console.log('expo-speech not available')
      }
    }
  }, [])

  // Web speech recognition setup
  useEffect(() => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true

        rec.onresult = (event) => {
          let interimTranscript = ''
          let finalTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            } else {
              interimTranscript += event.results[i][0].transcript
            }
          }
          const text = finalTranscript || interimTranscript
          if (text) setInputText(text)
        }

        rec.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        rec.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }

    return () => {
      if (nativeTimeoutRef.current) clearTimeout(nativeTimeoutRef.current)
      if (nativeIntervalRef.current) clearInterval(nativeIntervalRef.current)
    }
  }, [])

  const startListening = () => {
    setInputText('')
    setIsListening(true)
    setShowEmoji(false)

    if (Platform.OS === 'web') {
      if (recognitionRef.current) {
        const langMap = { hi: 'hi-IN', pa: 'pa-IN', mr: 'mr-IN', en: 'en-IN' }
        recognitionRef.current.lang = langMap[i18n.language] || 'hi-IN'
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.error('Speech recognition start failed:', e)
        }
      } else {
        alert('Speech recognition is not supported on this browser.')
        setIsListening(false)
      }
    } else {
      // Mock typing realistic localized queries on native mobile
      const mockQueries = {
        hi: [
          'जाति प्रमाण पत्र कैसे बनेगा?',
          'राशन कार्ड के लिए क्या दस्तावेज चाहिए?',
          'आय प्रमाण पत्र की फीस कितनी है?',
          'निवास प्रमाण पत्र कितने दिन में बनता है?'
        ],
        pa: [
          'ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ ਕਿਵੇਂ ਬਣੇਗਾ?',
          'ਰਾਸ਼ਨ ਕਾਰਡ ਲਈ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ?',
          'ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਦੀ ਫੀਸ ਕਿੰਨੀ ਹੈ?',
          'ਨਿਵਾਸ ਸਰਟੀਫਿਕੇਟ ਕਿੰਨੇ ਦਿਨਾਂ ਵਿੱਚ ਬਣਦਾ ਹੈ?'
        ],
        mr: [
          'जात प्रमाणपत्र कसे बनवायचे?',
          'रेशन कार्डसाठी कोणती कागदपत्रे हवीत?',
          'उत्पन्नाच्या दाखल्याची फी किती आहे?',
          'रहिवासी दाखला किती दिवसात मिळतो?'
        ],
        en: [
          'How to apply for caste certificate?',
          'What documents are needed for ration card?',
          'What is the fee for income certificate?',
          'How many days to get domicile certificate?'
        ]
      }

      const langQueries = mockQueries[i18n.language] || mockQueries.hi
      const randomQuery = langQueries[Math.floor(Math.random() * langQueries.length)]
      
      let words = randomQuery.split(' ')
      let currentWordIndex = 0
      let tempText = ''

      if (nativeIntervalRef.current) clearInterval(nativeIntervalRef.current)
      if (nativeTimeoutRef.current) clearTimeout(nativeTimeoutRef.current)

      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          tempText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex]
          setInputText(tempText)
          currentWordIndex++
        }
      }, 500)

      nativeIntervalRef.current = interval

      nativeTimeoutRef.current = setTimeout(() => {
        clearInterval(interval)
        setIsListening(false)
      }, 3500)
    }
  }

  const stopListening = () => {
    setIsListening(false)
    if (Platform.OS === 'web') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.error(e)
        }
      }
    } else {
      if (nativeTimeoutRef.current) clearTimeout(nativeTimeoutRef.current)
      if (nativeIntervalRef.current) clearInterval(nativeIntervalRef.current)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const rotation = useSharedValue(0)
  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 4000 }), -1, false)
  }, [])

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }))
  
  // Speak text aloud using expo-speech
  const speakText = async (text) => {
    if (!Speech.current) return
    try {
      const isSpeakingNow = await Speech.current.isSpeakingAsync()
      if (isSpeakingNow) {
        await Speech.current.stop()
        setIsSpeaking(false)
        return
      }
      setIsSpeaking(true)
      // Clean text for speech (remove emojis and special chars)
      const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}📋📎🏢⏰💰📅🌐💡📞🤖🙏]/gu, '').trim()
      Speech.current.speak(cleanText, {
        language: 'hi-IN',
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      })
    } catch (e) {
      setIsSpeaking(false)
    }
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { id: Date.now().toString(), text, isUser: true }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputText('')
    setShowEmoji(false)
    setIsTyping(true)

    try {
      // Build message history for API
      const apiMessages = updatedMessages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }))

      const token = await AsyncStorage.getItem('accessToken')
      const userStr = await AsyncStorage.getItem('user')
      let userPincode = '000000'
      if (userStr) {
        try {
          const userData = JSON.parse(userStr)
          if (userData && userData.pincode) {
            userPincode = userData.pincode
          }
        } catch (e) {}
      }

      const response = await fetch(api.defaults.baseURL.replace('/api', '') + '/api/janbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: apiMessages,
          pincode: userPincode
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      // Read SSE stream
      let botText = ''
      const botMsgId = (Date.now() + 1).toString()

      if (response.body && typeof response.body.getReader === 'function') {
        // Web: use ReadableStream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                if (parsed.text) {
                  botText += parsed.text
                  setMessages(prev => {
                    const existing = prev.find(m => m.id === botMsgId)
                    if (existing) {
                      return prev.map(m => m.id === botMsgId ? { ...m, text: botText } : m)
                    }
                    return [...prev, { id: botMsgId, text: botText, isUser: false }]
                  })
                }
              } catch (e) { /* skip parse errors */ }
            }
          }
        }
      } else {
        // React Native: read as text (SSE not natively streamed)
        const text = await response.text()
        const lines = text.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.text) botText += parsed.text
            } catch (e) { /* skip */ }
          }
        }
        setMessages(prev => [...prev, { id: botMsgId, text: botText || 'माफ करें, कोई जवाब नहीं मिला।', isUser: false }])
      }

      setIsTyping(false)
    } catch (err) {
      console.error('JanBot error:', err)
      setIsTyping(false)
      
      let errorMsg = '⚠️ Network error — सर्वर से कनेक्ट नहीं हो पाया। कृपया दोबारा कोशिश करें।'
      if (err.message && err.message.includes('401')) {
        errorMsg = '🔒 Session expired — कृपया लॉग इन करें।'
      }
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        isUser: false
      }])
    }
  }

  const insertEmoji = (emoji) => {
    setInputText(prev => prev + emoji)
  }

  // Quick suggestion chips
  const SUGGESTIONS = [
    '📄 जाति प्रमाण पत्र',
    '💰 आय प्रमाण पत्र',
    '🏠 निवास प्रमाण पत्र',
    '🌾 राशन कार्ड',
    'बिहार सेवाएं',
    'पंजाब सेवाएं'
  ]

  return (
    <>
      {!isOpen && (
        <Pressable 
          className="absolute bottom-24 right-4 w-14 h-14 rounded-full bg-jade items-center justify-center"
          style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)' }}
          onPress={() => setIsOpen(true)}
        >
          <Animated.Text style={starStyle} className="text-2xl text-white">🤖</Animated.Text>
        </Pressable>
      )}

      <Modal visible={isOpen} animationType="slide" transparent={true}>
        <SafeAreaView className="flex-1 justify-end bg-black/40">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-white h-5/6 rounded-t-3xl overflow-hidden" style={{ boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.30)' }}>
            {/* Header */}
            <View className="bg-fog px-6 py-4 flex-row justify-between items-center border-b border-cloud">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-forest">JanBot 🤖</Text>
                <View className="ml-2 bg-jade/20 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] text-jade font-bold">AI</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                {Speech.current && (
                  <Pressable onPress={() => {
                    const lastBotMsg = [...messages].reverse().find(m => !m.isUser)
                    if (lastBotMsg) speakText(lastBotMsg.text)
                  }} className="mr-3">
                    <Text className="text-xl">{isSpeaking ? '🔊' : '🔈'}</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => setIsOpen(false)} className="bg-cloud w-8 h-8 rounded-full items-center justify-center">
                  <Text className="text-slate font-bold font-xl">✕</Text>
                </Pressable>
              </View>
            </View>

            {/* Chat list */}
            <ScrollView 
              ref={scrollRef}
              className="flex-1 p-4"
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.length === 0 && (
                <Animated.View entering={FadeIn} className="items-center justify-center pt-4 pb-6">
                  <Text className="text-6xl mb-4">🤖</Text>
                  <Text className="text-lg font-bold text-forest mb-1">Namaste! Main JanBot hoon</Text>
                  <Text className="text-slate text-center text-sm mb-6">Aapki kya madad kar sakta hoon? Neeche se koi topic chunein ya apna sawal type karein.</Text>
                  
                  {/* Quick Suggestion Chips */}
                  <View className="flex-row flex-wrap justify-center">
                    {SUGGESTIONS.map((s, idx) => (
                      <Pressable 
                        key={idx}
                        onPress={() => sendMessage(s)}
                        className="bg-mintLt border border-jade/30 rounded-full px-4 py-2 m-1"
                      >
                        <Text className="text-jade font-medium text-sm">{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </Animated.View>
              )}

              {messages.map(m => (
                <Animated.View 
                  entering={FadeInUp.duration(300)}
                  key={m.id} 
                  className={`max-w-[85%] rounded-2xl px-4 py-3 mb-3 ${m.isUser ? 'self-end bg-jade rounded-br-none' : 'self-start bg-fog rounded-bl-none'}`}
                >
                  <Text className={`${m.isUser ? 'text-white' : 'text-ink'}`} style={{ lineHeight: 22 }}>{m.text}</Text>
                  {!m.isUser && Speech.current && (
                    <Pressable onPress={() => speakText(m.text)} className="mt-2 self-start">
                      <Text className="text-xs text-slate">🔊 सुनें</Text>
                    </Pressable>
                  )}
                </Animated.View>
              ))}
              
              {isTyping && (
                <View className="self-start bg-fog rounded-2xl rounded-bl-none px-4 py-3 mb-3">
                  <Text className="text-slate font-medium">typing... ✍️</Text>
                </View>
              )}
            </ScrollView>

            {/* Emoji Picker */}
            {showEmoji && (
              <Animated.View entering={FadeIn} className="bg-fog border-t border-cloud" style={{ maxHeight: 220 }}>
                {/* Category Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-cloud">
                  <View className="flex-row p-2">
                    {Object.keys(EMOJI_DATA).map(cat => (
                      <Pressable
                        key={cat}
                        onPress={() => setEmojiCategory(cat)}
                        className={`px-3 py-1.5 rounded-full mr-1 ${emojiCategory === cat ? 'bg-jade' : 'bg-cloud'}`}
                      >
                        <Text className={`text-xs font-bold ${emojiCategory === cat ? 'text-white' : 'text-slate'}`}>{cat}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
                {/* Emoji Grid */}
                <View className="flex-row flex-wrap p-3">
                  {EMOJI_DATA[emojiCategory].map((emoji, i) => (
                    <Pressable key={i} onPress={() => insertEmoji(emoji)} className="w-[16.6%] items-center py-2">
                      <Text className="text-2xl">{emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Listening Overlay */}
            {isListening && (
              <Animated.View 
                entering={FadeIn}
                className="absolute inset-0 bg-white/98 items-center justify-center z-50 px-6"
              >
                <Text className="text-6xl mb-6">🎙️</Text>
                <Text className="text-2xl font-bold text-forest mb-2">
                  {t('janbot.mic.listening')}
                </Text>
                <Text className="text-slate text-center text-sm mb-12">
                  {i18n.language === 'hi' ? 'बोलना शुरू करें, आपका सवाल टाइप हो रहा है...' : 
                   i18n.language === 'pa' ? 'ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ, ਤੁਹਾਡਾ ਸਵਾਲ ਟਾਈਪ ਹੋ ਰਿਹਾ ਹੈ...' :
                   i18n.language === 'mr' ? 'बोलणे सुरू करा, तुमचा प्रश्न टाईप होत आहे...' :
                   'Speak now, your question is being typed...'}
                </Text>

                {/* Animated Waveform */}
                <View className="flex-row items-center justify-center h-16 mb-12">
                  <Animated.View style={barStyle1} className="w-1.5 h-6 bg-jade rounded-full mx-1" />
                  <Animated.View style={barStyle2} className="w-1.5 h-6 bg-jade/80 rounded-full mx-1" />
                  <Animated.View style={barStyle3} className="w-1.5 h-6 bg-jade/60 rounded-full mx-1" />
                  <Animated.View style={barStyle4} className="w-1.5 h-6 bg-jade/80 rounded-full mx-1" />
                  <Animated.View style={barStyle5} className="w-1.5 h-6 bg-jade rounded-full mx-1" />
                </View>

                {/* Live Transcript Preview */}
                {inputText ? (
                  <View className="bg-fog rounded-2xl px-6 py-4 max-w-full mb-10 border border-cloud">
                    <Text className="text-ink text-center font-medium text-base italic">
                      &quot;{inputText}&quot;
                    </Text>
                  </View>
                ) : (
                  <View className="h-14 mb-10" />
                )}

                <Pressable 
                  onPress={stopListening}
                  className="bg-rose-500 active:bg-rose-600 px-8 py-3.5 rounded-full flex-row items-center justify-center"
                  style={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)' }}
                >
                  <Text className="text-white font-bold text-base">{t('janbot.mic.tapStop')}</Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Input */}
            <View className="p-3 bg-white border-t border-cloud">
              <View className="flex-row items-center">
                {/* Emoji Toggle */}
                <Pressable 
                  onPress={() => setShowEmoji(!showEmoji)}
                  className="w-10 h-10 items-center justify-center"
                >
                  <Text className="text-xl">{showEmoji ? '⌨️' : '😀'}</Text>
                </Pressable>

                {/* Text Input */}
                <TextInput
                  className="flex-1 bg-fog rounded-full px-5 py-3 text-ink font-medium ml-2 mr-1"
                  placeholder={isListening ? t('janbot.mic.placeholder') : "Ask JanBot... 🤖"}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => sendMessage(inputText)}
                  onFocus={() => setShowEmoji(false)}
                  editable={!isListening}
                />

                {/* Mic Button */}
                <Pressable 
                  onPress={toggleListening}
                  className={`w-10 h-10 items-center justify-center rounded-full mr-1 ${isListening ? 'bg-rose-100' : 'bg-cloud'}`}
                >
                  <Text className="text-xl">{isListening ? '🛑' : '🎤'}</Text>
                </Pressable>

                {/* Send Button */}
                <Pressable 
                  onPress={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping || isListening}
                  className={`w-11 h-11 rounded-full items-center justify-center ${inputText.trim() && !isTyping && !isListening ? 'bg-jade' : 'bg-cloud'}`}
                  style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.10)' }}
                >
                  <Text className="text-white font-bold text-lg">↑</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  )
}
