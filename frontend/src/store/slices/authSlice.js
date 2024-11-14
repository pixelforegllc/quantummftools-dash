import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials)
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token')
  return null
})

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    status: 'idle',
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.status = 'idle'
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.status = 'succeeded'
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null
        state.token = null
        state.status = 'idle'
      })
  },
})

export const { clearError } = authSlice.actions

export default authSlice.reducer