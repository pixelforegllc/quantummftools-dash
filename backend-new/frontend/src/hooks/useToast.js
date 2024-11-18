import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { addToast } from '../store/slices/toastSlice'

export const useToast = () => {
  const dispatch = useDispatch()

  const showToast = useCallback(
    (message, type = 'info', duration = 5000) => {
      dispatch(
        addToast({
          id: Date.now(),
          message,
          type,
          duration,
        })
      )
    },
    [dispatch]
  )

  return { showToast }
}