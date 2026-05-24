import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated'

export default function FloatingPhone() {
  const floatY = useSharedValue(0)

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,  { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    )
  }, [])

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }, { rotate: '-4deg' }]
  }))

  return (
    <Animated.View style={[styles.phoneWrap, floatStyle]}>
      {/* Phone frame */}
      <View style={styles.phoneFrame}>
        {/* Notch */}
        <View style={styles.notch} />
        {/* Screen */}
        <View style={styles.screen}>
          {/* Mock app header */}
          <View style={styles.mockHeader}>
            <View style={styles.mockHeaderDot} />
            <View style={[styles.mockHeaderDot, { backgroundColor: '#5DC9A1' }]} />
          </View>
          {/* Mock cards */}
          <View style={[styles.mockCard, { backgroundColor: '#FDF0E6' }]}>
            <View style={[styles.mockCardBadge, { backgroundColor: '#E07B2A' }]} />
          </View>
          <View style={[styles.mockCard, { backgroundColor: '#E1F5EE' }]}>
            <View style={[styles.mockCardBadge, { backgroundColor: '#1D9E75' }]} />
          </View>
          <View style={[styles.mockCard, { backgroundColor: '#F5F0E8' }]}>
            <View style={[styles.mockCardBadge, { backgroundColor: '#C9A227' }]} />
          </View>
          {/* Mock button */}
          <View style={styles.mockBtn} />
        </View>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  phoneWrap: { alignItems: 'center' },
  phoneFrame: {
    width: 140, backgroundColor: '#0A3D24',
    borderRadius: 24, padding: 6,
    borderWidth: 2, borderColor: '#1D4D35',
  },
  notch: {
    width: 40, height: 6, backgroundColor: '#0A3D24',
    borderRadius: 3, alignSelf: 'center', marginBottom: 6,
  },
  screen: {
    backgroundColor: '#F5F0E8', borderRadius: 18,
    padding: 10, gap: 6,
  },
  mockHeader: {
    backgroundColor: '#0A3D24', borderRadius: 8, height: 28,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, gap: 4, marginBottom: 2,
  },
  mockHeaderDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#E07B2A',
  },
  mockCard: {
    borderRadius: 7, height: 30, paddingHorizontal: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  mockCardBadge: {
    width: 28, height: 8, borderRadius: 4,
  },
  mockBtn: {
    backgroundColor: '#1D9E75', borderRadius: 8,
    height: 22, marginTop: 2,
  },
})
