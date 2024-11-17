# QuantumMF Tools Dashboard

A comprehensive enterprise-grade web application portal designed to automate daily tasks and streamline operations for internal teams. This platform provides a centralized hub for task automation, API integrations, and team collaboration with a focus on security, scalability, and ease of use.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📚 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technical Stack](#-technical-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development Guide](#-development-guide)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 📋 Project Overview

### Purpose
The QuantumMF Tools Dashboard serves as a unified platform that:
- Automates repetitive daily tasks
- Centralizes API integrations (Zoho CRM, Infobip, etc.)
- Provides secure user authentication with AD integration
- Offers role-based access control
- Enables easy addition of new tools and automations

### Current Implementation Status

### ✅ Completed Components

1. Authentication System
   - Secure JWT-based authentication
   - Token refresh mechanism
   - Protected route middleware
   - Role-based access control
   - Session management
   - AD integration foundation

2. API Key Management System
   - Complete CRUD operations
   - Real-time key rotation
   - Usage monitoring and analytics
   - Rate limiting implementation
   - Secure storage and encryption
   - Activity logging
   - Usage statistics and charts
   - Automatic key expiration
   - Validation and error handling
   - Toast notification system

### 🏗️ In Progress

### 🏗️ In Progress

1. SMS Automation System
   - ✅ Template Management Interface
     - Template creation/editing with variable support
     - Template preview and validation
     - Template list with filtering and search
     - Template cloning and deletion
   - ✅ Dynamic Scheduling System
     - Schedule creation with recipient management
     - Time window configuration (timezone-aware)
     - Retry configuration for failed messages
     - Schedule filtering and status tracking
     - Schedule statistics and monitoring
   - 🏗️ Message Queue Implementation (Next Phase)
     - Message queue setup
     - Worker process implementation
     - Rate limiting and throttling
     - Error handling and retries
   - Status Tracking and Reporting
   - Integration with Infobip

### Recent Updates (November 17, 2024)
- Implemented complete SMS template management system
- Added dynamic scheduling system with timezone support
- Implemented recipient variable validation
- Added schedule status tracking and monitoring
- Added retry configuration for failed messages
- Implemented schedule filtering and search capabilities

### 🔜 Planned Features

1. User Management
   - Role-based access control
   - User activity tracking
   - Permission management
   - Admin dashboard

2. System Monitoring
   - Real-time metrics
   - Performance monitoring
   - Error tracking
   - Resource utilization

3. Security Enhancements
   - Advanced encryption
   - Audit logging
   - Intrusion detection
   - Compliance reporting

## 🎯 Features

### 1. API Integration Management
- Secure credential storage
- Dynamic API key rotation
- Usage monitoring and logging
- Support for multiple services:
  - Zoho CRM
  - Infobip
  - More to come

### 2. SMS Automation System
- Template management
- Dynamic scheduling
- Delivery tracking
- Analytics dashboard

### 3. User Management
- Role-based access control
- AD integration
- Activity logging
- Session management

### 4. Security Features
- JWT authentication
- API key encryption
- Rate limiting
- Input validation
- XSS protection

## 🛠 Technical Stack

### Backend Architecture
- **Runtime Environment**: Node.js 20.x
  - Express.js 4.x framework
  - PM2 process manager
  - Winston logging
  - Rate limiting middleware

- **Database**: MongoDB 7.x
  - Mongoose ODM
  - Replica set configuration
  - Automated backups
  - Connection pooling

- **Authentication & Security**:
  - JWT token-based auth
  - AD/LDAP integration
  - bcrypt password hashing
  - API key encryption
  - CORS protection
  - Helmet security headers

- **API Documentation**:
  - Swagger/OpenAPI 3.0
  - JSDoc comments
  - Postman collections
  - API versioning

### Frontend Architecture
- **Core Framework**: React.js 18.x
  - Function components
  - React Router v6
  - Custom hooks
  - Error boundaries

- **State Management**:
  - Redux Toolkit
  - RTK Query
  - Redux Persist
  - Redux Thunk

- **UI Framework**: CoreUI Pro
  - Responsive layouts
  - Custom components
  - Dark/Light themes
  - Icon packs

- **Form Management**:
  - Formik forms
  - Yup validation
  - Custom validators
  - File uploads

- **Data Visualization**:
  - Chart.js
  - React Charts
  - D3.js integration
  - Custom dashboards

### Development Infrastructure
- **Version Control**:
  - Git
  - GitHub Actions
  - Branch protection
  - Code reviews

- **Code Quality**:
  - ESLint configuration
  - Prettier formatting
  - Husky pre-commit hooks
  - TypeScript ready

- **Testing Framework**:
  - Jest unit tests
  - React Testing Library
  - Cypress E2E tests
  - API mocking

- **Development Tools**:
  - VS Code configuration
  - Hot module reloading
  - Chrome DevTools
  - Redux DevTools

### Security Implementations
- **Authentication**:
  - JWT tokens
  - Refresh tokens
  - Session management
  - OAuth 2.0 ready

- **API Security**:
  - Rate limiting
  - CORS policies
  - API key rotation
  - Request validation

- **Data Protection**:
  - AES-256 encryption
  - Secure headers
  - XSS prevention
  - CSRF protection

## 📁 Project Structure

### Backend Structure
```bash
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js    # Authentication logic
│   │   ├── apiKeyController.js  # API key management
│   │   └── smsController.js     # SMS automation
│   ├── models/              # Database schemas
│   │   ├── User.js            # User model
│   │   ├── ApiKey.js          # API key model
│   │   └── SmsTemplate.js     # SMS template model
│   ├── routes/              # API routes
│   │   ├── auth.js            # Auth endpoints
│   │   ├── apiKeys.js         # API key endpoints
│   │   └── sms.js             # SMS endpoints
│   ├── middleware/          # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   ├── validation.js      # Request validation
│   │   └── rateLimit.js       # Rate limiting
│   ├── services/           # Business logic
│   │   ├── authService.js     # Auth service
│   │   ├── apiKeyService.js   # API key service
│   │   └── smsService.js      # SMS service
│   ├── utils/              # Helper functions
│   │   ├── crypto.js          # Encryption utilities
│   │   ├── logger.js          # Logging setup
│   │   └── validation.js      # Validation helpers
│   └── config/            # Configuration
│       ├── database.js        # Database config
│       ├── auth.js            # Auth config
│       └── api.js             # API config
├── tests/                # Test suites
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test data
└── docs/                # Documentation
    ├── api/                # API docs
    ├── setup/              # Setup guides
    └── schemas/            # Data schemas

### Frontend Structure
```bash
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Auth/             # Auth components
│   │   ├── ApiKeys/          # API key components
│   │   ├── SMS/              # SMS components
│   │   └── shared/           # Shared components
│   ├── views/              # Page components
│   │   ├── dashboard/        # Dashboard view
│   │   ├── api-keys/         # API key management
│   │   ├── sms/              # SMS automation
│   │   └── settings/         # Settings pages
│   ├── store/              # Redux setup
│   │   ├── slices/           # Redux slices
│   │   │   ├── authSlice.js    # Auth state
│   │   │   ├── apiKeysSlice.js # API keys state
│   │   │   └── smsSlice.js     # SMS state
│   │   └── index.js          # Store configuration
│   ├── services/           # API services
│   │   ├── api.js            # API client
│   │   ├── auth.js           # Auth service
│   │   └── sms.js            # SMS service
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.js        # Auth hook
│   │   ├── useToast.js       # Toast hook
│   │   └── useApi.js         # API hook
│   ├── utils/              # Utilities
│   │   ├── validation.js     # Form validation
│   │   ├── format.js         # Formatting
│   │   └── storage.js        # Storage helpers
│   ├── assets/             # Static assets
│   │   ├── images/           # Images
│   │   ├── icons/            # Icons
│   │   └── styles/           # Style assets
│   └── layouts/            # Page layouts
│       ├── DefaultLayout/     # Main layout
│       └── AuthLayout/        # Auth layout
├── public/               # Static files
└── tests/               # Test files
    ├── unit/              # Unit tests
    ├── integration/       # Integration tests
    └── e2e/               # E2E tests
```

## 🚀 Getting Started

### Prerequisites
```bash
node v20.x
mongodb v7.x
npm v10.x
git
```

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/pixelforegllc/quantummftools-dash.git
cd quantummftools-dash
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
```bash
# Backend
cp .env.example .env
# Edit .env with your settings

# Frontend
cp .env.example .env
# Edit .env with your settings
```

5. Start development servers:
```bash
# Backend
npm run dev

# Frontend
npm start
```

## 💻 Development Guide

### Adding New Tools

1. Backend Implementation:
```javascript
// 1. Create Model
const toolSchema = new mongoose.Schema({
    name: String,
    config: Object,
    status: String
});

// 2. Create Controller
const toolController = {
    create: async (req, res) => {
        // Implementation
    }
};

// 3. Add Routes
router.post('/tools', toolController.create);
```

2. Frontend Implementation:
```javascript
// 1. Create Component
const ToolComponent = () => {
    // Implementation
};

// 2. Add to Navigation
const routes = [{
    path: '/tool',
    component: ToolComponent
}];
```

### Tool Integration Process

1. Planning Phase:
   - Define requirements
   - Design database schema
   - Plan API endpoints
   - Design UI components

2. Implementation Phase:
   - Create backend endpoints
   - Implement frontend interface
   - Add tests
   - Update documentation

3. Testing Phase:
   - Unit tests
   - Integration tests
   - UI testing
   - Security testing

4. Deployment Phase:
   - Code review
   - Testing in staging
   - Production deployment
   - Monitoring setup

## 🔒 Security Implementations

1. API Security:
   - JWT authentication
   - Rate limiting
   - Request validation
   - API key encryption

2. Data Security:
   - Database encryption
   - Secure credential storage
   - Regular security audits

3. Infrastructure Security:
   - VPC configuration
   - Firewall rules
   - SSL/TLS encryption

## 📊 Monitoring & Logging

### Application Monitoring
- PM2 process management
- Response time tracking
- Error rate monitoring
- Resource utilization

### Business Metrics
- API usage statistics
- User activity tracking
- Tool performance metrics
- Integration status

## 🚀 Deployment

### Infrastructure Details
- **Network Name**: webapp-vpc-prod
- **IP Range**: 10.124.32.0/20
- **Domain**: quantummftools.com

### Application Server
- **Hostname**: webapp-main-prod
- **Public IP**: 164.92.79.175
- **Private IP**: 10.124.32.4

### Database Server
- **Hostname**: webapp-db-prod
- **Public IP**: 144.126.213.183
- **Private IP**: 10.124.32.2

## 🔄 Ongoing Development

### Current Sprint Focus
1. Authentication System Implementation
2. SMS Automation Interface
3. API Integration Tests
4. Documentation Updates

### Upcoming Features
1. Real-time Notifications
2. Advanced Analytics
3. Automated Reports
4. Integration Templates

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Additional Resources

- [API Documentation](docs/api.md)
- [Development Guide](docs/development.md)
- [Deployment Guide](docs/deployment.md)
- [Security Guidelines](docs/security.md)

## 👥 Project Contacts

For questions and support:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

## 📅 Development Progress Log

### November 14, 2024
- Initial project setup
- Backend API structure implementation
- Frontend CoreUI integration
- API key management system
- Basic documentation

### November 17, 2024
- Added SMS Template Management System
  - Template creation and editing with variable support
  - Template preview and validation
  - Template list with filtering and search
- Implemented Dynamic Scheduling System
  - Schedule creation with recipient management
  - Time window configuration (timezone-aware)
  - Retry configuration for failed messages
  - Schedule filtering and status tracking

[Additional development progress will be logged here]