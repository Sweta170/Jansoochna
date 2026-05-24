import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// Use the correct base URL depending on the platform:
// - Web: localhost works directly
// - Android/iOS physical device: use the machine's LAN IP
// ⚠️ If your LAN IP changes, update the IP below
const LAN_IP = '192.168.1.17'

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  if (Platform.OS === 'web') return 'http://localhost:5000/api'
  return `http://${LAN_IP}:5000/api` // Physical device (Android/iOS)
}

const baseURL = getBaseURL()

export const api = axios.create({
  baseURL,
  // Note: Mobile app uses Bearer token auth (Authorization header), not cookies.
  // CSRF attacks require cookie-based session auth to exploit browser state.
  // The server's csrfProtection middleware automatically skips the CSRF token check
  // for all requests sending an Authorization header starting with 'Bearer '.
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue = []
let logoutHandler = null

export const registerLogoutHandler = (handler) => {
  logoutHandler = handler
}

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken')
        if (!storedRefreshToken) {
          throw new Error('No refresh token available')
        }

        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken: storedRefreshToken
        })

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data

        await AsyncStorage.setItem('accessToken', accessToken)
        if (newRefreshToken) {
          await AsyncStorage.setItem('refreshToken', newRefreshToken)
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        
        processQueue(null, accessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Refresh failed (or invalid refresh token), clear local session
        await AsyncStorage.removeItem('accessToken')
        await AsyncStorage.removeItem('refreshToken')
        await AsyncStorage.removeItem('user')

        if (logoutHandler) {
          logoutHandler()
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
