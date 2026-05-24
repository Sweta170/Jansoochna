import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/user/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#F4F7F5' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#0A3D24',
        padding: 20,
        paddingTop: 52,
      }}>
        <Text style={{
          fontSize: 22, fontWeight: '700', color: '#fff',
          fontFamily: 'Mukta-Bold',
        }}>
          Notifications
        </Text>
      </View>

      {notifications.length === 0 && !loading ? (
        <View style={{ alignItems: 'center', paddingTop: 80 }}>
          <Text style={{ fontSize: 15, color: '#A8B5AD', fontFamily: 'Mukta-Regular' }}>
            कोई notification नहीं
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 14,
              marginBottom: 8,
              borderWidth: 0.5, borderColor: '#E8EDEA',
              opacity: item.read ? 0.6 : 1,
            }}>
              <Text style={{
                fontSize: 14, fontWeight: '500', color: '#0D1B12',
                fontFamily: 'Mukta-Medium', marginBottom: 3,
              }}>
                {item.title}
              </Text>
              <Text style={{
                fontSize: 12, color: '#607068',
                fontFamily: 'Mukta-Regular',
              }}>
                {item.body}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}
