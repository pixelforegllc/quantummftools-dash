import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilOptions,
  cilFilter,
} from '@coreui/icons'
import { format } from 'date-fns'
import {
  fetchTemplates,
  deleteTemplate,
  cloneTemplate,
} from '../../store/slices/smsSlice'
import { useToast } from '../../hooks/useToast'
import TemplateModal from './TemplateModal'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'

const TemplateList = () => {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const { templates, loading, error } = useSelector((state) => state.sms)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    status: 'active',
  })

  useEffect(() => {
    dispatch(fetchTemplates(filters))
  }, [dispatch, filters])

  const handleAdd = () => {
    setSelectedTemplate(null)
    setShowModal(true)
  }

  const handleEdit = (template) => {
    setSelectedTemplate(template)
    setShowModal(true)
  }

  const handleDelete = (template) => {
    setSelectedTemplate(template)
    setShowDeleteModal(true)
  }

  const handleClone = async (template) => {
    try {
      await dispatch(cloneTemplate(template.id)).unwrap()
      showToast('Template cloned successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Failed to clone template', 'error')
    }
  }

  const confirmDelete = async () => {
    try {
      await dispatch(deleteTemplate(selectedTemplate.id)).unwrap()
      showToast('Template deleted successfully', 'success')
      setShowDeleteModal(false)
    } catch (error) {
      showToast(error.message || 'Failed to delete template', 'error')
    }
  }

  const getStatusBadge = (isActive) => {
    return (
      <CBadge color={isActive ? 'success' : 'danger'}>
        {isActive ? 'Active' : 'Inactive'}
      </CBadge>
    )
  }

  const renderFilters = () => (
    <div className="mb-4 d-flex gap-3">
      <CDropdown>
        <CDropdownToggle color="primary" variant="outline">
          <CIcon icon={cilFilter} className="me-2" />
          Category
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={() => setFilters({ ...filters, category: '' })}>
            All
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, category: 'marketing' })}>
            Marketing
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, category: 'transactional' })}>
            Transactional
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, category: 'promotional' })}>
            Promotional
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <CDropdown>
        <CDropdownToggle color="primary" variant="outline">
          <CIcon icon={cilFilter} className="me-2" />
          Language
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={() => setFilters({ ...filters, language: '' })}>
            All
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, language: 'en' })}>
            English
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, language: 'es' })}>
            Spanish
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, language: 'fr' })}>
            French
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      <CDropdown>
        <CDropdownToggle color="primary" variant="outline">
          <CIcon icon={cilFilter} className="me-2" />
          Status
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={() => setFilters({ ...filters, status: '' })}>
            All
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, status: 'active' })}>
            Active
          </CDropdownItem>
          <CDropdownItem onClick={() => setFilters({ ...filters, status: 'inactive' })}>
            Inactive
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </div>
  )

  if (error) {
    return (
      <div className="text-center text-danger">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <strong>SMS Templates</strong>
                <CButton color="primary" onClick={handleAdd}>
                  <CIcon icon={cilPlus} className="me-2" />
                  Add Template
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {renderFilters()}

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner />
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Language</CTableHeaderCell>
                      <CTableHeaderCell>Variables</CTableHeaderCell>
                      <CTableHeaderCell>Usage Count</CTableHeaderCell>
                      <CTableHeaderCell>Last Used</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {templates.map((template) => (
                      <CTableRow key={template.id}>
                        <CTableDataCell>{template.name}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color="info">{template.category}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {template.language.toUpperCase()}
                        </CTableDataCell>
                        <CTableDataCell>
                          {template.variables.length} variables
                        </CTableDataCell>
                        <CTableDataCell>{template.usageCount}</CTableDataCell>
                        <CTableDataCell>
                          {template.lastUsed
                            ? format(new Date(template.lastUsed), 'MMM d, yyyy')
                            : 'Never'}
                        </CTableDataCell>
                        <CTableDataCell>
                          {getStatusBadge(template.isActive)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CDropdown variant="btn-group">
                            <CButton color="primary" variant="outline" onClick={() => handleEdit(template)}>
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CDropdownToggle color="primary" variant="outline" split />
                            <CDropdownMenu>
                              <CDropdownItem onClick={() => handleClone(template)}>
                                Clone Template
                              </CDropdownItem>
                              <CDropdownItem 
                                onClick={() => handleDelete(template)}
                                className="text-danger"
                              >
                                Delete Template
                              </CDropdownItem>
                            </CDropdownMenu>
                          </CDropdown>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <TemplateModal
        show={showModal}
        onClose={() => setShowModal(false)}
        template={selectedTemplate}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
      />
    </>
  )
}

export default TemplateList