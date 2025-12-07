export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  appName: import.meta.env.VITE_APP_NAME || 'EduLite',
  
  // API endpoints
  api: {
    auth: {
      login: 'api/auth/login',
      logout: 'api/auth/logout',
      refresh: 'api/auth/refresh',
      me: 'api/auth/profile'
    }
  },
  
  // Storage keys
  storage: {
    accessToken: 'access_token',
    refreshToken: 'refresh_token',
    user: 'user'
  }
}

export default config
