import React, { useState, useRef } from 'react'
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Carousel from 'react-native-reanimated-carousel'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import FeatureSlide from '../../components/landing/FeatureSlide'
import { landingColors } from '../../theme/colors'

const slides = [
  {
    id: 1,
    bg: '#0A3D24',           // forest
    accentColor: '#1D9E75',  // jade
    emoji: '🏘️',
    titleHindi: 'मोहल्ला बोर्ड',
    titleEn: 'Mohalla Board',
    description: 'बिजली कटौती, सड़क बंद, बाज़ार की खबर — सब एक जगह। Real-time updates without WhatsApp forwards.',
    tag: 'Real-time community board',
    illustration: 'board',
  },
  {
    id: 2,
    bg: '#F5F0E8',           // parchment
    accentColor: '#E07B2A',  // saffron
    emoji: '📋',
    titleHindi: 'सरकारी फॉर्म गाइड',
    titleEn: 'Sarkari Form Guide',
    description: 'जाति प्रमाण पत्र से राशन कार्ड तक — सही कागज़, सही दफ्तर, पहली बार में। दलाल की ज़रूरत नहीं।',
    tag: 'GPS for government paperwork',
    illustration: 'forms',
  },
  {
    id: 3,
    bg: '#0A3D24',
    accentColor: '#5DC9A1',  // mint
    emoji: '🤖',
    titleHindi: 'JanBot AI सहायक',
    titleEn: 'JanBot — AI Assistant',
    description: 'Hindi, Punjabi, या English में पूछो — instant जवाब मिलेगा। सरकारी योजनाएं, शिकायत, बिल — सब कुछ।',
    tag: 'Ask in any language',
    illustration: 'bot',
  },
  {
    id: 4,
    bg: '#F5F0E8',
    accentColor: '#C9A227',  // turmeric
    emoji: '⚖️',
    titleHindi: 'नेता का हिसाब',
    titleEn: "Neta ka Hisaab",
    description: 'वार्ड councillor की attendance, funds, और वादे — सब public record में। जवाबदेही हमारा हक़ है।',
    tag: 'Politician accountability tracker',
    illustration: 'neta',
  },
]

function AnimatedDot({ isActive, accentColor }) {
  const widthVal = useSharedValue(isActive ? 24 : 8)
  const opacityVal = useSharedValue(isActive ? 1 : 0.25)
  
  React.useEffect(() => {
    widthVal.value = withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 200 })
    opacityVal.value = withTiming(isActive ? 1 : 0.25, { duration: 250 })
  }, [isActive])
  
  const dotStyle = useAnimatedStyle(() => ({
    width: widthVal.value,
    height: 8,
    borderRadius: 4,
    backgroundColor: isActive ? accentColor : 'rgba(96,112,104,0.4)',
    opacity: opacityVal.value,
  }))
  
  return <Animated.View style={[styles.dot, dotStyle]} />
}

export default function OnboardingScreen() {
  const router = useRouter()
  const { width, height } = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef(null)

  const currentSlide = slides[currentIndex]
  const isDark = currentSlide.bg === '#0A3D24'

  const handleNext = async () => {
    if (currentIndex === slides.length - 1) {
      // Completed onboarding
      await AsyncStorage.setItem('hasSeenOnboarding', 'true')
      router.push('/(auth)/login')
    } else {
      carouselRef.current?.scrollTo({ index: currentIndex + 1, animated: true })
    }
  }

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true')
    router.push('/(auth)/login')
  }

  return (
    <View style={[styles.container, { backgroundColor: currentSlide.bg }]}>
      <View style={{ flex: 1 }}>
        <Carousel
          ref={carouselRef}
          loop={false}
          width={width}
          height={height - 110}
          data={slides}
          onSnapToItem={(index) => setCurrentIndex(index)}
          renderItem={({ item, index }) => (
            <FeatureSlide slide={item} isActive={currentIndex === index} />
          )}
        />
      </View>

      {/* Bottom Nav */}
      <SafeAreaView edges={['bottom']} style={[styles.bottomNav, { backgroundColor: currentSlide.bg }]}>
        <Pressable onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: isDark ? 'rgba(255,255,255,0.4)' : '#607068' }]}>
            Skip
          </Text>
        </Pressable>

        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, i) => (
            <AnimatedDot key={i} isActive={i === currentIndex} accentColor={currentSlide.accentColor} />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={[styles.nextBtn, { backgroundColor: currentSlide.accentColor }]}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'शुरू करें' : 'अगला →'}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 28,
    height: 90,
  },
  skipBtn: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  skipText: {
    fontFamily: 'Mukta-Regular',
    fontSize: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 1,
  },
  nextBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.10)',
  },
  nextText: {
    color: '#FDFFFE',
    fontFamily: 'Mukta-Bold',
    fontSize: 15,
  },
})
