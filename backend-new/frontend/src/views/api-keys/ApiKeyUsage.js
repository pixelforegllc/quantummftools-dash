import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CChart,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import { getApiKeyUsage } from '../../store/slices/apiKeysSlice'
import { formatNumber } from '../../utils/format'

const TIME_RANGES = {
  '24h': 'Last 24 Hours',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
}

const ApiKeyUsage = ({ apiKeyId }) => {
  const dispatch = useDispatch()
  const [timeRange, setTimeRange] = useState('24h')
  const [usageData, setUsageData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true)
      try {
        const data = await dispatch(
          getApiKeyUsage({ id: apiKeyId, timeRange })
        ).unwrap()
        setUsageData(data)
      } catch (error) {
        console.error('Failed to fetch usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsageData()
  }, [dispatch, apiKeyId, timeRange])

  const getUsagePercentage = () => {
    if (!usageData) return 0
    return Math.round((usageData.current / usageData.limit) * 100)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'danger'
    if (percentage >= 75) return 'warning'
    return 'success'
  }

  const chartData = {
    labels: usageData?.timeline.map((point) => point.timestamp) || [],
    datasets: [
      {
        label: 'API Calls',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        borderColor: 'rgb(0, 123, 255)',
        pointBackgroundColor: 'rgb(0, 123, 255)',
        data: usageData?.timeline.map((point) => point.count) || [],
        fill: true,
      },
    ],
  }

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>API Key Usage</strong>
            <CDropdown>
              <CDropdownToggle color="primary" size="sm">
                {TIME_RANGES[timeRange]}
              </CDropdownToggle>
              <CDropdownMenu>
                {Object.entries(TIME_RANGES).map(([value, label]) => (
                  <CDropdownItem
                    key={value}
                    onClick={() => setTimeRange(value)}
                    active={timeRange === value}
                  >
                    {label}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center py-5">
                <CSpinner />
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Usage ({getUsagePercentage()}%)</span>
                    <span>
                      {formatNumber(usageData?.current)} /{' '}
                      {formatNumber(usageData?.limit)} calls
                    </span>
                  </div>
                  <CProgress
                    value={getUsagePercentage()}
                    color={getProgressColor(getUsagePercentage())}
                  />
                </div>

                <div className="chart-wrapper">
                  <CChart
                    type="line"
                    data={chartData}
                    options={chartOptions}
                    style={{ height: '300px' }}
                  />
                </div>

                <div className="row mt-4">
                  <div className="col-sm-6 col-lg-3">
                    <div className="border rounded p-3 text-center">
                      <div className="text-medium-emphasis small">
                        Total Calls
                      </div>
                      <div className="fs-4 fw-semibold">
                        {formatNumber(usageData?.total)}
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="border rounded p-3 text-center">
                      <div className="text-medium-emphasis small">
                        Success Rate
                      </div>
                      <div className="fs-4 fw-semibold">
                        {usageData?.successRate}%
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="border rounded p-3 text-center">
                      <div className="text-medium-emphasis small">
                        Avg Response Time
                      </div>
                      <div className="fs-4 fw-semibold">
                        {usageData?.avgResponseTime}ms
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="border rounded p-3 text-center">
                      <div className="text-medium-emphasis small">
                        Error Rate
                      </div>
                      <div className="fs-4 fw-semibold">
                        {usageData?.errorRate}%
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ApiKeyUsage