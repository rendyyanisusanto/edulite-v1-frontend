import apiClient from '../../../shared/utils/apiClient'
import config from '../../../config'

/**
 * Auth Service
 * Handle semua operasi autentikasi
 */
class AuthService {
  /**
   * Login user
   * @param {Object} credentials - Email dan password
   * @returns {Promise<Object>} Response data dengan token dan user info
   */
  async login(credentials) {
    try {
      const response = await apiClient.post(config.api.auth.login, {
        email: credentials.email,
        password: credentials.password
      })

      const { access_token, refresh_token, user, expires_at } = response.data

      // Simpan token dan user info
      this.setTokens(access_token, refresh_token, expires_at)
      this.setUser(user)

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
        expiresAt: expires_at
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiClient.post(config.api.auth.logout)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuth()
    }
  }

  /**
   * Get current user info
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get(config.api.auth.me)
      // Response bisa berupa { user: {...} } atau langsung {...}
      const user = response.data.user || response.data
      
      // Update user di localStorage
      this.setUser(user)
      
      return user
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post(config.api.auth.refresh, {
        refresh_token: refreshToken
      })

      const { access_token, refresh_token: newRefreshToken, expires_at } = response.data

      this.setTokens(access_token, newRefreshToken, expires_at)

      return {
        accessToken: access_token,
        refreshToken: newRefreshToken,
        expiresAt: expires_at
      }
    } catch (error) {
      this.clearAuth()
      throw this.handleError(error)
    }
  }

  /**
   * Set tokens to localStorage
   */
  setTokens(accessToken, refreshToken, expiresAt) {
    localStorage.setItem(config.storage.accessToken, accessToken)
    localStorage.setItem(config.storage.refreshToken, refreshToken)
    if (expiresAt) {
      localStorage.setItem('expires_at', expiresAt)
    }
  }

  /**
   * Set user data to localStorage
   */
  setUser(user) {
    localStorage.setItem(config.storage.user, JSON.stringify(user))
  }

  /**
   * Get access token
   */
  getAccessToken() {
    return localStorage.getItem(config.storage.accessToken)
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(config.storage.refreshToken)
  }

  /**
   * Get user from localStorage
   */
  getUser() {
    const userStr = localStorage.getItem(config.storage.user)
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Clear all auth data
   */
  clearAuth() {
    localStorage.removeItem(config.storage.accessToken)
    localStorage.removeItem(config.storage.refreshToken)
    localStorage.removeItem(config.storage.user)
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAccessToken()
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Terjadi kesalahan pada server'
      return new Error(message)
    } else if (error.request) {
      // Request made but no response
      return new Error('Tidak dapat terhubung ke server')
    } else {
      // Something else happened
      return new Error(error.message || 'Terjadi kesalahan')
    }
  }
}

export default new AuthService()
