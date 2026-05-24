import React, { useState, useEffect, useRef } from 'react'
import { View, Text } from 'react-native'

export default function StatCounter({ target, suffix = '', label, color }) {
  const [displayed, setDisplayed] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    // Start count on mount automatically for simplicity, or we can expose a trigger
    startCount()
  }, [target])

  function startCount() {
    if (hasStarted.current) return
    hasStarted.current = true
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setDisplayed(target)
        clearInterval(timer)
      } else {
        setDisplayed(Math.floor(current))
      }
    }, duration / steps)
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{
        fontFamily: 'SpaceMono-Bold',
        fontSize: 40,
        color: color || '#fff',
        lineHeight: 44,
      }}>
        {displayed.toLocaleString('en-IN')}{suffix}
      </Text>
      <Text style={{
        fontFamily: 'Mukta-SemiBold',
        fontSize: 13,
        color: 'rgba(255,255,255,0.55)',
        marginTop: 4,
      }}>{label}</Text>
    </View>
  )
}
