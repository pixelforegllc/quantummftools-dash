import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
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
  CFormTextarea,
  CFormCheck,
  CInputGroup,
  CInputGroupText,
  CCard,
  CCardBody,
  CBadge,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { createTemplate, updateTemplate } from '../../store/slices/smsSlice'
import { useToast } from '../../hooks/useToast'

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must not exceed 100 characters'),
  content: Yup.string()
    .required('Content is required')
    .max(1600, 'Content must not exceed 1600 characters'),
  category: Yup.string().required('Category is required'),
  language: Yup.string().required('Language is required'),
  variables: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Variable name is required'),
      key: Yup.string()
        .required('Variable key is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid variable key format'),
      description: Yup.string(),
      required: Yup.boolean(),
    })
  ),
  senderId: Yup.string().max(11, 'Sender ID must not exceed 11 characters'),
  isActive: Yup.boolean(),
})

const TemplateModal = ({ show, onClose, template = null }) => {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const [previewContent, setPreviewContent] = useState('')
  const isEdit = Boolean(template)

  const initialValues = {
    name: template?.name || '',
    content: template?.content || '',
    category: template?.category || '',
    language: template?.language || 'en',
    variables: template?.variables || [],
    senderId: template?.senderId || '',
    isActive: template?.isActive ?? true,
    tags: template?.tags?.join(', ') || '',
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const action = isEdit
        ? updateTemplate({ id: template.id, ...values })
        : createTemplate(values)

      await dispatch(action).unwrap()
      
      showToast(
        `Template ${isEdit ? 'updated' : 'created'} successfully`,
        'success'
      )
      onClose()
    } catch (error) {
      showToast(error.message || 'Failed to save template', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const updatePreview = (content, variables) => {
    let preview = content
    variables.forEach((variable) => {
      const placeholder = `{{${variable.key}}}`
      const sampleValue = `[${variable.name}]`
      preview = preview.replace(new RegExp(placeholder, 'g'), sampleValue)
    })
    setPreviewContent(preview)
  }

  return (
    <CModal visible={show} onClose={onClose} size="lg">
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
          setFieldValue,
        }) => (
          <CForm onSubmit={handleSubmit}>
            <CModalHeader>
              <CModalTitle>
                {isEdit ? 'Edit' : 'Create'} SMS Template
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="mb-3">
                <CFormInput
                  id="name"
                  label="Template Name"
                  placeholder="Enter template name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={touched.name && errors.name}
                  feedback={errors.name}
                />
              </div>

              <div className="mb-3">
                <CFormTextarea
                  id="content"
                  label="Template Content"
                  placeholder="Enter message content with {{variables}}"
                  value={values.content}
                  onChange={(e) => {
                    handleChange(e)
                    updatePreview(e.target.value, values.variables)
                  }}
                  onBlur={handleBlur}
                  invalid={touched.content && errors.content}
                  feedback={errors.content}
                  rows={5}
                />
                <small className="text-medium-emphasis">
                  {values.content.length}/1600 characters
                </small>
              </div>

              {previewContent && (
                <CCard className="mb-3">
                  <CCardBody>
                    <h6>Preview:</h6>
                    <p className="mb-0">{previewContent}</p>
                  </CCardBody>
                </CCard>
              )}

              <div className="row mb-3">
                <div className="col-md-6">
                  <CFormSelect
                    id="category"
                    label="Category"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={touched.category && errors.category}
                    feedback={errors.category}
                  >
                    <option value="">Select category</option>
                    <option value="marketing">Marketing</option>
                    <option value="transactional">Transactional</option>
                    <option value="promotional">Promotional</option>
                  </CFormSelect>
                </div>
                <div className="col-md-6">
                  <CFormSelect
                    id="language"
                    label="Language"
                    value={values.language}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    invalid={touched.language && errors.language}
                    feedback={errors.language}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </CFormSelect>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Variables</label>
                <FieldArray name="variables">
                  {({ push, remove }) => (
                    <>
                      {values.variables.map((variable, index) => (
                        <div key={index} className="mb-2">
                          <CInputGroup>
                            <CInputGroupText>
                              {variable.required && (
                                <CBadge color="danger" className="me-2">
                                  Required
                                </CBadge>
                              )}
                              {`{{${variable.key}}}`}
                            </CInputGroupText>
                            <CFormInput
                              placeholder="Variable name"
                              value={variable.name}
                              onChange={(e) =>
                                setFieldValue(
                                  `variables.${index}.name`,
                                  e.target.value
                                )
                              }
                            />
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={() => remove(index)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CInputGroup>
                        </div>
                      ))}
                      <CButton
                        color="primary"
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          push({
                            name: '',
                            key: `var${values.variables.length + 1}`,
                            description: '',
                            required: false,
                          })
                        }
                      >
                        <CIcon icon={cilPlus} className="me-2" />
                        Add Variable
                      </CButton>
                    </>
                  )}
                </FieldArray>
              </div>

              <div className="mb-3">
                <CFormInput
                  id="senderId"
                  label="Sender ID (optional)"
                  placeholder="Enter sender ID"
                  value={values.senderId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  invalid={touched.senderId && errors.senderId}
                  feedback={errors.senderId}
                />
                <small className="text-medium-emphasis">
                  Maximum 11 characters, alphanumeric only
                </small>
              </div>

              <div className="mb-3">
                <CFormInput
                  id="tags"
                  label="Tags (optional)"
                  placeholder="Enter tags separated by commas"
                  value={values.tags}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="mb-3">
                <CFormCheck
                  id="isActive"
                  label="Template is active"
                  checked={values.isActive}
                  onChange={handleChange}
                />
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
                {isSubmitting ? 'Saving...' : 'Save Template'}
              </CButton>
            </CModalFooter>
          </CForm>
        )}
      </Formik>
    </CModal>
  )
}

export default TemplateModal