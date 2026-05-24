import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { registerLogoutHandler } from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    registerLogoutHandler(() => {
      setUser(null)
    })
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Failed to load user', e)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData, token, refreshToken) => {
    await AsyncStorage.setItem('accessToken', token)
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken)
    }
    await AsyncStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken')
    await AsyncStorage.removeItem('refreshToken')
    await AsyncStorage.removeItem('user')
    setUser(null)
  }

  const updateUserProfile = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates }
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    } catch (e) {
      console.error('Failed to update user profile', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
