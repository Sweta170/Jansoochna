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
  
  const inputRefs = useRef([])
  const shakeOffset = useSharedValue(0)

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
      setError(err.response?.data?.message || 'Invalid OTP')
      shakeOffset.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setTimer(60)
    setError('')
    try {
      await api.post('/auth/send-otp', { email, phone })
    } catch (err) {
      setError('Resend failed. Try again.')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-8">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 mt-10">
        
        <View className="mb-10">
          <Text className="text-3xl font-extrabold text-ink mb-2">OTP आया?</Text>
          <Text className="text-slate font-medium text-base">OTP bheja gaya: {maskedEmail}</Text>
        </View>

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

        <Text className="text-center text-mist font-medium mt-4">
          Email nahi mili? Spam/Junk folder check karein 📂
        </Text>

        <View className="items-center mt-12">
          {timer > 0 ? (
            <Text className="text-slate font-medium">{timer} सेकंड में दोबारा भेजें</Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text className="text-jade font-bold underline">दोबारा OTP भेजें</Text>
            </Pressable>
          )}
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
