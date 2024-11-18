import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'

export const fetchTemplates = createAsyncThunk(
  'sms/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/sms/templates`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createTemplate = createAsyncThunk(
  'sms/createTemplate',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/sms/templates`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchSchedule = createAsyncThunk(
  'sms/fetchSchedule',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/sms/schedule`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const scheduleMessage = createAsyncThunk(
  'sms/scheduleMessage',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/sms/schedule`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const smsSlice = createSlice({
  name: 'sms',
  initialState: {
    templates: [],
    schedule: [],
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
      .addCase(fetchTemplates.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.templates = action.payload
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload)
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload
      })
      .addCase(scheduleMessage.fulfilled, (state, action) => {
        state.schedule.push(action.payload)
      })
  },
})

export const { clearError } = smsSlice.actions

export default smsSlice.reducer