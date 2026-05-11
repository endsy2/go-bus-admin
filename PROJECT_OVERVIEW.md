# Bus Booking Application - Project Overview

A comprehensive, enterprise-grade bus ticket booking and management system built with modern microservices architecture.

---

## 📋 Table of Contents

1. [Project Summary](#project-summary)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Application Modules](#application-modules)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Core Functionalities](#core-functionalities)
8. [Real-Time Features](#real-time-features)
9. [API Documentation](#api-documentation)
10. [Database Schema](#database-schema)
11. [Security Features](#security-features)
12. [Deployment Architecture](#deployment-architecture)
13. [Development Workflow](#development-workflow)
14. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Summary

### Overview
The Bus Booking Application is a full-stack, production-ready platform designed to streamline bus ticket booking operations. It provides a comprehensive admin panel for managing buses, routes, schedules, bookings, customers, and financial operations, along with real-time seat selection capabilities.

### Business Goals
- **Digitalize** bus ticket booking operations
- **Automate** schedule and fleet management
- **Provide real-time** seat availability and booking
- **Enable data-driven** business decisions through analytics
- **Improve customer experience** with instant booking confirmation
- **Streamline financial** operations with integrated wallet system

### Target Users
- **Bus Operators**: Manage fleet, routes, and schedules
- **Administrators**: Oversee bookings, customers, and financial operations
- **Support Staff**: Handle customer inquiries and booking modifications
- **Customers**: Book tickets and manage their accounts (future customer portal)

---

## ✨ Key Features

### 🎫 Booking Management
- Real-time seat selection with WebSocket technology
- Multi-seat booking support
- Seat reservation with 5-minute timeout
- Booking status tracking (Confirmed, Pending, Cancelled, Completed)
- Payment status management (Paid, Pending, Failed, Refunded)
- Force payment marking for admin
- Booking history and analytics

### 🚌 Fleet Management
- Bus registration and management
- Bus type classification (Seater, Sleeper)
- Seat layout configuration with visual builder
- Bus-route assignment
- Fleet status tracking
- Bus detail pages with complete information

### 🗺️ Route Management
- Route creation with origin and destination
- Distance and duration tracking
- Base fare configuration
- Route activation/deactivation
- Route analytics and performance metrics

### 📅 Schedule Management
- Schedule creation with date/time selection
- Dynamic pricing support
- Seat availability tracking
- Schedule status management
- Bulk schedule operations
- Schedule conflict detection

### 👥 Customer Management
- Customer registration and profile management
- Customer status tracking (Active/Inactive)
- Soft delete functionality
- Customer booking history
- Wallet integration
- Customer analytics

### 💰 Wallet System
- Digital wallet for each customer
- Multiple transaction types (Deposit, Withdrawal, Payment, Refund, Credit, Debit)
- Transaction history with filtering
- Wallet status management (Active, Inactive, Suspended, Closed)
- Multi-currency support
- Balance tracking and reporting

### 🎟️ Promo Code System
- Discount code creation and management
- Percentage and fixed amount discounts
- Usage limit tracking
- Validity period configuration
- Promo code analytics
- Status management (Active, Inactive, Expired)

### 📊 Dashboard & Analytics
- Real-time statistics (Total Bookings, Revenue, Customers, Pending Refunds)
- Booking velocity trends (Seater vs Sleeper)
- Revenue stream analysis by payment method
- Date range filtering (30 days, 1-12 months)
- Visual charts with Recharts
- Growth indicators and percentage changes

### 📈 Financial Reports
- Revenue reports with period breakdown (Daily, Weekly, Monthly)
- Refund and cancellation reports
- Excel export functionality
- Date range filtering
- Payment method analysis
- Transaction summaries

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based feature access
- Secure password management
- Session management
- OAuth2 integration (Google Sign-In)

### 🖼️ Profile Management
- Profile image upload with MinIO
- Image deletion and update
- Presigned URL generation
- Profile information management
- Secure file storage

### 🌐 Real-Time Features
- WebSocket-based seat selection
- Live seat availability updates
- Real-time booking notifications
- Seat reservation timeout
- Multi-user seat conflict prevention
- Connection status indicators

---

## 🛠️ Technology Stack

### Frontend
```yaml
Framework: React 18
Language: JavaScript (ES6+)
UI Library: Tailwind CSS + shadcn/ui
State Management: React Hooks (useState, useEffect, useCallback)
Routing: React Router v6
HTTP Client: Axios
WebSocket: SockJS + STOMP
Charts: Recharts
Icons: Lucide React
Date Handling: date-fns
Build Tool: Create React App
```

### Backend
```yaml
Framework: Spring Boot 3.x
Language: Java 17
Architecture: Microservices
API Gateway: Spring Cloud Gateway
Database: PostgreSQL
ORM: Spring Data JPA / Hibernate
Authentication: Spring Security + JWT
WebSocket: Spring WebSocket + STOMP
Object Storage: MinIO
Message Queue: RabbitMQ (optional)
API Documentation: Swagger/OpenAPI
Build Tool: Maven
```

### DevOps & Infrastructure
```yaml
Cloud Platform: Oracle Cloud Infrastructure (OCI)
Web Server: Nginx
Reverse Proxy: Nginx
SSL/TLS: Let's Encrypt
Monitoring: OCI Monitoring + Alarms
Logging: Filebeat + ELK Stack (optional)
CI/CD: GitHub Actions (optional)
Containerization: Docker (optional)
```

### Development Tools
```yaml
Version Control: Git
Code Editor: VS Code / IntelliJ IDEA
API Testing: Postman / Insomnia
Database Client: pgAdmin / DBeaver
Design: Figma (optional)
```

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           React Admin Panel (Port 3000)                   │   │
│  │  - Dashboard  - Bookings  - Buses  - Routes              │   │
│  │  - Schedules  - Customers - Wallets - Reports            │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/WSS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        Spring Cloud Gateway (Port 8080)                   │   │
│  │  - Routing  - Load Balancing  - Authentication           │   │
│  │  - Rate Limiting  - CORS  - WebSocket Proxy              │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  User Service   │ │ Booking Service │ │  Bus Service    │
│   (Port 8081)   │ │   (Port 8082)   │ │   (Port 8083)   │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ - Users         │ │ - Bookings      │ │ - Buses         │
│ - Auth          │ │ - Payments      │ │ - Routes        │
│ - Profiles      │ │ - Seats         │ │ - Schedules     │
│ - Wallets       │ │ - Promo Codes   │ │ - Layouts       │
│ - Transactions  │ │ - WebSocket     │ │ - Analytics     │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │    MinIO     │  │   Redis      │          │
│  │  Databases   │  │Object Storage│  │    Cache     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

**1. User Service (Port 8081)**
- User authentication and authorization
- Profile management with image upload
- Wallet management
- Transaction processing
- Role and permission management

**2. Booking Service (Port 8082)**
- Booking creation and management
- Seat selection with WebSocket
- Payment processing
- Promo code validation
- Booking analytics and reports

**3. Bus Service (Port 8083)**
- Bus fleet management
- Route management
- Schedule management
- Seat layout configuration
- Bus analytics

**4. API Gateway (Port 8080)**
- Single entry point for all services
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- WebSocket proxy for real-time features

---

## 📦 Application Modules

### Frontend Structure

```
src/
├── features/                    # Feature-based modules
│   ├── auth/                   # Authentication
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── dashboard/              # Dashboard & Analytics
│   ├── bookings/               # Booking Management
│   ├── buses/                  # Bus Management
│   ├── routes/                 # Route Management
│   ├── schedules/              # Schedule Management
│   ├── customers/              # Customer Management
│   ├── wallets/                # Wallet Management
│   ├── promos/                 # Promo Code Management
│   ├── layouts/                # Seat Layout Builder
│   ├── reports/                # Financial Reports
│   ├── profile/                # User Profile
│   └── team/                   # Team Management
│
├── shared/                     # Shared resources
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── common/            # Reusable components
│   │   ├── layout/            # Layout components
│   │   └── feedback/          # Dialogs, toasts, etc.
│   ├── hooks/                 # Custom hooks
│   ├── context/               # React Context
│   ├── services/              # Shared services
│   ├── utils/                 # Utility functions
│   ├── constants/             # Constants
│   └── locales/               # Internationalization
│
├── services/                   # Core services
│   └── axiosConfig.js         # HTTP client configuration
│
└── App.jsx                     # Root component
```

### Backend Structure (per service)

```
src/main/java/com/busapp/
├── controller/                 # REST Controllers
│   ├── AdminController.java
│   ├── UserController.java
│   └── PublicController.java
│
├── service/                    # Business Logic
│   ├── impl/
│   └── interfaces/
│
├── repository/                 # Data Access Layer
│   └── JpaRepository implementations
│
├── model/                      # Domain Models
│   ├── entity/                # JPA Entities
│   └── enums/                 # Enumerations
│
├── dto/                        # Data Transfer Objects
│   ├── request/
│   └── response/
│
├── config/                     # Configuration
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   └── CorsConfig.java
│
├── security/                   # Security Components
│   ├── JwtTokenProvider.java
│   └── JwtAuthenticationFilter.java
│
├── exception/                  # Exception Handling
│   ├── GlobalExceptionHandler.java
│   └── CustomExceptions.java
│
└── util/                       # Utility Classes
```

---

## 👤 User Roles & Permissions

### Role Hierarchy

```
SUPER_ADMIN
    ├── Full system access
    ├── User management
    ├── Role assignment
    └── System configuration

ADMIN
    ├── Booking management
    ├── Customer management
    ├── Fleet management
    ├── Financial operations
    └── Report generation

MANAGER
    ├── View bookings
    ├── View customers
    ├── View reports
    └── Limited modifications

OPERATOR
    ├── Create bookings
    ├── View schedules
    └── Basic operations

CUSTOMER (Future)
    ├── Book tickets
    ├── View bookings
    ├── Manage profile
    └── Wallet operations
```

### Permission Matrix

| Feature | Super Admin | Admin | Manager | Operator |
|---------|-------------|-------|---------|----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Booking | ✅ | ✅ | ✅ | ✅ |
| View Bookings | ✅ | ✅ | ✅ | ✅ |
| Cancel Booking | ✅ | ✅ | ❌ | ❌ |
| Force Payment | ✅ | ✅ | ❌ | ❌ |
| Manage Buses | ✅ | ✅ | ❌ | ❌ |
| Manage Routes | ✅ | ✅ | ❌ | ❌ |
| Manage Schedules | ✅ | ✅ | ✅ | ❌ |
| Manage Customers | ✅ | ✅ | ✅ | ❌ |
| Manage Wallets | ✅ | ✅ | ❌ | ❌ |
| Manage Promos | ✅ | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |

---

## 🎯 Core Functionalities

### 1. Booking Flow

```
User selects route & date
    ↓
View available schedules
    ↓
Select schedule
    ↓
Open seat selection dialog
    ↓
WebSocket connects
    ↓
View real-time seat availability
    ↓
Select seats (max 5 minutes)
    ↓
Enter passenger details
    ↓
Apply promo code (optional)
    ↓
Select payment method
    ↓
Confirm booking
    ↓
Payment processing
    ↓
Booking confirmation
    ↓
Seat status updated (WebSocket)
```

### 2. Seat Selection Process

```
1. User opens seat selection dialog
2. WebSocket connection established
3. Subscribe to schedule topic: /topic/schedule/{scheduleId}
4. Receive current seat states
5. User clicks seat
6. Send selection: /app/seat/select
7. Backend validates and updates
8. Broadcast to all connected users
9. UI updates in real-time
10. 5-minute timer starts
11. On timeout: seat released automatically
12. On booking: seat marked as BOOKED
```

### 3. Payment Processing

```
Booking created with PENDING payment
    ↓
Payment gateway integration (future)
    ↓
Payment success → Status: PAID
    ↓
Payment failed → Status: FAILED
    ↓
Admin force payment → Status: PAID
    ↓
Refund request → Status: REFUNDED
```

### 4. Wallet Operations

```
Customer registration
    ↓
Wallet created automatically
    ↓
Deposit funds (DEPOSIT transaction)
    ↓
Book ticket (PAYMENT transaction)
    ↓
Booking cancelled (REFUND transaction)
    ↓
Admin credit (CREDIT transaction)
    ↓
Withdrawal request (WITHDRAWAL transaction)
```

---

## ⚡ Real-Time Features

### WebSocket Implementation

**Technology**: SockJS + STOMP over WebSocket

**Connection Flow**:
```javascript
// 1. Connect to WebSocket
const socket = new SockJS('http://localhost:8080/bus-service/ws/bus');
const stompClient = Stomp.over(socket);

// 2. Subscribe to schedule topic
stompClient.subscribe(`/topic/schedule/${scheduleId}`, (message) => {
  const seatUpdate = JSON.parse(message.body);
  updateSeatUI(seatUpdate);
});

// 3. Send seat selection
stompClient.send('/app/seat/select', {}, JSON.stringify({
  scheduleId: 123,
  seatNumber: 'A1',
  userId: 456
}));
```

**Event Types**:
- `SEAT_SELECTED` - Seat reserved by user
- `SEAT_DESELECTED` - Seat released by user
- `SEAT_BOOKED` - Booking confirmed
- `SEAT_RELEASED` - Booking cancelled/refunded
- `SEAT_SELECTION_EXPIRED` - 5-minute timeout

**Features**:
- Real-time seat availability
- Multi-user conflict prevention
- Automatic timeout handling
- Connection status monitoring
- Reconnection on disconnect
- LocalStorage persistence

---

## 📚 API Documentation

### Base URLs

```
API Gateway: http://localhost:8080
User Service: http://localhost:8081
Booking Service: http://localhost:8082
Bus Service: http://localhost:8083
```

### Key Endpoints

#### Authentication
```
POST   /api/auth/login              # User login
POST   /api/auth/register           # User registration
POST   /api/auth/refresh            # Refresh token
POST   /api/auth/logout             # User logout
POST   /api/auth/google             # Google OAuth
```

#### Bookings
```
GET    /api/admin/bookings          # List bookings (filtered)
GET    /api/bookings/{id}           # Get booking details
POST   /api/bookings                # Create booking
PATCH  /api/admin/bookings/{id}/force-pay  # Force mark as paid
DELETE /api/admin/bookings/{id}     # Cancel booking
```

#### Buses
```
GET    /api/admin/buses             # List buses
GET    /api/buses/{id}              # Get bus details
POST   /api/admin/buses             # Create bus
PUT    /api/admin/buses/{id}        # Update bus
DELETE /api/admin/buses/{id}        # Delete bus
```

#### Routes
```
GET    /api/routes                  # List routes
GET    /api/routes/{id}             # Get route details
POST   /api/admin/routes            # Create route
PUT    /api/admin/routes/{id}       # Update route
DELETE /api/admin/routes/{id}       # Delete route
```

#### Schedules
```
GET    /api/schedules               # List schedules
GET    /api/schedules/{id}          # Get schedule details
POST   /api/admin/schedules         # Create schedule
PUT    /api/admin/schedules/{id}    # Update schedule
DELETE /api/admin/schedules/{id}    # Delete schedule
GET    /api/schedules/{id}/seats    # Get seat availability
```

#### Customers
```
GET    /api/admin/users             # List customers
GET    /api/admin/users/{id}        # Get customer details
POST   /api/admin/users             # Create customer
PUT    /api/admin/users/{id}        # Update customer
PATCH  /api/admin/users/{id}/status # Activate/Deactivate
```

#### Wallets
```
GET    /api/wallets/user/specification  # List wallets
GET    /api/wallets/user/{userId}       # Get user wallet
POST   /api/wallets/user/{userId}       # Create wallet
GET    /api/admin/wallets/transactions  # List transactions
```

#### Promo Codes
```
GET    /api/admin/promo-codes       # List promo codes
POST   /api/admin/promo-codes       # Create promo code
PUT    /api/admin/promo-codes/{id}  # Update promo code
DELETE /api/admin/promo-codes/{id}  # Delete promo code
POST   /api/promo-codes/validate    # Validate promo code
```

#### Dashboard
```
GET    /api/admin/dashboard/stats           # Dashboard statistics
GET    /api/admin/dashboard/velocity        # Booking velocity
GET    /api/admin/dashboard/revenue-stream  # Revenue analysis
```

#### Reports
```
GET    /api/admin/financial-reports/revenue              # Revenue report (Excel)
GET    /api/admin/financial-reports/refunds-cancellations # Refund report (Excel)
```

#### Profile
```
GET    /api/profile                 # Get profile
PUT    /api/profile                 # Update profile
POST   /api/profile/image           # Upload profile image
DELETE /api/profile/image           # Delete profile image
GET    /api/profile/image/url       # Get image URL
```

---

## 🗄️ Database Schema

### Core Tables

**users**
```sql
id, username, email, password, full_name, phone, 
gender, image, google_id, active, created_at, updated_at
```

**roles**
```sql
id, name, description
```

**user_roles**
```sql
user_id, role_id
```

**wallets**
```sql
id (UUID), user_id, balance, currency, status, 
last_transaction, created_at, updated_at
```

**wallet_transactions**
```sql
id, wallet_id, type, amount, status, description, 
reference_id, created_at
```

**buses**
```sql
id, registration_number, bus_type, total_seats, 
route_id, layout_id, active, created_at, updated_at
```

**routes**
```sql
id, origin, destination, distance, duration, 
base_fare, active, created_at, updated_at
```

**schedules**
```sql
id, bus_id, route_id, departure_time, arrival_time, 
price, available_seats, status, created_at, updated_at
```

**bookings**
```sql
id, user_id, schedule_id, booking_status, payment_status, 
total_amount, promo_code_id, created_at, updated_at
```

**booking_seats**
```sql
id, booking_id, seat_number, passenger_name, 
passenger_age, passenger_gender
```

**seat_layouts**
```sql
id, name, rows, columns, total_seats, 
layout_config (JSON), created_at, updated_at
```

**promo_codes**
```sql
id, code, description, discount_type, discount_value, 
max_uses, used_count, valid_from, valid_to, status, 
created_at, updated_at
```

### Relationships

```
users 1:N bookings
users 1:1 wallets
wallets 1:N wallet_transactions
buses N:1 routes
buses N:1 seat_layouts
schedules N:1 buses
schedules N:1 routes
bookings N:1 schedules
bookings N:1 users
bookings N:1 promo_codes
bookings 1:N booking_seats
```

---

## 🔒 Security Features

### Authentication
- JWT-based token authentication
- Access token + Refresh token pattern
- Token expiration and renewal
- Secure password hashing (BCrypt)
- OAuth2 integration (Google)

### Authorization
- Role-based access control (RBAC)
- Permission-based feature access
- Route-level protection
- API endpoint security
- Resource-level authorization

### Data Security
- SQL injection prevention (JPA/Hibernate)
- XSS protection
- CSRF protection
- CORS configuration
- Input validation and sanitization
- Secure file upload (MinIO)

### Network Security
- HTTPS/TLS encryption
- Secure WebSocket (WSS)
- API rate limiting
- Request throttling
- IP whitelisting (optional)

### Best Practices
- Environment variable management
- Secrets encryption
- Audit logging
- Session management
- Password policies
- Account lockout mechanism

---

## 🚀 Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│              (Oracle Cloud Load Balancer)                │
│                  SSL/TLS Termination                     │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Frontend VM    │     │  Backend VM     │
│  (Nginx)        │     │  (Java Apps)    │
│  - React App    │     │  - User Service │
│  - Static Files │     │  - Book Service │
│                 │     │  - Bus Service  │
│                 │     │  - API Gateway  │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
           ┌─────────────────┐      ┌─────────────────┐
           │   PostgreSQL    │      │     MinIO       │
           │    Database     │      │ Object Storage  │
           └─────────────────┘      └─────────────────┘
```

### Scaling Strategy

**Horizontal Scaling**:
- Multiple frontend instances behind load balancer
- Multiple backend service instances
- Database read replicas
- Redis cache layer

**Vertical Scaling**:
- Increase VM resources (CPU, RAM)
- Optimize database queries
- Enable connection pooling
- Implement caching strategies

---

## 💻 Development Workflow

### Local Development Setup

**Prerequisites**:
```bash
# Install Node.js 18+
node -v

# Install Java 17+
java -version

# Install PostgreSQL
psql --version

# Install Maven
mvn -version
```

**Backend Setup**:
```bash
# Clone repositories
git clone <user-service-repo>
git clone <booking-service-repo>
git clone <bus-service-repo>
git clone <api-gateway-repo>

# Create databases
createdb user_service_db
createdb booking_service_db
createdb bus_service_db

# Configure application.yml for each service
# Update database credentials

# Build and run each service
cd user-service
mvn clean install
mvn spring-boot:run

# Repeat for other services
```

**Frontend Setup**:
```bash
# Clone frontend repository
git clone <frontend-repo>
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Update API URLs

# Start development server
npm start
```

### Git Workflow

```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name (development)
```

**Branch Strategy**:
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### Code Review Process

1. Create feature branch
2. Implement feature
3. Write tests
4. Create pull request
5. Code review
6. Address feedback
7. Merge to develop
8. Deploy to staging
9. QA testing
10. Merge to main
11. Deploy to production

---

## 🔮 Future Enhancements

### Phase 1 (Q1 2027)
- [ ] Customer mobile app (React Native)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Multi-language support
- [ ] Advanced search and filters

### Phase 2 (Q2 2027)
- [ ] Loyalty program
- [ ] Referral system
- [ ] Dynamic pricing algorithm
- [ ] Route optimization
- [ ] GPS tracking integration
- [ ] Mobile ticket QR codes

### Phase 3 (Q3 2027)
- [ ] AI-powered demand forecasting
- [ ] Chatbot support
- [ ] Social media integration
- [ ] Review and rating system
- [ ] Advanced analytics dashboard
- [ ] Business intelligence reports

### Phase 4 (Q4 2027)
- [ ] Multi-tenant architecture
- [ ] White-label solution
- [ ] API marketplace
- [ ] Third-party integrations
- [ ] Blockchain ticketing
- [ ] Carbon footprint tracking

---

## 📊 Project Metrics

### Current Status
- **Lines of Code**: ~50,000+
- **Components**: 100+
- **API Endpoints**: 80+
- **Database Tables**: 15+
- **Features**: 12 major modules
- **Test Coverage**: TBD

### Performance Targets
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms
- **WebSocket Latency**: < 100ms
- **Concurrent Users**: 1,000+
- **Uptime**: 99.9%

---

## 📞 Support & Contact

### Documentation
- [Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)
- [WebSocket Guide](./WEBSOCKET_README.md)
- [Deployment Guide](./ORACLE_CLOUD_DEPLOYMENT.md)
- [Migration Status](./MIGRATION_STATUS.md)

### Team
- **Project Lead**: [Name]
- **Backend Lead**: [Name]
- **Frontend Lead**: [Name]
- **DevOps Lead**: [Name]

### Resources
- GitHub Repository: [URL]
- Project Board: [URL]
- Documentation: [URL]
- API Docs: [URL]

---

## 📄 License

[Specify License - MIT, Apache 2.0, Proprietary, etc.]

---

## 🙏 Acknowledgments

- React Team for the amazing framework
- Spring Team for Spring Boot
- shadcn for the beautiful UI components
- Tailwind CSS for the utility-first CSS framework
- Oracle Cloud for infrastructure
- Open source community

---

**Last Updated**: May 6, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
