import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchApiKeys = createAsyncThunk(
  'apiKeys/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api-keys`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createApiKey = createAsyncThunk(
  'apiKeys/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api-keys`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateApiKey = createAsyncThunk(
  'apiKeys/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/api-keys/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deleteApiKey = createAsyncThunk(
  'apiKeys/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/api-keys/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const apiKeysSlice = createSlice({
  name: 'apiKeys',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiKeys.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateApiKey.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteApiKey.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
  },
})

export default apiKeysSlice.reducer