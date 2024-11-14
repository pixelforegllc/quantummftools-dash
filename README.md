# QuantumMF Tools Dashboard

A comprehensive enterprise-grade web application portal designed to automate daily tasks and streamline operations for internal teams. This platform provides a centralized hub for task automation, API integrations, and team collaboration with a focus on security, scalability, and ease of use.

## 📋 Project Overview

### Purpose
The QuantumMF Tools Dashboard serves as a unified platform that:
- Automates repetitive daily tasks
- Centralizes API integrations (Zoho CRM, Infobip, etc.)
- Provides secure user authentication with AD integration
- Offers role-based access control
- Enables easy addition of new tools and automations

### Key Features
1. API Integration Management
   - Secure storage of API credentials
   - Dynamic API key rotation
   - Usage monitoring and logging

2. SMS Automation System
   - Template management
   - Scheduling system
   - Delivery tracking
   - Integration with Infobip

3. Zoho CRM Integration
   - Lead management automation
   - Data synchronization
   - Custom workflow triggers

4. User Management
   - AD integration
   - Role-based access control
   - Activity logging
   - Session management

## 🚀 Current Project Status

### Completed Components
- Initial backend setup with Express.js
- API key management system
- Basic security configurations
- MongoDB integration structure

### In Progress
- Authentication system
- Frontend implementation
- Nginx configuration
- Database server setup

### Next Steps
- Deploy frontend with CoreUI
- Implement SMS automation system
- Set up AD integration
- Configure monitoring and logging

## 🏗 Project Structure

```
quantummftools/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   │   └── ApiKey.js
│   │   ├── routes/
│   │   │   └── apiKeys.js
│   │   ├── middleware/
│   │   ├── config/
│   │   └── index.js
│   ├── package.json
│   └── .env
├── frontend/
│   └── (Coming soon - CoreUI implementation)
├── config/
│   └── (Configuration files)
└── docs/
    └── (Documentation files)

```

## 🛠 Technical Stack

### Backend
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Winston for logging

### Frontend (Planned)
- React.js
- CoreUI Admin Dashboard
- Redux for state management
- Axios for API calls

### Infrastructure
- Digital Ocean VPC
- Nginx reverse proxy
- SSL/TLS encryption
- MongoDB database server

## 🔧 Installation & Setup

### Prerequisites
- Node.js v20.x or higher
- MongoDB
- Nginx
- Git

### Backend Setup
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd quantummftools
   ```

2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔄 Adding New Tools

To add new tools to the platform:

1. Backend Integration:
   - Create a new model in `/backend/src/models/`
   - Add corresponding routes in `/backend/src/routes/`
   - Implement controllers in `/backend/src/controllers/`
   - Add any necessary middleware in `/backend/src/middleware/`

2. Frontend Integration:
   - Create a new component in the frontend directory
   - Add route in the frontend router
   - Implement necessary Redux actions/reducers
   - Add to the sidebar navigation

3. Configuration:
   - Add any necessary environment variables
   - Update API documentation
   - Add database migrations if required

## 📋 Current Features

### API Key Management
- Secure storage of API credentials
- CRUD operations for API keys
- Service-specific validation
- Activity tracking

### Security Features
- Helmet.js security headers
- CORS protection
- Rate limiting
- JWT authentication (in progress)

## 🎯 Planned Features

1. SMS Automation Tool
   - Infobip integration
   - Message templating
   - Scheduling system
   - Delivery tracking

2. Zoho CRM Integration
   - Lead management
   - Automated workflows
   - Data synchronization

3. AD Integration
   - Single Sign-On
   - Role-based access control
   - User management

## 🚦 Infrastructure Details

### Application Server
- Hostname: webapp-main-prod
- Public IP: 164.92.79.175
- Private IP: 10.124.32.4

### Database Server
- Hostname: webapp-db-prod
- Public IP: 144.126.213.183
- Private IP: 10.124.32.2

### Network
- VPC Name: webapp-vpc-prod
- IP Range: 10.124.32.0/20

## 📝 Development Guidelines

1. Code Structure
   - Follow MVC pattern
   - Use async/await for asynchronous operations
   - Implement error handling middleware
   - Use TypeScript for new features (planned)

2. Security
   - Never commit sensitive data
   - Use environment variables for configurations
   - Implement input validation
   - Regular security audits

3. Testing
   - Write unit tests for new features
   - Implement integration tests
   - Use Jest for testing framework

## 🔒 Security Considerations

- All API keys are encrypted before storage
- HTTPS enforced for all connections
- Regular security audits planned
- Automated vulnerability scanning

## 📈 Monitoring and Logging

Planned implementation:
- Winston for application logging
- PM2 for process management
- Prometheus for metrics
- Grafana for visualization

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## 📚 Documentation

Additional documentation will be maintained in the `/docs` directory:
- API Documentation
- Deployment Guides
- User Manuals
- Contributing Guidelines

## 🔄 Development Progress

The application is currently in Phase 1 of development:

Phase 1 (Current):
- ✅ Basic backend structure
- ✅ API key management
- 🏗️ Authentication system
- 🏗️ Database setup

Phase 2 (Next):
- Frontend implementation
- SMS automation tool
- User management
- AD integration

Phase 3 (Planned):
- Additional tool integrations
- Advanced automation features
- Reporting system
- Analytics dashboard

## 💬 Support

For support and questions, please create an issue in the repository.

---

## 📜 Development History

[Chat transcript will be added here]
