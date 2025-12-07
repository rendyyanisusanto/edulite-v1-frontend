/**
 * Token Monitor
 * Monitor token expiration dan handle auto logout
 */

let monitorInterval = null

/**
 * Start monitoring token expiration
 */
export const startTokenMonitor = (onExpired) => {
  // Clear existing interval if any
  stopTokenMonitor()

  // Check every 5 seconds
  monitorInterval = setInterval(() => {
    const expiresAt = localStorage.getItem('expires_at')
    const refreshToken = localStorage.getItem('refresh_token')

    // If no tokens, stop monitoring
    if (!expiresAt || !refreshToken) {
      stopTokenMonitor()
      return
    }

    // Check if token has expired
    const expiryTime = new Date(expiresAt).getTime()
    const currentTime = Date.now()

    // If expired, trigger callback
    if (currentTime >= expiryTime) {
      console.warn('Token expired, attempting refresh...')
      // Token will be auto-refreshed by apiClient interceptor
      // If refresh fails, apiClient will handle auto logout
    }
  }, 5000) // Check every 5 seconds
}

/**
 * Stop monitoring token expiration
 */
export const stopTokenMonitor = () => {
  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
  }
}

/**
 * Check if token is expired
 */
export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expires_at')
  if (!expiresAt) return true

  const expiryTime = new Date(expiresAt).getTime()
  const currentTime = Date.now()

  return currentTime >= expiryTime
}

/**
 * Get time remaining until token expires (in seconds)
 */
export const getTimeUntilExpiry = () => {
  const expiresAt = localStorage.getItem('expires_at')
  if (!expiresAt) return 0

  const expiryTime = new Date(expiresAt).getTime()
  const currentTime = Date.now()
  const timeRemaining = expiryTime - currentTime

  return Math.max(0, Math.floor(timeRemaining / 1000))
}
