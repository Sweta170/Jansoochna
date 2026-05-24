import React, { useEffect } from 'react'
import { View, Text } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated'
import Svg, { Rect, Circle, Path, G, Line } from 'react-native-svg'

function SlideIllustration({ type, color, isDark }) {
  const containerStyle = {
    height: 200,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  }

  if (type === 'board') {
    return (
      <View style={containerStyle}>
        <Svg width={240} height={200} viewBox="0 0 240 200">
          {/* Board Frame / Shadow */}
          <Rect x={10} y={10} width={220} height={180} rx={16} fill={isDark ? '#052516' : '#E8EDEA'} />
          <Rect x={15} y={15} width={210} height={170} rx={12} fill={isDark ? '#0C3320' : '#FDFFFE'} stroke={color} strokeWidth={2} />
          
          {/* Pins & Cards */}
          {/* Card 1: Amber Outage */}
          <G transform="translate(30, 40) rotate(-4)">
            <Rect x={0} y={0} width={75} height={95} rx={8} fill={isDark ? '#2E2211' : '#FDF0E6'} stroke="#E07B2A" strokeWidth={1.5} />
            <Rect x={10} y={15} width={40} height={8} rx={2} fill="#E07B2A" />
            <Line x1={10} y1={35} x2={65} y2={35} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            <Line x1={10} y1={50} x2={55} y2={50} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            <Line x1={10} y1={65} x2={60} y2={65} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            {/* Pin */}
            <Circle cx={37.5} cy={6} r={4} fill="#E74C3C" />
          </G>

          {/* Card 2: Blue Notice */}
          <G transform="translate(125, 30) rotate(3)">
            <Rect x={0} y={0} width={80} height={110} rx={8} fill={isDark ? '#11222E' : '#EAF2F8'} stroke="#3498DB" strokeWidth={1.5} />
            <Rect x={10} y={15} width={45} height={8} rx={2} fill="#3498DB" />
            <Line x1={10} y1={35} x2={70} y2={35} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            <Line x1={10} y1={50} x2={60} y2={50} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            <Line x1={10} y1={65} x2={65} y2={65} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            <Line x1={10} y1={80} x2={50} y2={80} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={2} />
            {/* Pin */}
            <Circle cx={40} cy={6} r={4} fill="#F1C40F" />
          </G>
          
          {/* Card 3: Green Market */}
          <G transform="translate(70, 100) rotate(-1)">
            <Rect x={0} y={0} width={90} height={65} rx={6} fill={isDark ? '#112E20' : '#E1F5EE'} stroke="#1D9E75" strokeWidth={1.5} />
            <Rect x={8} y={10} width={35} height={6} rx={2} fill="#1D9E75" />
            <Line x1={8} y1={25} x2={82} y2={25} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={1.5} />
            <Line x1={8} y1={35} x2={72} y2={35} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={1.5} />
            <Line x1={8} y1={45} x2={78} y2={45} stroke={isDark ? 'rgba(255,255,255,0.3)' : '#A8B5AD'} strokeWidth={1.5} />
            {/* Pin */}
            <Circle cx={45} cy={4} r={3} fill="#9B59B6" />
          </G>
        </Svg>
      </View>
    )
  }

  if (type === 'forms') {
    return (
      <View style={containerStyle}>
        <Svg width={240} height={200} viewBox="0 0 240 200">
          {/* Document Stack Effect */}
          {/* Bottom Document */}
          <G transform="translate(68, 52) rotate(6)">
            <Rect x={0} y={0} width={95} height={125} rx={8} fill={isDark ? '#1C2E24' : '#E8EDEA'} stroke={isDark ? 'rgba(255,255,255,0.1)' : '#A8B5AD'} strokeWidth={1.5} />
          </G>
          {/* Middle Document */}
          <G transform="translate(62, 45) rotate(-3)">
            <Rect x={0} y={0} width={95} height={125} rx={8} fill={isDark ? '#23392D' : '#F4F7F5'} stroke={isDark ? 'rgba(255,255,255,0.2)' : '#A8B5AD'} strokeWidth={1.5} />
          </G>
          {/* Top Document */}
          <G transform="translate(60, 40)">
            <Rect x={0} y={0} width={95} height={125} rx={8} fill={isDark ? '#2E4C3D' : '#FDFFFE'} stroke={color} strokeWidth={2} />
            {/* Document Lines */}
            <Rect x={12} y={15} width={45} height={10} rx={2} fill={color} />
            <Line x1={12} y1={45} x2={83} y2={45} stroke={isDark ? 'rgba(255,255,255,0.4)' : '#607068'} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={12} y1={65} x2={83} y2={65} stroke={isDark ? 'rgba(255,255,255,0.4)' : '#607068'} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={12} y1={85} x2={65} y2={85} stroke={isDark ? 'rgba(255,255,255,0.4)' : '#607068'} strokeWidth={2.5} strokeLinecap="round" />
            <Line x1={12} y1={105} x2={75} y2={105} stroke={isDark ? 'rgba(255,255,255,0.4)' : '#607068'} strokeWidth={2.5} strokeLinecap="round" />
          </G>

          {/* Floating Tick Badge top-right */}
          <G transform="translate(135, 25)">
            <Circle cx={20} cy={20} r={18} fill="#2ECC71" />
            <Path d="M12 20 L17 25 L28 14" stroke="#FDFFFE" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </G>
        </Svg>
      </View>
    )
  }

  if (type === 'bot') {
    return (
      <View style={containerStyle}>
        <Svg width={240} height={200} viewBox="0 0 240 200">
          {/* Background decoration */}
          <Circle cx={120} cy={110} r={65} fill={isDark ? '#052516' : '#E8EDEA'} />

          {/* Antenna */}
          <Line x1={120} y1={55} x2={120} y2={35} stroke={color} strokeWidth={4} />
          <Circle cx={120} cy={30} r={8} fill="#2ECC71" />

          {/* Robot Head */}
          <Rect x={70} y={55} width={100} height={85} rx={28} fill={isDark ? '#2E4C3D' : '#FDFFFE'} stroke={color} strokeWidth={3.5} />

          {/* Ears */}
          <Rect x={62} y={85} width={8} height={25} rx={3} fill={color} />
          <Rect x={170} y={85} width={8} height={25} rx={3} fill={color} />

          {/* Eyes Panel */}
          <Rect x={85} y={75} width={70} height={30} rx={15} fill={isDark ? '#0F2D20' : '#0F5C3A'} />
          <Circle cx={105} cy={90} r={6} fill="#5DC9A1" />
          <Circle cx={135} cy={90} r={6} fill="#5DC9A1" />

          {/* Mouth */}
          <Path d="M105 120 Q120 132 135 120" stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" />

          {/* Speech Bubble floating top-right */}
          <G transform="translate(155, 15)">
            <Path d="M10 35 L5 42 L18 40 C35 38 42 28 42 18 C42 8 32 2 20 2 C8 2 2 8 2 18 C2 28 8 35 10 35 Z" fill={color} />
            <Circle cx={14} cy={18} r={2} fill="#FDFFFE" />
            <Circle cx={20} cy={18} r={2} fill="#FDFFFE" />
            <Circle cx={26} cy={18} r={2} fill="#FDFFFE" />
          </G>
        </Svg>
      </View>
    )
  }

  if (type === 'neta') {
    return (
      <View style={containerStyle}>
        <Svg width={240} height={200} viewBox="0 0 240 200">
          {/* Chart Axes */}
          <Line x1={40} y1={160} x2={200} y2={160} stroke={isDark ? 'rgba(255,255,255,0.2)' : '#A8B5AD'} strokeWidth={2} />
          <Line x1={40} y1={40} x2={40} y2={160} stroke={isDark ? 'rgba(255,255,255,0.2)' : '#A8B5AD'} strokeWidth={2} />

          {/* Bar 1 (Left) - Attendance 65% */}
          <Rect x={58} y={90} width={28} height={70} rx={4} fill={isDark ? 'rgba(255,255,255,0.15)' : '#A8B5AD'} />

          {/* Bar 2 (Middle, Highlighted) - Attendance 85% */}
          <Rect x={106} y={65} width={28} height={95} rx={4} fill={color} />

          {/* Bar 3 (Right) - Attendance 45% */}
          <Rect x={154} y={110} width={28} height={50} rx={4} fill={isDark ? 'rgba(255,255,255,0.15)' : '#A8B5AD'} />

          {/* Politician Avatar floating above middle bar */}
          <G transform="translate(102, 10)">
            <Circle cx={18} cy={18} r={16} fill={isDark ? '#2E4C3D' : '#FDFFFE'} stroke={color} strokeWidth={2} />
            {/* Minimal face */}
            <Circle cx={13} cy={15} r={1.5} fill={color} />
            <Circle cx={23} cy={15} r={1.5} fill={color} />
            <Path d="M14 22 Q18 25 22 22" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
            <Path d="M10 28 C10 24 26 24 26 28" stroke={color} strokeWidth={1.5} fill="none" />
          </G>

          {/* Percentage badge beside tallest bar */}
          <G transform="translate(142, 60)">
            <Rect x={0} y={0} width={38} height={22} rx={6} fill="#E07B2A" />
            <Path d="M0 11 L-4 11 L0 7" fill="#E07B2A" />
            {/* Styled "85%" representation */}
            <Circle cx={12} cy={11} r={3} fill="#FDFFFE" />
            <Circle cx={26} cy={11} r={3} fill="#FDFFFE" />
          </G>
        </Svg>
      </View>
    )
  }

  return null
}

export default function FeatureSlide({ slide, isActive }) {
  const contentY = useSharedValue(30)
  const contentOpacity = useSharedValue(0)

  useEffect(() => {
    if (isActive) {
      contentY.value = withSpring(0, { damping: 20, stiffness: 200 })
      contentOpacity.value = withTiming(1, { duration: 400 })
    } else {
      contentY.value = 30
      contentOpacity.value = 0
    }
  }, [isActive])

  const animContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentY.value }],
    opacity: contentOpacity.value,
  }))

  const isDark = slide.bg === '#0A3D24'

  return (
    <View style={{ flex: 1, backgroundColor: slide.bg, paddingHorizontal: 32, paddingTop: 60 }}>
      {/* Large illustration area — top 45% of screen */}
      <View style={{ height: '40%', justifyContent: 'center', alignItems: 'center' }}>
        <SlideIllustration type={slide.illustration} color={slide.accentColor} isDark={isDark} />
      </View>

      {/* Content — bottom 60% */}
      <Animated.View style={[{ flex: 1, paddingTop: 32 }, animContentStyle]}>
        {/* Tag pill */}
        <View style={{
          alignSelf: 'flex-start',
          backgroundColor: isDark ? 'rgba(93,201,161,0.15)' : 'rgba(29,158,117,0.1)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(93,201,161,0.3)' : 'rgba(29,158,117,0.2)',
          borderRadius: 100,
          paddingHorizontal: 14,
          paddingVertical: 5,
          marginBottom: 16,
        }}>
          <Text style={{
            fontFamily: 'Mukta-SemiBold',
            fontSize: 12,
            color: slide.accentColor,
            letterSpacing: 0.5,
          }}>{slide.tag}</Text>
        </View>

        {/* Hindi title */}
        <Text style={{
          fontFamily: 'Mukta-ExtraBold',
          fontSize: 36,
          color: isDark ? '#fff' : '#0A3D24',
          lineHeight: 40,
          marginBottom: 4,
        }}>{slide.titleHindi}</Text>

        {/* English subtitle */}
        <Text style={{
          fontFamily: 'CrimsonPro-Italic',
          fontSize: 18,
          color: slide.accentColor,
          marginBottom: 16,
        }}>{slide.titleEn}</Text>

        {/* Description */}
        <Text style={{
          fontFamily: 'Mukta-Regular',
          fontSize: 16,
          color: isDark ? 'rgba(255,255,255,0.75)' : '#607068',
          lineHeight: 24,
        }}>{slide.description}</Text>
      </Animated.View>
    </View>
  )
}
