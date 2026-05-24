import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshAccessToken = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const { data } = await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true })
      window.__JAN_ACCESS_TOKEN__ = data.accessToken
      
      // Get current user details
      const response = await axios.get(`${apiUrl}/user/me`, {
        headers: { Authorization: `Bearer ${data.accessToken}` }
      })
      
      setUser(response.data.user)
      return data.accessToken
    } catch (err) {
      // Clear access token if refresh fails
      window.__JAN_ACCESS_TOKEN__ = null
      setUser(null)
      return null
    }
  }

  // Attempt silent refresh on boot
  useEffect(() => {
    const initAuth = async () => {
      await refreshAccessToken()
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = (userData, accessToken) => {
    window.__JAN_ACCESS_TOKEN__ = accessToken
    setUser(userData)
  }

  const logout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      window.__JAN_ACCESS_TOKEN__ = null
      setUser(null)
    }
  }

  const updateUserProfile = (updatedUser) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAccessToken, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
