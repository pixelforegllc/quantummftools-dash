import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import apiKeysReducer from './slices/apiKeysSlice'
import smsReducer from './slices/smsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    apiKeys: apiKeysReducer,
    sms: smsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})