import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import apiKeysReducer from './slices/apiKeysSlice'
import smsReducer from './slices/smsSlice'
import toastReducer from './slices/toastSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    apiKeys: apiKeysReducer,
    sms: smsReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['toast/addToast'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.duration'],
        // Ignore these paths in the state
        ignoredPaths: ['toast.toasts'],
      },
    }),
})