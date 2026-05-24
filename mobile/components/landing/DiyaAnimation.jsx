import React, { useEffect } from 'react'
import { View } from 'react-native'
import Svg, { Path, Ellipse } from 'react-native-svg'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated'

export default function DiyaAnimation() {
  const flameScale = useSharedValue(1)

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 400 }),
        withTiming(0.95, { duration: 300 }),
        withTiming(1.04, { duration: 350 }),
        withTiming(1,    { duration: 300 }),
      ), -1, false
    )
  }, [])

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { translateY: (1 - flameScale.value) * 15 } // keep bottom of flame aligned
    ]
  }))

  return (
    <View style={{ width: 80, height: 100, alignItems: 'center', marginBottom: 32, alignSelf: 'center' }}>
      {/* Glow ring behind diya */}
      <Animated.View style={[{
        position: 'absolute',
        width: 120, height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(224,123,42,0.12)',
        top: -20,
      }, flameStyle]} />

      {/* Flame */}
      <Animated.View style={[{ position: 'absolute', top: 0, width: 80, height: 50 }, flameStyle]}>
        <Svg width={80} height={50} viewBox="0 0 80 50">
          <Path
            d="M40 10 C35 20 28 28 30 38 C32 46 40 50 40 50 C40 50 48 46 50 38 C52 28 45 20 40 10Z"
            fill="#E07B2A"
          />
          <Path
            d="M40 20 C37 27 34 32 36 38 C37 42 40 44 40 44 C40 44 43 42 44 38 C46 32 43 27 40 20Z"
            fill="#C9A227"
          />
        </Svg>
      </Animated.View>

      {/* Wick & Diya body */}
      <View style={{ position: 'absolute', top: 50, width: 80, height: 50 }}>
        <Svg width={80} height={50} viewBox="0 50 80 50">
          {/* Wick */}
          <Path d="M39 50 L41 50 L41 58 L39 58Z" fill="#2D3A32" />
          {/* Diya body */}
          <Ellipse cx={40} cy={70} rx={28} ry={14} fill="#C9A227" />
          <Ellipse cx={40} cy={66} rx={24} ry={10} fill="#E07B2A" />
          <Ellipse cx={40} cy={64} rx={18} ry={6} fill="rgba(0,0,0,0.2)" />
        </Svg>
      </View>
    </View>
  )
}
