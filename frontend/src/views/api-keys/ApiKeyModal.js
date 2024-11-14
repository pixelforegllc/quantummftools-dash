import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Formik } from 'formik'
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
  CFormTextarea,
  CFormFeedback,
  CAlert,
} from '@coreui/react'
import { createApiKey, updateApiKey } from '../../store/slices/apiKeysSlice'
import { useToast } from '../../hooks/useToast'

const validationSchema = Yup.object().shape({
  service: Yup.string()
    .required('Service is required')
    .matches(/^[a-zA-Z0-9-_]+$/, 'Service name can only contain letters, numbers, hyphens, and underscores'),
  description: Yup.string().required('Description is required'),
  expiresIn: Yup.number()
    .required('Expiration is required')
    .min(1, 'Minimum expiration is 1 day')
    .max(365, 'Maximum expiration is 365 days'),
  usageLimit: Yup.number()
    .required('Usage limit is required')
    .min(1, 'Minimum limit is 1')
    .max(1000000, 'Maximum limit is 1,000,000'),
})

const ApiKeyModal = ({ show, onClose, apiKey = null }) => {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const isEdit = Boolean(apiKey)

  const initialValues = {
    service: apiKey?.service || '',
    description: apiKey?.description || '',
    expiresIn: apiKey?.expiresIn || 30,
    usageLimit: apiKey?.usage?.limit || 10000,
  }

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const action = isEdit
        ? updateApiKey({ id: apiKey.id, ...values })
        : createApiKey(values)
      
      const result = await dispatch(action).unwrap()
      
      showToast(
        `API key ${isEdit ? 'updated' : 'created'} successfully`,
        'success'
      )
      
      if (!isEdit) {
        // Show the API key value only when creating a new key
        showToast(
          'Make sure to copy your API key now. You won't be able to see it again!',
          'warning',
          10000
        )
      }
      
      resetForm()
      onClose()
      
      return result
    } catch (error) {
      showToast(error.message || 'Failed to save API key', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CModal visible={show} onClose={onClose} size="lg">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <CForm onSubmit={handleSubmit}>
            <CModalHeader>
              <CModalTitle>{isEdit ? 'Edit' : 'Create'} API Key</CModalTitle>
            </CModalHeader>
            <CModalBody>
              {!isEdit && (
                <CAlert color="info">
                  The API key will only be shown once after creation. Make sure to
                  copy it immediately.
                </CAlert>
              )}

              <div className="mb-3">
                <CFormSelect
                  id="service"
                  name="service"
                  label="Service"
                  value={values.service}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={touched.service && errors.service}
                  disabled={isEdit}
                >
                  <option value="">Select a service</option>
                  <option value="zoho">Zoho CRM</option>
                  <option value="infobip">Infobip</option>
                </CFormSelect>
                {touched.service && errors.service && (
                  <CFormFeedback invalid>{errors.service}</CFormFeedback>
                )}
              </div>

              <div className="mb-3">
                <CFormTextarea
                  id="description"
                  name="description"
                  label="Description"
                  placeholder="Enter a description for this API key"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={touched.description && errors.description}
                  rows={3}
                />
                {touched.description && errors.description && (
                  <CFormFeedback invalid>{errors.description}</CFormFeedback>
                )}
              </div>

              <div className="mb-3">
                <CFormInput
                  type="number"
                  id="expiresIn"
                  name="expiresIn"
                  label="Expires In (days)"
                  value={values.expiresIn}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={touched.expiresIn && errors.expiresIn}
                />
                {touched.expiresIn && errors.expiresIn && (
                  <CFormFeedback invalid>{errors.expiresIn}</CFormFeedback>
                )}
              </div>

              <div className="mb-3">
                <CFormInput
                  type="number"
                  id="usageLimit"
                  name="usageLimit"
                  label="Usage Limit (API calls)"
                  value={values.usageLimit}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={touched.usageLimit && errors.usageLimit}
                />
                {touched.usageLimit && errors.usageLimit && (
                  <CFormFeedback invalid>{errors.usageLimit}</CFormFeedback>
                )}
              </div>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={onClose}>
                Cancel
              </CButton>
              <CButton
                color="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </CButton>
            </CModalFooter>
          </CForm>
        )}
      </Formik>
    </CModal>
  )
}

export default ApiKeyModal