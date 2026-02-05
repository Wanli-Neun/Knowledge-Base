# Knowledge Base Management System

A comprehensive enterprise-grade knowledge management platform built with microservices architecture, enabling teams to collaborate, share documents, and manage projects efficiently.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Knowledge Base Management System is a modern, scalable platform designed for organizations to manage projects, documents, and team collaboration. The system provides role-based access control, real-time statistics, and secure document storage with AWS S3 integration.

### Key Capabilities

- **Project Management**: Create, organize, and manage multiple projects
- **Document Management**: Upload, store, and retrieve documents with version control
- **Team Collaboration**: Invite members, manage permissions, and collaborate in real-time
- **Analytics Dashboard**: Real-time statistics and insights for admins and users
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Cloud Storage**: AWS S3 integration for reliable document storage

## 🏗 Architecture

The system follows a microservices architecture pattern:

```
┌─────────────┐
│   Web App   │ (Next.js 15 - Port 3000)
│  (Frontend) │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
│Auth Service │ │  Project │ │  PostgreSQL │
│ (Port 8080) │ │  Service │ │  Database   │
└─────────────┘ │(Port 8081)│ └─────────────┘
                └────┬──────┘
                     │
                ┌────▼────┐
                │  AWS S3 │
                └─────────┘
```

### Services

1. **Auth Service**: Handles user authentication, authorization, and profile management
2. **Project Service**: Manages projects, documents, members, and permissions
3. **Web Application**: React-based frontend with Next.js for SSR and routing

## 🛠 Tech Stack

### Backend

- **Framework**: Spring Boot 3.4.2
- **Language**: Java 17
- **Database**: PostgreSQL 16
- **ORM**: Hibernate/JPA
- **Security**: Spring Security with JWT
- **Cloud Storage**: AWS S3
- **Build Tool**: Maven

### Frontend

- **Framework**: Next.js 15.1.6
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Styling**: SCSS Modules
- **Charts**: Recharts
- **HTTP Client**: Fetch API

### Infrastructure

- **Database**: PostgreSQL
- **Object Storage**: AWS S3
- **Deployment**: Docker (recommended)

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)** 17 or higher
- **Node.js** 18.x or higher
- **PostgreSQL** 16 or higher
- **Maven** 3.8 or higher
- **AWS Account** (for S3 storage)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Knowledge-Base
```

### 2. Database Setup

```sql
-- Create database
CREATE DATABASE knowledge_base;

-- Create user (optional)
CREATE USER kb_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE knowledge_base TO kb_user;
```

### 3. Configure Environment Variables

#### Auth Service

Create `auth-service/src/main/resources/application.properties`:

```properties
spring.application.name=auth-service

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/knowledge_base
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server Configuration
server.port=8080

# JWT Configuration
jwt.secret=your-secret-key-here-min-256-bits-long-for-hs256-algorithm-security
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

#### Project Service

Create `project-service/src/main/resources/application.properties`:

```properties
spring.application.name=project-service

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/knowledge_base
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server Configuration
server.port=8081

# JWT Configuration
jwt.secret=your-secret-key-here-min-256-bits-long-for-hs256-algorithm-security

# Auth Service
clients.auth-service.url=http://localhost:8080

# AWS S3 Configuration
aws.region=ap-southeast-1
aws.s3.bucket=your-bucket-name
aws.s3.prefix=projects
```

#### Web Application

Create `web/.env.local`:

```env
AUTH_SERVICE_URL=http://localhost:8080
PROJECT_SERVICE_URL=http://localhost:8081
```

### 4. Start Services

#### Start Auth Service

```bash
cd auth-service
mvnw spring-boot:run
```

#### Start Project Service

```bash
cd project-service
mvnw spring-boot:run
```

#### Start Web Application

```bash
cd web
npm install
npm run dev
```

### 5. Access the Application

Open your browser and navigate to: `http://localhost:3000`

**Default Admin Credentials** (create manually in database):

- Email: admin@example.com
- Password: (hashed password)
- Role: ADMIN

## 📁 Project Structure

```
Knowledge-Base/
├── auth-service/              # Authentication & User Management Service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kb/auth/
│   │   │   │   ├── config/        # Security, CORS, JWT configs
│   │   │   │   ├── controller/    # REST API endpoints
│   │   │   │   ├── dto/           # Data Transfer Objects
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── enums/         # Role, Status enums
│   │   │   │   ├── repository/    # Database repositories
│   │   │   │   ├── security/      # JWT, authentication
│   │   │   │   └── service/       # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── project-service/           # Project & Document Management Service
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kb/project/
│   │   │   │   ├── common/        # Shared utilities, responses
│   │   │   │   ├── config/        # Security, AWS, CORS configs
│   │   │   │   ├── controller/    # REST API endpoints
│   │   │   │   ├── dto/           # Request/Response DTOs
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── mapper/        # Entity-DTO mappers
│   │   │   │   ├── repository/    # Database repositories
│   │   │   │   ├── security/      # JWT validation
│   │   │   │   ├── service/       # Business logic
│   │   │   │   └── storage/       # AWS S3 integration
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── web/                       # Next.js Frontend Application
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (main)/           # Main application pages
│   │   │   ├── dashboard/    # Dashboard (Admin & User)
│   │   │   ├── profile/      # User profile
│   │   │   └── projects/     # Projects & Documents
│   │   ├── api/              # API routes (BFF pattern)
│   │   │   ├── admin/        # Admin endpoints
│   │   │   ├── auth/         # Auth endpoints
│   │   │   ├── projects/     # Project endpoints
│   │   │   └── user/         # User endpoints
│   │   └── components/       # Shared components
│   ├── lib/                  # Utilities, helpers
│   ├── public/               # Static assets
│   ├── .env.local           # Environment variables
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                  # This file
```

## ⚙️ Configuration

### Environment Variables

#### Auth Service

| Variable                     | Description                       | Default   |
| ---------------------------- | --------------------------------- | --------- |
| `spring.datasource.url`      | PostgreSQL connection URL         | -         |
| `spring.datasource.username` | Database username                 | -         |
| `spring.datasource.password` | Database password                 | -         |
| `server.port`                | Service port                      | 8080      |
| `jwt.secret`                 | JWT signing secret (min 256 bits) | -         |
| `jwt.expiration`             | Access token expiration (ms)      | 86400000  |
| `jwt.refresh-expiration`     | Refresh token expiration (ms)     | 604800000 |

#### Project Service

| Variable                     | Description                               | Default               |
| ---------------------------- | ----------------------------------------- | --------------------- |
| `spring.datasource.url`      | PostgreSQL connection URL                 | -                     |
| `spring.datasource.username` | Database username                         | -                     |
| `spring.datasource.password` | Database password                         | -                     |
| `server.port`                | Service port                              | 8081                  |
| `jwt.secret`                 | JWT signing secret (same as auth-service) | -                     |
| `clients.auth-service.url`   | Auth service URL                          | http://localhost:8080 |
| `aws.region`                 | AWS region                                | ap-southeast-1        |
| `aws.s3.bucket`              | S3 bucket name                            | -                     |
| `aws.s3.prefix`              | S3 object prefix                          | projects              |

#### Web Application

| Variable              | Description         | Default               |
| --------------------- | ------------------- | --------------------- |
| `AUTH_SERVICE_URL`    | Auth service URL    | http://localhost:8080 |
| `PROJECT_SERVICE_URL` | Project service URL | http://localhost:8081 |

### AWS S3 Configuration

Ensure your AWS credentials are configured:

```bash
# Via AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=ap-southeast-1
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /auth/signup

Register a new user

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "displayName": "John"
}
```

#### POST /auth/login

Login user

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "userId": "uuid"
}
```

### Project Endpoints

#### GET /projects

Get user's projects (with search & pagination)

**Query Parameters:**

- `search` (optional): Search by project name
- `page`: Page number (0-based)
- `size`: Items per page

#### POST /projects

Create new project

**Request:**

```json
{
  "projectName": "My Project",
  "description": "Project description"
}
```

#### GET /projects/{projectId}

Get project details

#### PATCH /projects/{projectId}

Update project

#### PATCH /projects/{projectId}/deactivate

Deactivate project (soft delete)

### Document Endpoints

#### POST /projects/{projectId}/documents

Upload document

**Request:** multipart/form-data

- `file`: Document file (max 50MB)

#### GET /projects/{projectId}/documents

Get project documents (with pagination)

#### GET /projects/{projectId}/documents/{documentId}

Get document details

#### GET /projects/{projectId}/documents/{documentId}/download

Download document

#### PATCH /projects/{projectId}/documents/{documentId}/deactivate

Deactivate document (soft delete)

### Member Endpoints

#### POST /projects/{projectId}/members

Add member to project

**Request:**

```json
{
  "email": "member@example.com"
}
```

#### GET /projects/{projectId}/members

Get project members

#### PATCH /projects/{projectId}/members/{memberId}/deactivate

Remove member from project

### Dashboard Endpoints

#### GET /admin/stats

Get system statistics (Admin only)

**Response:**

```json
{
  "users": { "total": 100, "active": 95, "inactive": 5 },
  "projects": { "total": 50, "active": 48, "inactive": 2 },
  "documents": { "total": 500, "active": 490, "inactive": 10 }
}
```

#### GET /admin/stats/timeseries

Get time-series data for charts (Admin only)

#### GET /projects/stats

Get user statistics

#### GET /projects/recent-documents

Get user's recent documents (top 10)

## 🎨 Features

### User Features

- ✅ User registration and authentication
- ✅ Profile management
- ✅ Create and manage projects
- ✅ Upload and download documents
- ✅ Invite team members
- ✅ Personal dashboard with statistics
- ✅ Recent documents view
- ✅ Search projects and documents

### Admin Features

- ✅ System-wide statistics dashboard
- ✅ User management
- ✅ Time-series analytics with charts
- ✅ Date range filtering
- ✅ View all projects and documents
- ✅ User activity tracking

### Technical Features

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Soft delete pattern
- ✅ RESTful API design
- ✅ Microservices architecture
- ✅ AWS S3 integration
- ✅ Responsive UI design
- ✅ Real-time data updates
- ✅ Pagination support
- ✅ Search functionality

## 💻 Development

### Code Style

#### Backend (Java)

- Follow Java naming conventions
- Use Lombok for boilerplate reduction
- Document public methods with Javadoc
- Use constructor injection for dependencies

#### Frontend (TypeScript)

- Use TypeScript for type safety
- Follow React functional components pattern
- Use SCSS modules for styling
- Implement error boundaries

### Building for Production

#### Backend Services

```bash
# Build JAR files
cd auth-service
mvn clean package

cd ../project-service
mvn clean package
```

#### Frontend

```bash
cd web
npm run build
npm start
```

### Running Tests

#### Backend

```bash
mvn test
```

#### Frontend

```bash
npm test
```

## 🚢 Deployment

### Docker Deployment (Recommended)

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: knowledge_base
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  auth-service:
    build: ./auth-service
    ports:
      - "8080:8080"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: knowledge_base
      DB_USER: postgres
      DB_PASSWORD: password
      JWT_SECRET: your-secret-key
    depends_on:
      - postgres

  project-service:
    build: ./project-service
    ports:
      - "8081:8081"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: knowledge_base
      DB_USER: postgres
      DB_PASSWORD: password
      JWT_SECRET: your-secret-key
      AWS_REGION: ap-southeast-1
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - postgres
      - auth-service

  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      AUTH_SERVICE_URL: http://auth-service:8080
      PROJECT_SERVICE_URL: http://project-service:8081
    depends_on:
      - auth-service
      - project-service

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team**: [Your Team Name]
- **Project Lead**: [Name]
- **Contact**: [email@example.com]

## 🔗 Related Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

## 📞 Support

For support and questions:

- Create an issue in the repository
- Email: support@example.com
- Slack: [Your Slack Channel]

---

**Built with ❤️ by [Your Organization]**
