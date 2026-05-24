import React from 'react'
import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { colors } from '../../theme/colors'
import JanBot from '../../components/JanBot'

export default function AppLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.jade,
          tabBarInactiveTintColor: colors.mist,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.cloud,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontFamily: 'Mukta-SemiBold',
            fontSize: 12,
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Mohalla',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏘️</Text>,
          }}
        />
        <Tabs.Screen
          name="issues"
          options={{
            title: 'Issues',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🗺️</Text>,
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Report',
            tabBarIcon: ({ color }) => (
              <View className="bg-jade w-12 h-12 rounded-full items-center justify-center -mt-4 shadow-sm border-4 border-white">
                <Text style={{ fontSize: 24, color: 'white' }}>+</Text>
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent default navigation to a screen, handle as modal via JS later if needed
              // For now, let it navigate to report screen as a normal screen
            },
          })}
        />
        <Tabs.Screen
          name="guide"
          options={{
            title: 'Guide',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📄</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>
      
      {/* Global JanBot Widget */}
      <JanBot />
    </>
  )
}
