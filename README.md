# Durjog Prohori - Disaster Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

**Durjog Prohori** is a comprehensive disaster management mobile web application designed to help communities prepare for, respond to, and recover from natural disasters. The system provides real-time emergency response capabilities, resource coordination, and community support features.

The name "Durjog Prohori" comes from Bengali, meaning "Disaster Guard" - reflecting the application's mission to protect and assist communities during natural disasters.

## ✨ Features

### 🚨 Emergency Response
- **SOS Reporting**: Real-time emergency situation reporting with GPS coordinates
- **Disaster Tracking**: Monitor and track various disaster types (earthquakes, floods, cyclones, landslides, tsunamis, fires)
- **Live Map Integration**: Interactive disaster map with real-time updates
- **Emergency Alerts**: Automated notification system for disaster warnings

### 👥 Multi-Role User System
- **Citizens**: Report emergencies, access information, request help
- **Firefighters**: Emergency response management, team coordination
- **NGOs**: Resource management, donation coordination, relief operations
- **Authorities**: Overall disaster management, coordination between agencies
- **Admins**: System administration and user management

### 🤝 Community Features
- **Donation System**: Monetary and resource donation platform
- **Community Support**: Peer-to-peer assistance and resource sharing
- **Resource Tracking**: Monitor available resources and supplies
- **Volunteer Coordination**: Organize and manage volunteer activities

### 📱 User Experience
- **Responsive Design**: Mobile-first approach with cross-platform compatibility
- **Real-time Updates**: Live data synchronization using Socket.IO
- **Multilingual Support**: i18next integration for localization
- **Offline Capabilities**: Basic functionality during network disruptions

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js (Express.js framework)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Real-time Communication**: Socket.IO
- **File Upload**: Multer middleware
- **Email Service**: Nodemailer

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - Bootstrap for component library
  - React Icons for iconography
- **Maps**: Leaflet with React-Leaflet integration
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Internationalization**: i18next

### Development Tools
- **Process Manager**: Nodemon for development
- **Build Tool**: Create React App
- **Concurrency**: Concurrently for running multiple processes
- **Linting**: ESLint with React plugins

## 🏗 Architecture

```
Durjog_Prohori/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Utility functions
│   │   └── store/          # State management
│   └── public/             # Static assets
├── models/                 # MongoDB/Mongoose models
├── routes/                 # Express.js API routes
├── middlewares/            # Custom middleware functions
├── scripts/                # Utility and setup scripts
├── server/                 # Additional server configurations
└── public/                 # Server static files
```

### Database Collections
- **users**: Citizen user accounts and profiles
- **sreport**: SOS emergency reports
- **sitereport**: General site reports and updates
- **admins**: System administrator accounts
- **firefighters**: Firefighter personnel data
- **ngos**: NGO organization profiles
- **authorities**: Government authority accounts
- **disasters**: Disaster event records (by type)
- **donations**: Donation transactions and records
- **notifications**: User notification system

## 🚀 Installation

### Prerequisites
- Node.js (v14.0.0 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/mahmudulmashrafe/Durjog_Prohori.git
cd Durjog_Prohori
```

### Step 2: Install Dependencies

**Backend Dependencies:**
```bash
npm install
```

**Frontend Dependencies:**
```bash
cd client
npm install
cd ..
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/durjog-prohori

# Server Configuration
PORT=5002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Firebase Configuration (if using Firebase services)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

### Step 4: Database Setup
```bash
# Start MongoDB service
mongod

# The application will automatically create default users:
# - Admin: username='admin', password='admin'
# - Firefighter: username='fire', password='fire'
# - NGO: username='ngo', password='ngo'
# - Authority: username='authority', password='authority'
```

## ⚙️ Configuration

### Default User Accounts
The system automatically creates default accounts for testing:

| Role | Username | Password | Description |
|------|----------|----------|-------------|
| Admin | admin | admin | System administrator |
| Firefighter | fire | fire | Emergency responder |
| NGO | ngo | ngo | Relief organization |
| Authority | authority | authority | Government authority |

**⚠️ Important**: Change these default passwords in production!

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/durjog-prohori` |
| `PORT` | Server port number | `5002` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `NODE_ENV` | Environment mode | `development` |

## 🎮 Usage

### Development Mode
```bash
# Run both client and server concurrently
npm run dev

# Or run separately:
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend client
npm run client
```

### Production Mode
```bash
# Build the client
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run client and server concurrently |
| `npm run server` | Start backend server with nodemon |
| `npm run client` | Start React development server |
| `npm run build` | Build client for production |
| `npm start` | Start production server |

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002
- **API Status**: http://localhost:5002/api/server-status

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/verify-email      # Email verification
GET  /api/auth/profile           # Get user profile
```

### Emergency Endpoints
```
POST /api/sos-reports            # Create SOS report
GET  /api/sos-reports            # Get SOS reports
PUT  /api/sos-reports/:id        # Update SOS report
DELETE /api/sos-reports/:id      # Delete SOS report
```

### Disaster Management
```
GET  /api/disasters              # Get disaster events
POST /api/disasters/:type        # Create disaster report
GET  /api/disasters/:type/:id    # Get specific disaster
```

### Donation System
```
POST /api/donations              # Create donation
GET  /api/donations              # Get donations
GET  /api/donations/stats        # Donation statistics
```

### User Management
```
GET  /api/users                  # Get all users (admin)
PUT  /api/users/:id              # Update user
DELETE /api/users/:id            # Delete user (admin)
```

## 👤 User Roles

### 🏠 Citizens
- Create and manage personal profiles
- Report emergency situations via SOS
- Access disaster information and alerts
- Participate in community support
- Make donations and request assistance

### 🚒 Firefighters
- Respond to emergency calls
- Create incident reports
- Manage team and equipment
- Access specialized emergency tools
- Coordinate with other agencies

### 🏥 NGOs
- Manage relief operations
- Coordinate resource distribution
- Track donations and supplies
- Organize volunteer activities
- Generate impact reports

### 🏛️ Authorities
- Oversee disaster management operations
- Coordinate between agencies
- Issue public alerts and warnings
- Manage large-scale emergency response
- Access comprehensive system data

### ⚙️ Administrators
- Manage user accounts and permissions
- Configure system settings
- Monitor application performance
- Generate system reports
- Maintain data integrity

## 🗄️ Database Schema

### User Schema
```javascript
{
  username: String (unique),
  name: String,
  phone_number: String (required, unique),
  email: String,
  blood_type: Enum,
  address: String,
  is_phone_verified: Boolean,
  is_email_verified: Boolean,
  profileImage: String,
  online: Boolean,
  lastActive: Date
}
```

### SOS Report Schema
```javascript
{
  userId: ObjectId (ref: User),
  name: String (required),
  location: String (required),
  latitude: Number (required),
  longitude: Number (required),
  disasterType: Enum (required),
  status: Enum ['active', 'resolved', 'cancelled'],
  phoneNumber: String (required),
  visible: Number
}
```

### Disaster Schemas
Specialized schemas for different disaster types:
- `DisasterEarthquake`
- `DisasterFlood`
- `DisasterCyclone`
- `DisasterFire`
- `DisasterLandslide`
- `DisasterTsunami`

## 🚀 Deployment

### Local Development
```bash
# Clone and install
git clone <repository>
cd Durjog_Prohori
npm install
cd client && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your configurations

# Start development
npm run dev
```

### Production Deployment
```bash
# Build the application
npm run build

# Set production environment
export NODE_ENV=production

# Start with PM2 (recommended)
pm2 start server.js --name "durjog-prohori"

# Or start directly
npm start
```

### Docker Deployment (Future Enhancement)
```dockerfile
# Dockerfile example (to be implemented)
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5002
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style Guidelines
- Use ESLint configuration provided
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Maintain consistent naming conventions

### Testing
```bash
# Run client tests
cd client && npm test

# Run server tests (to be implemented)
npm test
```

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

### Contact Information
- **Project Maintainer**: Mahmudulmashrafe
- **Repository**: [GitHub Repository](https://github.com/mahmudulmashrafe/Durjog_Prohori)
- **Issues**: [Report Issues](https://github.com/mahmudulmashrafe/Durjog_Prohori/issues)

### Getting Help
1. Check the documentation above
2. Search existing issues on GitHub
3. Create a new issue with detailed description
4. Join community discussions

### Frequently Asked Questions

**Q: How do I reset the default passwords?**
A: Access the admin panel and update user credentials, or modify the setup functions in `server.js`.

**Q: Can I customize the disaster types?**
A: Yes, modify the enum values in the respective model files and update the frontend components.

**Q: How do I add new user roles?**
A: Create new model files, add authentication routes, and implement role-based access control.

**Q: Is there mobile app support?**
A: Currently, it's a mobile-responsive web application. Native mobile apps can be developed using React Native.

---

**Built with ❤️ for disaster-affected communities worldwide**

*This application aims to save lives and provide critical assistance during natural disasters. Every contribution helps make communities safer and more resilient.*
