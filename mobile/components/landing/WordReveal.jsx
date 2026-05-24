import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay, withTiming } from 'react-native-reanimated'

export default function WordReveal({ text, delay = 0, style }) {
  const words = text.split(' ')

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
      {words.map((word, i) => (
        <WordItem key={i} word={word} delay={delay + i * 120} style={style} />
      ))}
    </View>
  )
}

function WordItem({ word, delay, style }) {
  const translateY = useSharedValue(60)
  const opacity = useSharedValue(0)

  useEffect(() => {
    translateY.value = withDelay(delay, withSpring(0, {
      damping: 18, stiffness: 180
    }))
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }))
  }, [delay])

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }))

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.Text style={[style, animStyle]}>{word}</Animated.Text>
    </View>
  )
}
