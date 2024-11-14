import api from './api'
import authService from './authService'

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is not 401 or request has already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const token = await authService.refreshToken()
      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      }
    } catch (refreshError) {
      authService.logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    }

    return Promise.reject(error)
  }
)