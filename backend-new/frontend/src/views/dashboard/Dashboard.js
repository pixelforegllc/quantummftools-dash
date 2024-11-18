import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CWidgetStatsF,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
  cilEnvelopeClosed,
  cilSettings,
  cilSpeedometer,
} from '@coreui/icons'

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    messages: 0,
    apiCalls: 0,
    tools: 0,
  })

  useEffect(() => {
    // TODO: Fetch real stats from the backend
    setStats({
      users: 15,
      messages: 1250,
      apiCalls: 5000,
      tools: 8,
    })
  }, [])

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <h2>Dashboard</h2>
        </CCol>
      </CRow>
      <CRow>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilPeople} height={24} />}
            title="Users"
            value={stats.users}
            color="primary"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilEnvelopeClosed} height={24} />}
            title="Messages Sent"
            value={stats.messages}
            color="info"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilSpeedometer} height={24} />}
            title="API Calls"
            value={stats.apiCalls}
            color="warning"
          />
        </CCol>
        <CCol xs={12} sm={6} lg={3}>
          <CWidgetStatsF
            className="mb-3"
            icon={<CIcon icon={cilSettings} height={24} />}
            title="Active Tools"
            value={stats.tools}
            color="danger"
          />
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12} lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Recent Activity</strong>
            </CCardHeader>
            <CCardBody>
              {/* TODO: Add activity feed */}
              <p>Recent system activity will be displayed here.</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>System Status</strong>
            </CCardHeader>
            <CCardBody>
              {/* TODO: Add system status information */}
              <p>System status and health metrics will be displayed here.</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard