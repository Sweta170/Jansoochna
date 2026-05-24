import React, { useState, useEffect, useContext } from 'react'
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { FadeIn, SlideInDown, withSpring, useSharedValue, useAnimatedStyle, BounceIn } from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import { AuthContext } from '../../context/AuthContext'
import api from '../../services/api'

let MapView, Marker;
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const uriToBase64 = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const CATEGORIES = [
  { id: 'road', icon: '🛣️', label: 'सड़क (Road)' },
  { id: 'water', icon: '🚰', label: 'पानी (Water)' },
  { id: 'electricity', icon: '⚡', label: 'बिजली (Power)' },
  { id: 'garbage', icon: '🗑️', label: 'कचरा (Garbage)' },
  { id: 'drainage', icon: '🌧️', label: 'नाली (Drain)' },
  { id: 'parks', icon: '🌳', label: 'पार्क (Park)' },
  { id: 'streetlight', icon: '💡', label: 'स्ट्रीट लाइट' },
  { id: 'other', icon: '❓', label: 'अन्य (Other)' }
]

export default function ReportIssueScreen() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Category, 2: Details, 3: Photo, 4: Location, 5: Success
  const { user } = useContext(AuthContext)
  const [category, setCategory] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [imageUri, setImageUri] = useState(null)
  const [location, setLocation] = useState(null)
  
  const [address, setAddress] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setStep(4)
    }
  }

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    })
    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setStep(4)
    }
  }

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return
    let loc = await Location.getCurrentPositionAsync({})
    setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude })
  }

  const reverseGeocode = async (lat, lng) => {
    setAddressLoading(true)
    try {
      let geo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
      if (geo && geo.length > 0) {
        const g = geo[0]
        const addressParts = []
        if (g.name) addressParts.push(g.name)
        if (g.street) addressParts.push(g.street)
        if (g.district) addressParts.push(g.district)
        if (g.city) addressParts.push(g.city)
        if (g.region) addressParts.push(g.region)
        setAddress(addressParts.join(', '))
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
      }
    } catch (err) {
      console.warn('Reverse geocoding failed', err)
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } finally {
      setAddressLoading(false)
    }
  }

  useEffect(() => {
    if (location) {
      reverseGeocode(location.lat, location.lng)
    }
  }, [location])

  useEffect(() => {
    if (step === 4 && !location) {
      fetchLocation()
    }
  }, [step])

  const submitIssue = async () => {
    if (!location) return
    setSubmitLoading(true)
    setSubmitError('')
    try {
      let photoBase64 = null
      if (imageUri) {
        photoBase64 = await uriToBase64(imageUri)
      }

      await api.post('/issues', {
        title,
        description: desc,
        category,
        lat: location.lat,
        lng: location.lng,
        pincode: user?.pincode,
        address: address || 'Unknown Location',
        photoBase64: photoBase64 || undefined
      })

      setStep(5) // Show success
    } catch (err) {
      console.error('Submit issue error:', err)
      setSubmitError(err.response?.data?.error || 'Issue report karne mein problem aayi.')
    } finally {
      setSubmitLoading(false)
    }
  }

  // Success Screen
  if (step === 5) {
    return (
      <View className="flex-1 bg-jade items-center justify-center p-8">
        <Animated.Text entering={BounceIn} className="text-8xl mb-8">🙌</Animated.Text>
        <Animated.Text entering={FadeIn.delay(300)} className="text-4xl font-extrabold text-white text-center mb-2">शुक्रिया!</Animated.Text>
        <Animated.Text entering={FadeIn.delay(500)} className="text-xl text-mintLt text-center mb-12">आपकी आवाज़ दर्ज हो गई</Animated.Text>
        
        <Animated.View entering={SlideInDown.springify().delay(800)} className="bg-white/20 px-6 py-3 rounded-full flex-row items-center border border-white/30">
          <Text className="text-white font-bold text-lg">⭐ +20 अंक मिले!</Text>
        </Animated.View>

        <Pressable onPress={() => router.back()} className="absolute bottom-12 bg-white px-8 py-4 rounded-full shadow-lg">
          <Text className="text-forest font-bold text-lg">घर जाएं (Go Home)</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-cloud">
        <Pressable onPress={() => { step > 1 ? setStep(step - 1) : router.back() }} className="w-10 h-10 items-center justify-center">
          <Text className="text-2xl text-slate">{step > 1 ? '←' : '✕'}</Text>
        </Pressable>
        <View className="flex-row space-x-1">
          {[1,2,3,4].map(s => (
            <View key={s} className={`w-8 h-2 rounded-full ${s === step ? 'bg-jade' : (s < step ? 'bg-mint' : 'bg-cloud')}`} />
          ))}
        </View>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
          
          {step === 1 && (
            <Animated.View entering={FadeIn}>
              <Text className="text-3xl font-extrabold text-ink mb-8">क्या हुआ है? (Category)</Text>
              <View className="flex-row flex-wrap justify-between">
                {CATEGORIES.map(cat => (
                  <Pressable 
                    key={cat.id} 
                    onPress={() => setCategory(cat.id)}
                    className={`w-[48%] bg-fog rounded-2xl p-4 items-center justify-center mb-4 border-2 ${category === cat.id ? 'border-jade bg-mintLt' : 'border-transparent'}`}
                  >
                    <Text className="text-4xl mb-2">{cat.icon}</Text>
                    <Text className={`font-bold text-center ${category === cat.id ? 'text-jade' : 'text-slate'}`}>{cat.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable 
                onPress={() => setStep(2)}
                disabled={!category}
                className={`mt-6 py-4 rounded-xl items-center ${category ? 'bg-jade' : 'bg-cloud'}`}
              >
                <Text className={`font-bold text-lg ${category ? 'text-white' : 'text-mist'}`}>Next</Text>
              </Pressable>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeIn} className="flex-1">
              <Text className="text-3xl font-extrabold text-ink mb-8">विस्तार से बताएं (Details)</Text>
              
              <Text className="font-bold text-slate mb-2">समस्या का नाम (Short Title)</Text>
              <TextInput 
                className="bg-fog p-4 rounded-xl text-lg font-medium text-ink mb-6"
                placeholder="Pothole on Main St"
                value={title} onChangeText={setTitle}
              />

              <Text className="font-bold text-slate mb-2">पूरी जानकारी (Description)</Text>
              <TextInput 
                className="bg-fog p-4 rounded-xl text-base text-ink min-h-[120px]"
                placeholder="Explain the issue in detail (min 30 chars)..."
                multiline textAlignVertical="top"
                value={desc} onChangeText={setDesc}
              />
              <Text className={`text-right text-xs mt-1 ${desc.length >= 30 ? 'text-jade' : 'text-crimson'}`}>
                {desc.length}/30 chars
              </Text>

              <View className="flex-1 justify-end">
                <Pressable 
                  onPress={() => setStep(3)}
                  disabled={!title || desc.length < 30}
                  className={`mt-8 py-4 rounded-xl items-center ${title && desc.length >= 30 ? 'bg-jade' : 'bg-cloud'}`}
                >
                  <Text className={`font-bold text-lg ${title && desc.length >= 30 ? 'text-white' : 'text-mist'}`}>Next</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {step === 3 && (
            <Animated.View entering={FadeIn} className="flex-1 items-center justify-center">
              <Text className="text-3xl font-extrabold text-ink mb-8 text-center">तस्वीर जोड़ें (Photo)</Text>
              <View className="flex-row space-x-4 mb-12">
                <Pressable onPress={takePhoto} className="w-32 h-32 bg-fog rounded-2xl items-center justify-center border border-cloud shadow-sm">
                  <Text className="text-4xl mb-2">📷</Text>
                  <Text className="font-bold text-slate">Camera</Text>
                </Pressable>
                <Pressable onPress={pickImage} className="w-32 h-32 bg-fog rounded-2xl items-center justify-center border border-cloud shadow-sm">
                  <Text className="text-4xl mb-2">🖼️</Text>
                  <Text className="font-bold text-slate">Gallery</Text>
                </Pressable>
              </View>

              <Pressable onPress={() => setStep(4)} className="py-3 px-8 rounded-full border border-cloud">
                <Text className="font-bold text-slate">Skip this step</Text>
              </Pressable>
            </Animated.View>
          )}

          {step === 4 && (
            <Animated.View entering={FadeIn} className="flex-1">
              <Text className="text-3xl font-extrabold text-ink mb-4">जगह (Location)</Text>
              
              <View className="rounded-2xl overflow-hidden border border-cloud mb-4 min-h-[250px]" style={{ height: 250 }}>
                {location && Platform.OS !== 'web' ? (
                  <MapView 
                    style={{ flex: 1 }}
                    initialRegion={{ latitude: location.lat, longitude: location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                  >
                    <Marker 
                      coordinate={{ latitude: location.lat, longitude: location.lng }} 
                      draggable 
                      onDragEnd={(e) => {
                        const coords = e.nativeEvent.coordinate;
                        setLocation({ lat: coords.latitude, lng: coords.longitude });
                      }}
                    />
                  </MapView>
                ) : location && Platform.OS === 'web' ? (
                  <View className="flex-1 bg-fog items-center justify-center">
                    <Text className="text-slate font-medium">Map available on mobile app</Text>
                  </View>
                ) : (
                  <View className="flex-1 bg-fog items-center justify-center">
                    <Pressable onPress={fetchLocation} className="bg-white px-6 py-3 rounded-full shadow-sm">
                      <Text className="font-bold text-forest">📍 मेरी जगह पता करो</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Info card containing photo preview, pincode and address */}
              {location && (
                <View className="bg-fog p-4 rounded-2xl border border-cloud mb-4">
                  {imageUri && (
                    <View className="flex-row items-center mb-3 pb-3 border-b border-cloud/50">
                      <Image source={{ uri: imageUri }} className="w-12 h-12 rounded-lg mr-3" />
                      <View className="flex-1">
                        <Text className="text-slate text-xs font-bold uppercase tracking-wide">Photo Selected</Text>
                        <Pressable onPress={() => setImageUri(null)}>
                          <Text className="text-rose-500 text-xs font-bold">Remove Photo</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-cloud/50">
                    <Text className="text-slate text-xs font-bold uppercase tracking-wide">Pincode:</Text>
                    <Text className="font-extrabold text-forest text-sm">
                      {user?.pincode || 'Not Set'} (Registered)
                    </Text>
                  </View>

                  <Text className="text-slate text-xs font-bold uppercase tracking-wide mb-1">Address:</Text>
                  {addressLoading ? (
                    <ActivityIndicator size="small" color="#1D9E75" className="self-start" />
                  ) : (
                    <Text className="font-semibold text-ink text-[13px] leading-5">{address || 'Locating pin address...'}</Text>
                  )}
                </View>
              )}

              {submitError ? (
                <Text className="text-rose-500 font-bold text-center mb-4">{submitError}</Text>
              ) : null}

              <Pressable 
                onPress={submitIssue}
                disabled={!location || submitLoading}
                className={`py-4 rounded-xl items-center shadow-md flex-row justify-center ${location && !submitLoading ? 'bg-jade' : 'bg-cloud'}`}
              >
                {submitLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                ) : null}
                <Text className={`font-bold text-lg ${location && !submitLoading ? 'text-white' : 'text-mist'}`}>
                  {submitLoading ? 'दर्ज हो रहा है...' : 'दर्ज करें (Submit)'}
                </Text>
              </Pressable>
            </Animated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
