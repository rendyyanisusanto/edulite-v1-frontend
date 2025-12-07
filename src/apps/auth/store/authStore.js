import { defineStore } from 'pinia'
import authService from '../services/authService'
import { startTokenMonitor, stopTokenMonitor } from '../../../shared/utils/tokenMonitor'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.getUser(),
    accessToken: authService.getAccessToken(),
    refreshToken: authService.getRefreshToken(),
    isAuthenticated: authService.isAuthenticated(),
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Get current user
     */
    currentUser: (state) => state.user,

    /**
     * Check if user is logged in
     */
    isLoggedIn: (state) => state.isAuthenticated,

    /**
     * Get user role
     */
    userRole: (state) => state.user?.role,

    /**
     * Check if user is superadmin
     */
    isSuperAdmin: (state) => state.user?.role === 'superadmin',

    /**
     * Get user name
     */
    userName: (state) => state.user?.name || '',

    /**
     * Get user email
     */
    userEmail: (state) => state.user?.email || ''
  },

  actions: {
    /**
     * Login user
     * @param {Object} credentials - Email, password, dan remember
     */
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        const data = await authService.login(credentials)

        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        this.user = data.user
        this.isAuthenticated = true

        // Start monitoring token expiration
        startTokenMonitor()

        return data
      } catch (error) {
        this.isAuthenticated = false
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout user
     */
    async logout() {
      this.loading = true

      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Stop monitoring token
        stopTokenMonitor()
        this.clearState()
        this.loading = false
      }
    },

    /**
     * Check authentication status
     */
    async checkAuth() {
      if (!this.accessToken) {
        this.clearState()
        return false
      }

      try {
        const user = await authService.getCurrentUser()
        this.user = user
        this.isAuthenticated = true
        
        // Start monitoring if not already started
        startTokenMonitor()
        
        return true
      } catch (error) {
        console.error('Check auth error:', error)
        stopTokenMonitor()
        this.clearState()
        return false
      }
    },

    /**
     * Refresh token
     */
    async refreshAccessToken() {
      try {
        const data = await authService.refreshToken()
        this.accessToken = data.accessToken
        this.refreshToken = data.refreshToken
        return true
      } catch (error) {
        console.error('Refresh token error:', error)
        this.clearState()
        return false
      }
    },

    /**
     * Update user profile
     */
    updateUser(userData) {
      this.user = { ...this.user, ...userData }
      authService.setUser(this.user)
    },

    /**
     * Clear state
     */
    clearState() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.error = null
    },

    /**
     * Set error
     */
    setError(error) {
      this.error = error
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    }
  }
})
