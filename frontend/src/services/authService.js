import api from './api'

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token)
      if (response.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken)
      }
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (refreshToken) {
      try {
        const response = await api.post('/auth/refresh-token', { refreshToken })
        if (response.data.token) {
          localStorage.setItem(TOKEN_KEY, response.data.token)
          return response.data.token
        }
      } catch (error) {
        authService.logout()
        throw error
      }
    }
    return null
  },

  getCurrentUser: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      try {
        // Decode JWT token
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(window.atob(base64))
        return payload
      } catch (error) {
        console.error('Error decoding token:', error)
        return null
      }
    }
    return null
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return false

    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(window.atob(base64))
      
      // Check if token is expired
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      return false
    }
  }
}

export default authService