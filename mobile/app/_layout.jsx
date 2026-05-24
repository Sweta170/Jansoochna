import React, { useEffect } from 'react'
import { Platform } from 'react-native'
if (Platform.OS === 'web') {
  const rnw = require('react-native-web/dist/index');
  if (!rnw.codegenNativeComponent) {
    Object.defineProperty(rnw, 'codegenNativeComponent', {
      get: () => () => 'div',
      configurable: true
    });
  }
}
import { Stack, useRouter, useSegments } from 'expo-router'
import { AuthProvider, AuthContext } from '../context/AuthContext'
import { useFonts } from 'expo-font'
import i18n from '../i18n' // Initialize i18n
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import '../global.css' // NativeWind styles

function RootNavigation() {
  const { user, loading } = React.useContext(AuthContext)
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    const checkAndRedirect = () => {
      try {
        const inAuthGroup = segments[0] === '(auth)'
        const inLandingGroup = segments[0] === '(landing)'

        if (!user) {
          // If not logged in, always route to landing on cold startup.
          // Once they proceed to auth or landing pages, let them stay there.
          if (!inLandingGroup && !inAuthGroup) {
            router.replace('/(landing)')
          }
        } else {
          // If logged in, keep them in app screens.
          if (inAuthGroup || inLandingGroup) {
            router.replace('/(app)')
          }
        }
      } catch (err) {
        console.error('Error in route redirection:', err)
      }
    }

    checkAndRedirect()
  }, [user, loading, segments])

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(landing)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem('appLanguage')
        if (savedLang) {
          i18n.changeLanguage(savedLang)
        }
      } catch (e) {
        console.log('Error loading initial language', e)
      }
    })()
  }, [])

  const [fontsLoaded] = useFonts({
    'Mukta-Regular': require('../assets/fonts/Mukta-Regular.ttf'),
    'Mukta-Medium': require('../assets/fonts/Mukta-Medium.ttf'),
    'Mukta-SemiBold': require('../assets/fonts/Mukta-SemiBold.ttf'),
    'Mukta-Bold': require('../assets/fonts/Mukta-Bold.ttf'),
    'Mukta-ExtraBold': require('../assets/fonts/Mukta-ExtraBold.ttf'),
    'CrimsonPro-Italic': require('../assets/fonts/CrimsonPro-Italic.ttf'),
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
