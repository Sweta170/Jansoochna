import React, { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring, Easing } from 'react-native-reanimated'
import DiyaAnimation from '../../components/landing/DiyaAnimation'
import WordReveal from '../../components/landing/WordReveal'
import { landingColors } from '../../theme/colors'

export default function HeroScreen() {
  const router = useRouter()
  
  // Ticker animation
  const [contentWidth, setContentWidth] = useState(0)
  const tickerTranslate = useSharedValue(0)

  useEffect(() => {
    if (contentWidth > 0) {
      tickerTranslate.value = 0
      tickerTranslate.value = withRepeat(
        withTiming(-contentWidth, { duration: 18000, easing: Easing.linear }),
        -1,
        false
      )
    }
  }, [contentWidth])

  const tickerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tickerTranslate.value }]
  }))

  // Bottom CTA entry animation
  const btnOpacity = useSharedValue(0)
  const btnTranslate = useSharedValue(30)

  useEffect(() => {
    const timer = setTimeout(() => {
      btnOpacity.value = withTiming(1, { duration: 500 })
      btnTranslate.value = withSpring(0, { damping: 20 })
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnTranslate.value }]
  }))

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Decorative Circles */}
      <View style={styles.decoCircleTop} />
      <View style={styles.decoCircleBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.spacer} />

        {/* Diya Animation */}
        <DiyaAnimation />

        {/* Headlines */}
        <View style={styles.textContainer}>
          <WordReveal
            text="अपने शहर की आवाज़ बनो"
            delay={300}
            style={styles.hindiTitle}
          />
          <View style={{ height: 6 }} />
          <WordReveal
            text="Be the voice of your city"
            delay={800}
            style={styles.englishTitle}
          />
          <View style={{ height: 16 }} />
          <Text style={styles.tagline}>
            देश का पहला AI-powered नागरिक मंच
          </Text>
        </View>

        <View style={styles.spacer} />

        {/* Ticker strip */}
        <View style={styles.tickerContainer}>
          <Animated.View style={[styles.tickerRow, tickerStyle]}>
            <View onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)} style={styles.tickerGroup}>
              <Text style={styles.tickerText}> ● 1,247 issues resolved </Text>
              <Text style={styles.tickerText}> ● Ludhiana </Text>
              <Text style={styles.tickerText}> ● Mumbai </Text>
              <Text style={styles.tickerText}> ● Delhi </Text>
              <Text style={styles.tickerText}> ● Pune </Text>
              <Text style={styles.tickerText}> ● Jaipur </Text>
            </View>
            <View style={styles.tickerGroup}>
              <Text style={styles.tickerText}> ● 1,247 issues resolved </Text>
              <Text style={styles.tickerText}> ● Ludhiana </Text>
              <Text style={styles.tickerText}> ● Mumbai </Text>
              <Text style={styles.tickerText}> ● Delhi </Text>
              <Text style={styles.tickerText}> ● Pune </Text>
              <Text style={styles.tickerText}> ● Jaipur </Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom CTA section */}
        <Animated.View style={[styles.ctaContainer, btnStyle]}>
          <Pressable
            onPress={() => router.push('/(landing)/onboarding')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>शुरू करें — App explore karo</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Already registered? Login karein</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: landingColors.forest,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  decoCircleTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(29,158,117,0.10)',
    zIndex: 0,
  },
  decoCircleBottom: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(224,123,42,0.08)',
    zIndex: 0,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  hindiTitle: {
    fontFamily: 'Mukta-ExtraBold',
    fontSize: 38,
    color: '#FDFFFE',
    textAlign: 'center',
  },
  englishTitle: {
    fontFamily: 'CrimsonPro-Italic',
    fontSize: 22,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },
  tagline: {
    fontFamily: 'Mukta-Medium',
    fontSize: 16,
    color: landingColors.mint,
    textAlign: 'center',
    marginTop: 8,
  },
  tickerContainer: {
    height: 36,
    backgroundColor: landingColors.ink,
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  tickerRow: {
    flexDirection: 'row',
    width: '200%',
  },
  tickerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerText: {
    fontFamily: 'SpaceMono-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginHorizontal: 4,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
    zIndex: 1,
  },
  primaryButton: {
    backgroundColor: landingColors.jade,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
  },
  primaryButtonText: {
    fontFamily: 'Mukta-Bold',
    fontSize: 16,
    color: '#FDFFFE',
  },
  secondaryButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(253,255,254,0.3)',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontFamily: 'Mukta-SemiBold',
    fontSize: 15,
    color: '#FDFFFE',
  },
})
