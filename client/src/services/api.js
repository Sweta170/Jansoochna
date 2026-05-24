import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send cookies for refresh token
})

// Request interceptor: attach access token from memory
api.interceptors.request.use(config => {
  const token = window.__JAN_ACCESS_TOKEN__
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: on 401, refresh token and retry once
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`
        const { data } = await axios.post(refreshUrl, {}, { withCredentials: true })
        
        window.__JAN_ACCESS_TOKEN__ = data.accessToken
        processQueue(null, data.accessToken)
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        window.__JAN_ACCESS_TOKEN__ = null
        // Force redirect to login page or handle auth failure if needed
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(err)
  }
)

export default api
