import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Send cookies for refresh token
})

// ── CSRF token management ──────────────────────────────────
let csrfToken = null

export async function fetchCsrfToken() {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const { data } = await axios.get(
      `${apiUrl}/csrf-token`,
      { withCredentials: true }
    )
    csrfToken = data.csrfToken
    return csrfToken
  } catch (err) {
    console.error('[CSRF] Failed to fetch token:', err.message)
    return null
  }
}

// Fetch CSRF token immediately on module load
fetchCsrfToken()

// Request interceptor: attach access token and CSRF token
api.interceptors.request.use(async (config) => {
  const token = window.__JAN_ACCESS_TOKEN__
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Attach CSRF token to all mutating requests
  const mutatingMethods = ['post', 'put', 'patch', 'delete']
  if (mutatingMethods.includes(config.method?.toLowerCase())) {
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken()
    }
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
  }

  return config
}, (error) => Promise.reject(error))

// Response interceptor: on 401 or 403 CSRF, refresh and retry
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

    // Handle 403 CSRF error — refresh token and retry once
    if (err.response?.status === 403 &&
        err.response?.data?.code === 'CSRF_ERROR' &&
        !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true
      csrfToken = await fetchCsrfToken()
      if (csrfToken) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken
        return api(originalRequest)
      }
    }

    // Handle 401 — refresh JWT and retry
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
        
        // Ensure we have a CSRF token before calling raw axios
        if (!csrfToken) {
          csrfToken = await fetchCsrfToken()
        }

        const { data } = await axios.post(
          refreshUrl,
          {},
          {
            withCredentials: true,
            headers: {
              'X-CSRF-Token': csrfToken || ''
            }
          }
        )
        
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
