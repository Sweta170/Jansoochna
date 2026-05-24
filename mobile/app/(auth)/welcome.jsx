import React, { useState } from 'react'
import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeIn, FadeInDown, withSpring, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const SLIDES = [
  {
    key: 'A',
    title: 'जन की आवाज़',
    subtitle: 'Your city. Your voice.',
    bg: 'bg-forest',
    textColor: 'text-white',
    subColor: 'text-white/70',
    icon: '🏙️'
  },
  {
    key: 'B',
    title: 'हर समस्या दर्ज करें',
    subtitle: 'Take a photo, pin the location, and report civic issues in 2 minutes',
    bg: 'bg-white',
    textColor: 'text-jade',
    subColor: 'text-slate',
    icon: '📸'
  },
  {
    key: 'C',
    title: 'सरकारी काम आसान',
    subtitle: 'Get exact document checklists for any government certificate — free',
    bg: 'bg-white',
    textColor: 'text-forest',
    subColor: 'text-slate',
    icon: '📄'
  }
]

export default function WelcomeScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simple pulse animation for CTA button
  const scale = useSharedValue(1)
  React.useEffect(() => {
    scale.value = withRepeat(withSequence(
      withTiming(1.04, { duration: 1000 }),
      withTiming(1, { duration: 1000 })
    ), -1, true)
  }, [])

  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }))

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      router.push('/(auth)/login')
    }
  }

  const slide = SLIDES[currentIndex]

  return (
    <SafeAreaView className={`flex-1 ${slide.bg}`}>
      
      {/* Skip Button */}
      {currentIndex < SLIDES.length - 1 && (
        <View className="flex-row justify-end p-4">
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className={`${slide.subColor} text-base font-medium`}>Skip</Text>
          </Pressable>
        </View>
      )}

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View entering={FadeInDown.duration(600)} className="mb-10 items-center justify-center h-48 w-48 rounded-full bg-black/5">
          <Text className="text-8xl">{slide.icon}</Text>
        </Animated.View>
        
        <Animated.Text entering={FadeIn.delay(200)} className={`${slide.textColor} text-4xl font-extrabold text-center mb-2`}>
          {slide.title}
        </Animated.Text>
        
        <Animated.Text entering={FadeIn.delay(400)} className={`${slide.subColor} text-base text-center`}>
          {slide.subtitle}
        </Animated.Text>
      </View>

      {/* Footer */}
      <View className="p-8 pb-12">
        {/* Dots */}
        <View className="flex-row justify-center mb-8 space-x-2">
          {SLIDES.map((_, i) => (
            <View key={i} className={`h-2 rounded-full ${i === currentIndex ? 'w-6 bg-jade' : 'w-2 bg-cloud'}`} />
          ))}
        </View>

        {/* CTA */}
        {currentIndex === SLIDES.length - 1 ? (
          <Animated.View style={animatedBtnStyle}>
            <Pressable 
              onPress={nextSlide} 
              className="bg-jade py-4 rounded-full items-center shadow-lg"
            >
              <Text className="text-white text-lg font-bold">शुरू करें (Get Started)</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable 
            onPress={nextSlide} 
            className="bg-jade/10 py-4 rounded-full items-center border border-jade/20"
          >
            <Text className="text-jade text-lg font-bold">Next</Text>
          </Pressable>
        )}
      </View>

    </SafeAreaView>
  )
}
