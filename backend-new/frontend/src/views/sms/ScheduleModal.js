import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik, FieldArray } from 'formik'
import * as Yup from 'yup'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CInputGroup,
  CInputGroupText,
  CCard,
  CCardBody,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { createSchedule, updateSchedule } from '../../store/slices/smsSlice'
import { useToast } from '../../hooks/useToast'
import TimezonePicker from '../../components/TimezonePicker'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  template: Yup.string().required('Template is required'),
  scheduledTime: Yup.date()
    .required('Scheduled time is required')
    .min(new Date(), 'Scheduled time must be in the future'),
  recipients: Yup.array().of(
    Yup.object().shape({
      phoneNumber: Yup.string()
        .required('Phone number is required')
        .test('valid-phone', 'Invalid phone number', (value) => {
          if (!value) return false;
          const phoneNumber = parsePhoneNumberFromString(value);
          return phoneNumber ? phoneNumber.isValid() : false;
        }),
      variables: Yup.object()
    })
  ).min(1, 'At least one recipient is required'),
  timeWindow: Yup.object().shape({
    enabled: Yup.boolean(),
    timezone: Yup.string().when('enabled', {
      is: true,
      then: Yup.string().required('Timezone is required when time window is enabled')
    }),
    startTime: Yup.string().when('enabled', {
      is: true,
      then: Yup.string()
        .required('Start time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)')
    }),
    endTime: Yup.string().when('enabled', {
      is: true,
      then: Yup.string()
        .required('End time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)')
    })
  }),
  retryConfig: Yup.object().shape({
    enabled: Yup.boolean(),
    maxAttempts: Yup.number().when('enabled', {
      is: true,
      then: Yup.number()
        .required('Max attempts is required')
        .min(1, 'Min attempts is 1')
        .max(5, 'Max attempts is 5')
    }),
    backoffDelay: Yup.number().when('enabled', {
      is: true,
      then: Yup.number()
        .required('Backoff delay is required')
        .min(60, 'Min delay is 60 seconds')
        .max(3600, 'Max delay is 3600 seconds')
    })
  })
});

const ScheduleModal = ({ show, onClose, schedule = null }) => {
  const dispatch = useDispatch()
  const { showToast } = useToast()