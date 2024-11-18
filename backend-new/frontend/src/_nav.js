import React from 'react'
import {
  cilSpeedometer,
  cilKey,
  cilEnvelopeLetter,
  cilSettings,
  cilPeople,
} from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'API Keys',
    to: '/api-keys',
    icon: <CIcon icon={cilKey} customClassName="nav-icon" />,
  },
  {
    component: CNavGroup,
    name: 'SMS Automation',
    to: '/sms',
    icon: <CIcon icon={cilEnvelopeLetter} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Templates',
        to: '/sms/templates',
      },
      {
        component: CNavItem,
        name: 'Schedule',
        to: '/sms/schedule',
      },
      {
        component: CNavItem,
        name: 'History',
        to: '/sms/history',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'User Management',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Users',
        to: '/users',
      },
      {
        component: CNavItem,
        name: 'Roles',
        to: '/roles',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav