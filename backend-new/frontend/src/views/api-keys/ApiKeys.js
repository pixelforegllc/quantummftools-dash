import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { Formik } from 'formik'
import * as Yup from 'yup'

const ApiKeys = () => {
  const [visible, setVisible] = useState(false)
  const dispatch = useDispatch()
  const apiKeys = useSelector((state) => state.apiKeys.items)

  const validationSchema = Yup.object().shape({
    service: Yup.string().required('Service is required'),
    apiKey: Yup.string().required('API Key is required'),
    description: Yup.string(),
  })

  const initialValues = {
    service: '',
    apiKey: '',
    description: '',
  }

  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(createApiKey(values))
    setSubmitting(false)
    setVisible(false)
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>API Keys</strong>
              <CButton
                color="primary"
                size="sm"
                className="float-end"
                onClick={() => setVisible(true)}
              >
                Add New API Key
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable hover>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Service</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Created</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {apiKeys.map((key) => (
                    <CTableRow key={key.id}>
                      <CTableDataCell>{key.service}</CTableDataCell>
                      <CTableDataCell>{key.description}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={key.isActive ? 'success' : 'danger'}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(key.createdAt).toLocaleDateString()}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color="primary"
                          variant="ghost"
                          size="sm"
                          className="me-2"
                        >
                          Edit
                        </CButton>
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                        >
                          Delete
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Add New API Key</CModalTitle>
        </CModalHeader>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
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
            <form onSubmit={handleSubmit}>
              <CModalBody>
                <CForm>
                  <div className="mb-3">
                    <CFormSelect
                      name="service"
                      value={values.service}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        errors.service && touched.service ? 'is-invalid' : ''
                      }
                    >
                      <option value="">Select Service</option>
                      <option value="zoho">Zoho CRM</option>
                      <option value="infobip">Infobip</option>
                    </CFormSelect>
                    {errors.service && touched.service && (
                      <div className="invalid-feedback">{errors.service}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormInput
                      type="text"
                      name="apiKey"
                      placeholder="Enter API Key"
                      value={values.apiKey}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={
                        errors.apiKey && touched.apiKey ? 'is-invalid' : ''
                      }
                    />
                    {errors.apiKey && touched.apiKey && (
                      <div className="invalid-feedback">{errors.apiKey}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormTextarea
                      name="description"
                      placeholder="Description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows="3"
                    />
                  </div>
                </CForm>
              </CModalBody>
              <CModalFooter>
                <CButton
                  color="secondary"
                  onClick={() => setVisible(false)}
                >
                  Close
                </CButton>
                <CButton
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Save API Key
                </CButton>
              </CModalFooter>
            </form>
          )}
        </Formik>
      </CModal>
    </>
  )
}

export default ApiKeys