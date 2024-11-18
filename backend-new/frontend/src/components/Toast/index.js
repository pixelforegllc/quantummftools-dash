import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CToaster, CToast, CToastBody, CToastHeader } from '@coreui/react'
import { removeToast } from '../../store/slices/toastSlice'

const Toast = () => {
  const dispatch = useDispatch()
  const toasts = useSelector((state) => state.toast.toasts)

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id))
      }, toast.duration)

      return () => clearTimeout(timer)
    })
  }, [toasts, dispatch])

  return (
    <CToaster placement="top-end">
      {toasts.map((toast) => (
        <CToast
          key={toast.id}
          visible={true}
          color={toast.type}
          className="text-white align-items-center"
        >
          <CToastHeader closeButton>
            {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
          </CToastHeader>
          <CToastBody>{toast.message}</CToastBody>
        </CToast>
      ))}
    </CToaster>
  )
}

export default Toast