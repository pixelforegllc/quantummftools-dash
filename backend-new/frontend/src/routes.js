import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ApiKeys = React.lazy(() => import('./views/api-keys/ApiKeys'))
const SmsAutomation = React.lazy(() => import('./views/sms/SmsAutomation'))
const Settings = React.lazy(() => import('./views/settings/Settings'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/api-keys', name: 'API Keys', element: ApiKeys },
  { path: '/sms', name: 'SMS Automation', element: SmsAutomation },
  { path: '/settings', name: 'Settings', element: Settings },
]

export default routes