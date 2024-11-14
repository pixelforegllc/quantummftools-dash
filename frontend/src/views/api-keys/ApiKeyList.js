import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
  CBadge,
  CTooltip,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilPencil,
  cilTrash,
  cilReload,
  cilWarning,
} from '@coreui/icons'
import { formatDistanceToNow } from 'date-fns'
import { fetchApiKeys, rotateApiKey } from '../../store/slices/apiKeysSlice'
import ApiKeyModal from './ApiKeyModal'
import DeleteConfirmModal from '../../components/DeleteConfirmModal'
import { useToast } from '../../hooks/useToast'

const ApiKeyList = () => {
  const dispatch = useDispatch()
  const { showToast } = useToast()
  const { items: apiKeys, loading, error } = useSelector((state) => state.apiKeys)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [rotatingKey, setRotatingKey] = useState(null)

  useEffect(() => {
    dispatch(fetchApiKeys())
  }, [dispatch])

  const handleAdd = () => {
    setSelectedKey(null)
    setShowModal(true)
  }

  const handleEdit = (key) => {
    setSelectedKey(key)
    setShowModal(true)
  }

  const handleDelete = (key) => {
    setSelectedKey(key)
    setShowDeleteModal(true)
  }

  const handleRotate = async (key) => {
    try {
      setRotatingKey(key.id)
      await dispatch(rotateApiKey(key.id)).unwrap()
      showToast('API key rotated successfully', 'success')
    } catch (error) {
      showToast(error.message || 'Failed to rotate API key', 'error')
    } finally {
      setRotatingKey(null)
    }
  }

  const getBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'expired':
        return 'danger'
      case 'rotating':
        return 'warning'
      default:
        return 'primary'
    }
  }

  const getUsageStatus = (usage) => {
    const percentage = (usage.current / usage.limit) * 100
    if (percentage >= 90) return { color: 'danger', message: 'Near limit' }
    if (percentage >= 75) return { color: 'warning', message: 'High usage' }
    return { color: 'success', message: 'Normal' }
  }

  if (loading) {
    return (
      <div className="text-center my-3">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center my-3 text-danger">
        <CIcon icon={cilWarning} className="me-2" />
        {error}
      </div>
    )
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
                onClick={handleAdd}
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add New Key
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Service</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Usage</CTableHeaderCell>
                    <CTableHeaderCell>Last Rotated</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {apiKeys.map((key) => {
                    const usageStatus = getUsageStatus(key.usage)
                    return (
                      <CTableRow key={key.id}>
                        <CTableDataCell>
                          <strong>{key.service}</strong>
                        </CTableDataCell>
                        <CTableDataCell>{key.description}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getBadgeColor(key.status)}>
                            {key.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CTooltip
                            content={`${key.usage.current}/${key.usage.limit} calls`}
                          >
                            <CBadge color={usageStatus.color}>
                              {usageStatus.message}
                            </CBadge>
                          </CTooltip>
                        </CTableDataCell>
                        <CTableDataCell>
                          {formatDistanceToNow(new Date(key.lastRotated), {
                            addSuffix: true,
                          })}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            color="info"
                            variant="ghost"
                            size="sm"
                            className="me-2"
                            onClick={() => handleRotate(key)}
                            disabled={rotatingKey === key.id}
                          >
                            {rotatingKey === key.id ? (
                              <CSpinner size="sm" />
                            ) : (
                              <CIcon icon={cilReload} />
                            )}
                          </CButton>
                          <CButton
                            color="primary"
                            variant="ghost"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(key)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(key)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <ApiKeyModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiKey={selectedKey}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          // Handle delete confirmation
          setShowDeleteModal(false)
        }}
        title="Delete API Key"
        message="Are you sure you want to delete this API key? This action cannot be undone."
      />
    </>
  )
}

export default ApiKeyList