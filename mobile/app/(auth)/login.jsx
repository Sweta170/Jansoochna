import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function LoginScreen() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPhoneValid = phone.length === 0 || phone.length === 10

  const btnScale = useSharedValue(1)

  const handlePressIn = () => {
    btnScale.value = withSpring(0.96)
  }
  const handlePressOut = () => {
    btnScale.value = withSpring(1)
  }

  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }]
  }))

  const changeLanguage = async (lang) => {
    i18n.changeLanguage(lang)
    try {
      await AsyncStorage.setItem('appLanguage', lang)
    } catch (e) {
      console.log('Error saving language', e)
    }
  }

  const handleSendOTP = async () => {
    if (!isEmailValid) {
      setError('Sahi email enter karein')
      return
    }
    if (!isPhoneValid) {
      setError('Phone number 10 digits ka hona chahiye')
      return
    }
    setError('')
    setLoading(true)
    try {
      const payload = { email }
      if (phone) payload.phone = phone
      const response = await api.post('/auth/send-otp', payload)
      
      router.push({
        pathname: '/(auth)/otp',
        params: { email, phone, maskedEmail: response.data.maskedEmail, isNewUser: response.data.isNewUser ? 'true' : 'false' }
      })
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}>
          
          <View className="p-8 mt-10">
            {/* Header */}
            <View className="items-center mb-12">
              <Text className="text-forest font-extrabold text-3xl tracking-tighter">JanSoochna</Text>
              <Text className="text-slate font-medium text-sm mt-1">भारत का नागरिक मंच</Text>
            </View>

            {/* Inputs */}
            <View className="mb-6">
              <Text className="text-charcoal font-bold text-lg mb-2">Email Address <Text className="text-crimson">*</Text></Text>
              <TextInput
                className={`bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink border ${error ? 'border-crimson' : (isEmailValid ? 'border-jade' : 'border-transparent')}`}
                placeholder="aapka@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(val) => { setEmail(val); setError(''); }}
              />
            </View>

            <View className="mb-8">
              <Text className="text-slate font-medium mb-2">📱 WhatsApp number (optional)</Text>
              <TextInput
                className="bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink border border-transparent"
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {error ? (
              <Text className="text-crimson text-sm mb-4 text-center">{error}</Text>
            ) : null}

            {/* Submit Button */}
            <Animated.View style={animatedBtnStyle}>
              <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleSendOTP}
                disabled={!isEmailValid || !isPhoneValid || loading}
                className={`py-4 rounded-xl items-center shadow-sm ${(isEmailValid && isPhoneValid) ? 'bg-jade' : 'bg-cloud'}`}
              >
                <Text className={`text-lg font-bold ${(isEmailValid && isPhoneValid) ? 'text-white' : 'text-mist'}`}>
                  {loading ? 'Bhej rahe hain...' : 'OTP भेजें'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          {/* Language Selector Footer */}
          <View className="flex-row justify-center py-8 space-x-4 border-t border-cloud bg-fog">
            {['hi', 'pa', 'mr', 'en'].map(lang => (
              <Pressable key={lang} onPress={() => changeLanguage(lang)}>
                <Text className={`text-sm ${i18n.language === lang ? 'text-jade font-bold underline' : 'text-slate'}`}>
                  {lang === 'hi' ? 'हिंदी' : lang === 'pa' ? 'ਪੰਜਾਬी' : lang === 'mr' ? 'मराठी' : 'English'}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
