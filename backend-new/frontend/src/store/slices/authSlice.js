import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'
import api from '../../services/api'

export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(username, password)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout')
    authService.logout()
    return null
  } catch (error) {
    // Still logout locally even if server request fails
    authService.logout()
    return rejectWithValue(error.response?.data || 'Logout failed')
  }
})

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const user = authService.getCurrentUser()
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Verify token is still valid with server
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      authService.logout()
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.refreshToken()
      if (!token) {
        throw new Error('Failed to refresh token')
      }
      return { token }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    checking: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setChecking: (state, action) => {
      state.checking = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.checking = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.checking = false
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.checking = false
        state.error = action.payload
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.checking = false
        state.error = null
      })
      .addCase(logout.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.checking = false
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.checking = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true
        state.user = action.payload
        state.checking = false
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.checking = false
        state.error = action.payload
      })

      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.error = null
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
  },
})

export const { clearError, setChecking } = authSlice.actions

export default authSlice.reducer