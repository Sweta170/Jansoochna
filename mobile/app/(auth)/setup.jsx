import React, { useState, useContext } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../../services/api'
import { AuthContext } from '../../context/AuthContext'

export default function SetupScreen() {
  const router = useRouter()
  const { login } = useContext(AuthContext)
  const { email, phone, otp } = useLocalSearchParams()
  
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [ward, setWard] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [pincodeStatus, setPincodeStatus] = useState('idle') // 'idle' | 'loading' | 'found' | 'notfound'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lookupPincodeData = async (pin) => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) return
    setPincodeStatus('loading')
    setError('')
    try {
      const res = await api.get(`/auth/lookup-pincode?pincode=${pin}`)
      if (res.data) {
        setState(res.data.state || '')
        setDistrict(res.data.district || '')
        setCity(res.data.city || '')
        setPincodeStatus('found')
      } else {
        setPincodeStatus('notfound')
      }
    } catch (err) {
      console.log('Pincode lookup error:', err)
      setPincodeStatus('notfound')
      setError('Pincode check karne mein error aayi, manually enter karein')
    }
  }

  const handlePincodeChange = (text) => {
    const cleaned = text.replace(/\D/g, '')
    setPincode(cleaned)
    if (cleaned.length === 6) {
      lookupPincodeData(cleaned)
    } else {
      setPincodeStatus('idle')
    }
  }

  const isValid = name.trim().length > 2 && state.trim().length > 2 && pincode.length === 6 && district.trim().length > 2

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        email,
        otp,
        name: name.trim(),
        state: state.trim(),
        pincode,
        district: district.trim(),
        ward: ward.trim(),
        city: city.trim() || district.trim()
      }
      if (phone && phone !== 'undefined') {
        payload.phone = phone
      }
      const response = await api.post('/auth/verify-otp', payload)
      await login(response.data.user, response.data.accessToken, response.data.refreshToken)
      router.replace('/(app)')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 32, flexGrow: 1, justifyContent: 'center' }}>
          
          <Text className="text-3xl font-extrabold text-ink mb-8">आपका परिचय?</Text>

          <View className="mb-6">
            <Text className="text-slate font-bold mb-2">Pura Naam (Full Name)</Text>
            <TextInput
              className="bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink"
              placeholder="Ramesh Kumar"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate font-bold mb-2">Pincode</Text>
            <TextInput
              className="bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink"
              placeholder="110001"
              keyboardType="number-pad"
              maxLength={6}
              value={pincode}
              onChangeText={handlePincodeChange}
              onBlur={() => {
                if (pincode.length === 6) {
                  lookupPincodeData(pincode)
                }
              }}
            />
            {pincodeStatus === 'loading' && (
              <Text className="text-jade font-medium mt-1">Pincode check kar rahe hain...</Text>
            )}
            {pincodeStatus === 'found' && (
              <Text className="text-jade font-medium mt-1">📍 Location auto-detect ho gayi!</Text>
            )}
            {pincodeStatus === 'notfound' && (
              <Text className="text-crimson font-medium mt-1">⚠️ Pincode nahi mila. Manually bharein.</Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-slate font-bold mb-2">Rajya (State)</Text>
            <TextInput
              className="bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink"
              placeholder="Punjab, Bihar, etc."
              value={state}
              onChangeText={setState}
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate font-bold mb-2">Zila (District)</Text>
            <TextInput
              className="bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink"
              placeholder="Patna, Kapurthala, etc."
              value={district}
              onChangeText={setDistrict}
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate font-bold mb-2">Ward / Area (optional)</Text>
            <TextInput
              className="bg-fog rounded-xl px-4 py-4 text-lg font-medium text-ink"
              placeholder="e.g. Ward 12"
              value={ward}
              onChangeText={setWard}
            />
          </View>

          {(state || district || city) && (
            <View className="bg-emerald-50 border border-emerald-200 rounded-[16px] p-4 mb-6">
              <Text className="text-emerald-800 font-bold mb-1 text-xs uppercase tracking-wider">📍 Aapka Area:</Text>
              <Text className="text-emerald-950 font-semibold text-sm">
                {[ward, city || district, district, state, pincode].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
              </Text>
            </View>
          )}

          {error ? <Text className="text-crimson font-medium text-center mb-4">{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || loading}
            className={`py-4 rounded-xl items-center shadow-sm ${isValid ? 'bg-jade' : 'bg-cloud'}`}
          >
            <Text className={`text-lg font-bold ${isValid ? 'text-white' : 'text-mist'}`}>
              {loading ? 'Wait karein...' : 'JanSoochna शुरू करें'}
            </Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
