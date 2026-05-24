import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, RotateCcw, AlertTriangle, Mic, MicOff } from 'lucide-react'
import useAuth from '../hooks/useAuth'

const JanBot = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [dailyCount, setDailyCount] = useState(0)
  
  // Speech Recognition States
  const [isListening, setIsListening] = useState(false)
  const [micLang, setMicLang] = useState('hi-IN')
  const [hasMicSupport, setHasMicSupport] = useState(false)
  const recognitionRef = useRef(null)
  
  const chatEndRef = useRef(null)

  const suggestedPrompts = [
    "मुझे जाति प्रमाण पत्र बनवाना है",
    "मेरे मोहल्ले में कोई समस्या report करनी है",
    "ration card ke liye kya chahiye?"
  ]

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isStreaming])

  // Load count from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('janbot_daily_count')
    const savedDate = localStorage.getItem('janbot_daily_date')
    const today = new Date().toDateString()
    
    if (savedDate === today) {
      setDailyCount(parseInt(saved || '0'))
    } else {
      localStorage.setItem('janbot_daily_date', today)
      localStorage.setItem('janbot_daily_count', '0')
      setDailyCount(0)
    }
  }, [isOpen])

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      
      rec.onstart = () => {
        setIsListening(true)
      }
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => (prev ? prev + ' ' + transcript : transcript))
      }
      
      rec.onerror = (event) => {
        console.error('Speech recognition error', event)
        setIsListening(false)
      }
      
      rec.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current = rec
      setHasMicSupport(true)
    }
  }, [])

  // Update voice language when micLang changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = micLang
    }
  }, [micLang])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.lang = micLang
        recognitionRef.current.start()
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || isStreaming) return

    if (dailyCount >= 20) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: query },
        { role: 'assistant', content: 'Apka JanBot daily limit (20 sawal) poora ho chuka hai. Kripya kal dobara koshish karein!' }
      ])
      setInput('')
      return
    }

    // Stop listening if we send a message
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }

    // Update count
    const nextCount = dailyCount + 1
    setDailyCount(nextCount)
    localStorage.setItem('janbot_daily_count', nextCount.toString())

    const newMessages = [...messages, { role: 'user', content: query }]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    // Setup dummy/placeholder response
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/janbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.__JAN_ACCESS_TOKEN__}`
        },
        body: JSON.stringify({
          messages: newMessages,
          pincode: user?.pincode
        })
      })

      if (!response.ok) {
        throw new Error('Streaming failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let streamedText = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunk = decoder.decode(value, { stream: !done })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim()
              if (jsonStr === '[DONE]') {
                done = true
                break
              }
              try {
                const parsed = JSON.parse(jsonStr)
                if (parsed.text) {
                  streamedText += parsed.text
                  setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: streamedText
                    }
                    return updated
                  })
                }
              } catch (e) {
                // Ignore parse errors for incomplete lines
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Maaf kijiye, abhi server se connect nahi ho pa raha hai. Kripya thodi der baad try karein!'
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const resetChat = () => {
    setMessages([])
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 bg-jan-green hover:bg-jan-green-dk text-white p-3.5 rounded-full shadow-2xl z-40 transition-transform transform active:scale-90 hover:scale-105 flex items-center justify-center border-2 border-white"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Slide-up / Modal Panel */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-0 bg-black bg-opacity-40 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl h-[85vh] flex flex-col shadow-2xl relative animate-slide-up">
            
            {/* Top Bar */}
            <div className="bg-jan-green text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* SVG Teal Avatar */}
                <div className="w-8 h-8 rounded-full bg-teal-200 border-2 border-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-jan-green-dk" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none font-mukta">JanBot AI</h3>
                  <span className="text-[10px] opacity-90">Civic Sahayak</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  className="p-1 rounded hover:bg-jan-green-dk transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-jan-green-dk transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Daily Limit Bar */}
            <div className="bg-jan-green-lt text-[11px] text-jan-green-dk px-4 py-1.5 flex items-center justify-between border-b border-jan-border">
              <span>Limit: 20 sawaal roz</span>
              <span className="font-semibold">{dailyCount}/20 completed</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4 my-4">
                  <div className="bg-jan-surface p-4 rounded-xl border border-jan-border text-sm text-jan-muted leading-relaxed">
                    <p className="font-semibold text-jan-text mb-1">🙏 Ram Ram / Sat Sri Akal!</p>
                    Main JanBot hu, aapka local civic helper. Main form guide, ration card, caste certificate ya mohalla board issues ke baare mein jankari de sakta hu.
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-jan-muted uppercase tracking-wider">Suggested queries:</p>
                    {suggestedPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(p)}
                        className="w-full text-left bg-white hover:bg-jan-surface text-jan-text border border-jan-border p-3 rounded-lg text-sm transition-all hover:border-jan-green active:bg-jan-green-lt"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'bg-jan-green text-white rounded-br-none'
                        : 'bg-gray-100 text-jan-text rounded-bl-none border border-jan-border'
                    }`}
                  >
                    {m.content === '' && isStreaming ? (
                      <div className="flex items-center gap-1 py-1">
                        <div className="w-1.5 h-1.5 bg-jan-muted rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-jan-muted rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-jan-muted rounded-full animate-bounce delay-200"></div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-jan-border bg-white flex flex-col gap-2">
              {/* Voice Language Selector */}
              {hasMicSupport && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-jan-muted uppercase tracking-wider">Voice Language:</span>
                  <div className="flex gap-1.5">
                    {[
                      { code: 'hi-IN', label: 'हिन्दी' },
                      { code: 'pa-IN', label: 'ਪੰਜਾਬੀ' },
                      { code: 'en-IN', label: 'English' }
                    ].map((lang) => {
                      const active = micLang === lang.code
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setMicLang(lang.code)}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                            active
                              ? 'bg-jan-green-lt border-jan-green text-jan-green-dk'
                              : 'bg-gray-50 border-gray-200 text-jan-muted hover:bg-gray-100'
                          }`}
                        >
                          {lang.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Voice Input Mic Button */}
                {hasMicSupport && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={isStreaming}
                    className={`p-2 rounded-full transition-all flex items-center justify-center relative active:scale-95 ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        : 'bg-gray-100 text-jan-muted hover:bg-gray-200'
                    }`}
                    title={isListening ? 'Bolna band karein' : 'Awaaz se likhein'}
                  >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    {isListening && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    )}
                  </button>
                )}

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? 'Boliye, main sunn raha hu...' : 'Apna sawaal likhein...'}
                  disabled={isStreaming}
                  className="flex-1 border border-jan-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-jan-green disabled:bg-jan-surface"
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={isStreaming || !input.trim()}
                  className="bg-jan-green hover:bg-jan-green-dk text-white p-2 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default JanBot
