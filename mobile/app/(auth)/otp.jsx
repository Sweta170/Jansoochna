import React, { useState, useRef, useEffect, useContext } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withDelay } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../../services/api'
import { AuthContext } from '../../context/AuthContext'

export default function OTPScreen() {
  const router = useRouter()
  const { login } = useContext(AuthContext)
  const { email, phone, maskedEmail, isNewUser } = useLocalSearchParams()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(60)
  const [lockoutInfo, setLockoutInfo] = useState(null)
  const [attemptsLeft, setAttemptsLeft] = useState(null)
  
  const inputRefs = useRef([])
  const shakeOffset = useSharedValue(0)

  // Lockout countdown timer:
  useEffect(() => {
    if (!lockoutInfo?.minutesLeft) return
    const timerId = setInterval(() => {
      setLockoutInfo(prev => {
        if (!prev) return null
        const next = prev.minutesLeft - 1
        return next <= 0 ? null : { ...prev, minutesLeft: next }
      })
    }, 60000)
    return () => clearInterval(timerId)
  }, [lockoutInfo?.minutesLeft])

  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const shakeAnimation = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }]
  }))

  const handleChange = (text, index) => {
    if (text.length > 1) {
      text = text[text.length - 1]
    }
    const newOtp = [...otp]
    newOtp[index] = text
    setOtp(newOtp)
    setError('')

    // Auto focus next
    if (text && index < 5) {
      inputRefs.current[index + 1].focus()
    }
    // Auto submit
    if (text && index === 5) {
      const fullOtp = newOtp.join('')
      if (fullOtp.length === 6) {
        verifyOTP(fullOtp)
      }
    }
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const verifyOTP = async (fullOtp) => {
    setLoading(true)
    setError('')
    try {
      if (isNewUser === 'true') {
        // If new user, we need setup first. Let's pass OTP to setup screen.
        router.push({
          pathname: '/(auth)/setup',
          params: { email, phone, otp: fullOtp }
        })
      } else {
        // Existing user, verify and login immediately
        const response = await api.post('/auth/verify-otp', { email, otp: fullOtp })
        await login(response.data.user, response.data.accessToken, response.data.refreshToken)
        router.replace('/(app)')
      }
    } catch (err) {
      const data = err.response?.data
      const status = err.response?.status

      if (status === 429) {
        setLockoutInfo({
          minutesLeft: data.minutesLeft,
          isHardLock: data.isHardLock,
          message: data.message || 'Too many failed attempts.',
        })
        setOtp(['', '', '', '', '', ''])
      } else {
        if (data?.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft)
          setError(`${data.message || 'Invalid OTP'} (${data.attemptsLeft} मौका बचा है)`)
        } else {
          setError(data?.message || 'Invalid OTP')
        }
        shakeOffset.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(0, { duration: 50 })
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setTimer(60)
    setError('')
    setAttemptsLeft(null)
    try {
      await api.post('/auth/send-otp', { email, phone })
    } catch (err) {
      const data = err.response?.data
      const status = err.response?.status
      if (status === 429) {
        setLockoutInfo({
          minutesLeft: data.minutesLeft,
          isHardLock: data.isHardLock,
          message: data.message || 'Too many failed attempts.',
        })
        setError('')
      } else {
        setError('Resend failed. Try again.')
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-8">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 mt-10">
        
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-ink mb-2">OTP आया?</Text>
          <Text className="text-slate font-medium text-base">OTP bheja gaya: {maskedEmail}</Text>
        </View>

        {lockoutInfo ? (
          <View className="bg-[#FDF0E6] rounded-2xl p-6 items-center border-[0.5px] border-[#F0C070] my-4" style={{
            backgroundColor: lockoutInfo.isHardLock ? '#FCEBEB' : '#FDF0E6',
            borderColor: lockoutInfo.isHardLock ? '#F09595' : '#F0C070'
          }}>
            <Text className="text-3xl mb-3">
              {lockoutInfo.isHardLock ? '🔒' : '⏳'}
            </Text>
            <Text className="text-[15px] font-semibold text-[#854F0B] text-center mb-2" style={{
              color: lockoutInfo.isHardLock ? '#A32D2D' : '#854F0B'
            }}>
              {lockoutInfo.message}
            </Text>
            {lockoutInfo.minutesLeft > 0 ? (
              <Text className="text-[13px] text-[#E07B2A]" style={{
                color: lockoutInfo.isHardLock ? '#C0392B' : '#E07B2A'
              }}>
                {lockoutInfo.minutesLeft} मिनट बाद unlock होगा
              </Text>
            ) : null}
            {lockoutInfo.isHardLock ? (
              <Text className="text-xs text-[#A8B5AD] mt-2 text-center">
                Support के लिए hello@jansoochna.in पर email करें
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <Animated.View style={shakeAnimation} className="flex-row justify-between mb-8">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  className={`w-12 h-14 bg-fog border-2 text-center text-2xl font-bold rounded-xl text-ink ${error ? 'border-crimson bg-crimsonLt' : (digit ? 'border-jade bg-mintLt' : 'border-cloud')}`}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  selectTextOnFocus
                />
              ))}
            </Animated.View>

            {error ? (
              <Text className="text-crimson text-center font-medium mb-4">{error}</Text>
            ) : null}
          </>
        )}

        {/* Attempts remaining warning */}
        {attemptsLeft !== null && !lockoutInfo ? (
          <View className="bg-[#FDF0E6] border-[0.5px] border-[#F0C070] rounded-lg p-3.5 my-2">
            <Text className="text-[13px] text-[#854F0B] text-center font-medium">
              ⚠️ {attemptsLeft} और मौका बचा है
            </Text>
          </View>
        ) : null}

        <Text className="text-center text-mist font-medium mt-4">
          Email nahi mili? Spam/Junk folder check karein 📂
        </Text>

        {!lockoutInfo ? (
          <View className="items-center mt-12">
            {timer > 0 ? (
              <Text className="text-slate font-medium">{timer} सेकंड में दोबारा भेजें</Text>
            ) : (
              <Pressable onPress={handleResend}>
                <Text className="text-jade font-bold underline">दोबारा OTP भेजें</Text>
              </Pressable>
            )}
          </View>
        ) : null}
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
