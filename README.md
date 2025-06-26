# Classroom Management System

A full-stack web application for managing classroom activities, assignments, and course materials. Built with React frontend, Node.js/Express backend, PostgreSQL database, and MinIO for file storage.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Teachers, TAs, Students)
- Attribute-based access control (ABAC) using CASL
- Secure user registration and login

### Course Management
- Create and manage courses
- Course enrollment with unique codes
- Role management (Professor, TA, Student)
- Course streaming and announcements

### Assignment System
- Create and distribute assignments
- File upload support for assignments
- Student submission tracking
- Grading system with feedback
- Grade release control

### Material Management
- Upload and organize course materials
- File sharing with secure access
- Material categorization

### Communication
- Course announcements
- Comment system for materials and assignments
- Real-time updates

### File Storage
- Secure file upload/download using MinIO
- Presigned URLs for direct file access
- File organization by course and type

## 🏗️ Architecture

```
Frontend (React + Vite)
├── Authentication & Routing
├── Course Dashboard
├── Assignment Management
├── Material Sharing
└── Communication Features

Backend (Node.js + Express)
├── REST API
├── JWT Authentication
├── CASL Authorization
├── PostgreSQL Integration
└── MinIO File Storage

Database (PostgreSQL)
├── Users & Authentication
├── Courses & Enrollment
├── Assignments & Submissions
├── Materials & Comments
└── Grades & Feedback

Storage (MinIO)
├── Assignment Files
├── Course Materials
├── Submission Files
└── Profile Pictures
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Passport.js** - Authentication middleware
- **CASL** - Authorization library
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT implementation

### Storage & Infrastructure
- **MinIO** - S3-compatible object storage
- **Docker** - Containerization
- **Nginx Proxy Manager** - Reverse proxy and SSL

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**


## 📁 Project Structure

```
Classroom/
├── Frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service functions
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   └── config/            # Configuration files
│   ├── public/                # Static assets
│   └── dist/                  # Built frontend (generated)
├── controllers/               # API route handlers
├── models/                    # Database models and queries
├── routes/                    # Express route definitions
├── middlewares/               # Custom middleware functions
├── config/                    # Configuration files
│   ├── dbConfig.js           # Database connection
│   ├── minio.js              # MinIO configuration
│   └── Passport.js           # Authentication setup
├── utils/                     # Utility functions
├── migrations/                # Database migration files
├── db-init/                   # Database initialization scripts
├── docker/                    # Docker configuration files
│   ├── docker-compose.yml    # Development Docker setup
│   ├── docker-compose.npm.yml # Production with NPM
│   └── Dockerfile            # Backend container image
├── tests/                     # Test files
└── deploy-npm.sh             # Production deployment script
```

## 🔧 Configuration

### Database Schema
The application uses PostgreSQL with the following main tables:
- `User` - User authentication and profiles
- `Course` - Course information
- `CourseParticipation` - User-course relationships
- `Assignment` - Assignment details
- `Submission` - Student submissions
- `Material` - Course materials
- `Announcement` - Course announcements
- `Comment` - Comments on various resources
- `Grade` - Assignment grades and feedback

### API Endpoints

#### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

#### Courses
- `GET /api/courses` - List user's courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/join` - Join course by code

#### Assignments
- `GET /api/assignments/:courseId` - List course assignments
- `POST /api/assignments/:courseId` - Create assignment
- `GET /api/assignments/single/:id` - Get assignment details

#### Submissions
- `POST /api/submissions` - Submit assignment
- `GET /api/submissions/assignment/:id` - Get submissions

#### Materials
- `GET /api/material/:courseId` - List course materials
- `POST /api/material/:courseId` - Upload material

#### Other Endpoints
- `GET /api/announcements/:courseId` - Course announcements
- `GET /api/comments/:type/:parentId` - Get comments
- `POST /api/grades` - Submit grades

### Environment Variables

#### Backend Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | 
| `DB_USER` | Database username | 
| `DB_PASSWORD` | Database password | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `MINIO_ENDPOINT` | MinIO server endpoint |
| `MINIO_ROOT_USER` | MinIO access key | 
| `MINIO_ROOT_PASSWORD` | MinIO secret key |  

#### Frontend Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | API base URL | `""` |
| `VITE_API_URL` | API endpoint path | `/api` |


## 🔒 Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Protected routes and middleware

### Authorization
- Role-based access control (RBAC)
- Attribute-based access control (ABAC) with CASL
- Resource-level permissions
- Course-specific role management

### File Security
- Presigned URLs for secure file access
- Upload token verification
- File access restrictions based on user roles

### Data Protection
- SQL injection prevention with parameterized queries
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 🧪 Testing

The project includes comprehensive testing setup with unit tests for models and controllers, integration tests for API endpoints, and frontend component tests.

## 📚 API Documentation

### Authentication Flow
1. User registers/logs in via `/api/users/register` or `/api/users/login`
2. Server returns JWT token
3. Client includes token in Authorization header: `Bearer <token>`
4. Server validates token on protected routes

### File Upload Flow
1. Client requests presigned URL from appropriate endpoint
2. Server generates secure upload token and MinIO presigned URL
3. Client uploads file directly to MinIO using presigned URL
4. Client submits form data with file reference to API
5. Server verifies upload token and creates database record

### Permission System
- **Teachers**: Full course management, can create/edit/delete all resources
- **TAs**: Can grade assignments, manage materials, moderate discussions
- **Students**: Can view materials, submit assignments, participate in discussions


## 🐳 Docker Configuration

### Available Compose Files
- `docker/docker-compose.yml` - Development setup with exposed ports
- `docker/docker-compose.npm.yml` - Production setup with Nginx Proxy Manager

### Services Included
- **Frontend**: React application served via Nginx
- **Backend API**: Node.js/Express server
- **PostgreSQL**: Primary database with initialization scripts
- **MinIO**: S3-compatible file storage with console
- **Nginx Proxy Manager**: SSL termination and reverse proxy (production only)

**Built with ❤️ for educational institutions**