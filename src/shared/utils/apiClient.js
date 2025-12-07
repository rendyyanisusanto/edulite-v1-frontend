import axios from 'axios'
import config from '../../config'

// Create axios instance
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

let refreshTokenPromise = null

// Function to check if token is about to expire (within 30 seconds)
const isTokenExpiringSoon = () => {
  const expiresAt = localStorage.getItem('expires_at')
  if (!expiresAt) return false
  
  const expiryTime = new Date(expiresAt).getTime()
  const currentTime = Date.now()
  const timeUntilExpiry = expiryTime - currentTime
  
  // Refresh if token expires in less than 30 seconds
  return timeUntilExpiry < 30000
}

// Function to refresh access token
const refreshAccessToken = async () => {
  // If there's already a refresh in progress, return that promise
  if (refreshTokenPromise) {
    return refreshTokenPromise
  }

  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  refreshTokenPromise = axios.post(
    `${config.apiBaseUrl}${config.api.auth.refresh}`,
    { refresh_token: refreshToken }
  ).then(response => {
    const { access_token, refresh_token, expires_at } = response.data
    
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('expires_at', expires_at)
    
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token)
    }
    
    refreshTokenPromise = null
    return access_token
  }).catch(error => {
    refreshTokenPromise = null
    // Clear all auth data and redirect to login
    localStorage.clear()
    window.location.href = '/login'
    throw error
  })

  return refreshTokenPromise
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token')
    
    if (token) {
      // Check if token is about to expire and refresh it
      if (isTokenExpiringSoon()) {
        try {
          const newToken = await refreshAccessToken()
          config.headers.Authorization = `Bearer ${newToken}`
        } catch (error) {
          console.error('Failed to refresh token:', error)
          return Promise.reject(error)
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Already handled in refreshAccessToken (clear storage + redirect)
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
