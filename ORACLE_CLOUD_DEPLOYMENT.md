# Oracle Cloud Deployment Guide

Complete guide for deploying the Bus Booking Application on Oracle Cloud Infrastructure (OCI).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step 1: Setup Oracle Cloud Account](#step-1-setup-oracle-cloud-account)
4. [Step 2: Create Compute Instances](#step-2-create-compute-instances)
5. [Step 3: Setup Database](#step-3-setup-database)
6. [Step 4: Configure Network & Security](#step-4-configure-network--security)
7. [Step 5: Deploy Backend Services](#step-5-deploy-backend-services)
8. [Step 6: Deploy Frontend Application](#step-6-deploy-frontend-application)
9. [Step 7: Setup Load Balancer](#step-7-setup-load-balancer)
10. [Step 8: Configure Domain & SSL](#step-8-configure-domain--ssl)
11. [Step 9: Setup Monitoring](#step-9-setup-monitoring)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Oracle Cloud account (Free Tier or Paid)
- SSH key pair for instance access
- Domain name (optional, for production)
- Git installed locally
- Basic knowledge of Linux commands

### Application Components
- **Frontend**: React application (Node.js)
- **Backend Services**: 
  - User Service (Spring Boot)
  - Booking Service (Spring Boot)
  - Bus Service (Spring Boot)
  - API Gateway (Spring Cloud Gateway)
- **Database**: PostgreSQL or MySQL
- **Object Storage**: MinIO (for profile images)
- **Message Queue**: RabbitMQ or Kafka (optional)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Oracle Cloud Infrastructure               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Load Balancer│────────▶│   Frontend   │                 │
│  │   (Public)   │         │  (React App) │                 │
│  └──────┬───────┘         └──────────────┘                 │
│         │                                                    │
│         │                 ┌──────────────┐                 │
│         └────────────────▶│ API Gateway  │                 │
│                           │  (Port 8080) │                 │
│                           └──────┬───────┘                 │
│                                  │                          │
│         ┌────────────────────────┼────────────────┐        │
│         │                        │                │        │
│         ▼                        ▼                ▼        │
│  ┌─────────────┐        ┌─────────────┐  ┌─────────────┐ │
│  │User Service │        │Book Service │  │ Bus Service │ │
│  │ (Port 8081) │        │ (Port 8082) │  │ (Port 8083) │ │
│  └──────┬──────┘        └──────┬──────┘  └──────┬──────┘ │
│         │                      │                │        │
│         └──────────────────────┼────────────────┘        │
│                                │                          │
│                         ┌──────▼──────┐                   │
│                         │  Database   │                   │
│                         │ (PostgreSQL)│                   │
│                         └─────────────┘                   │
│                                                              │
│                         ┌──────────────┐                   │
│                         │    MinIO     │                   │
│                         │(Object Store)│                   │
│                         └──────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Setup Oracle Cloud Account

### 1.1 Create OCI Account
1. Go to [Oracle Cloud](https://www.oracle.com/cloud/free/)
2. Sign up for Free Tier (includes Always Free resources)
3. Complete verification process
4. Access OCI Console

### 1.2 Create Compartment
```bash
# Navigate to: Identity & Security > Compartments
# Click "Create Compartment"
Name: bus-booking-app
Description: Bus booking application resources
Parent Compartment: (root)
```

---

## Step 2: Create Compute Instances

### 2.1 Create Backend Instance

**Instance Configuration:**
```yaml
Name: bus-backend-server
Image: Oracle Linux 8 or Ubuntu 22.04
Shape: VM.Standard.E2.1.Micro (Always Free) or VM.Standard2.1
OCPU: 1-2
Memory: 1-8 GB
Boot Volume: 50 GB
```

**Steps:**
1. Navigate to **Compute > Instances**
2. Click **Create Instance**
3. Configure:
   - Name: `bus-backend-server`
   - Compartment: `bus-booking-app`
   - Availability Domain: Select any
   - Image: Oracle Linux 8
   - Shape: VM.Standard.E2.1.Micro
4. **Networking:**
   - VCN: Create new or select existing
   - Subnet: Public subnet
   - Assign public IP: Yes
5. **Add SSH Keys:**
   - Upload your public SSH key
6. Click **Create**

### 2.2 Create Frontend Instance

**Instance Configuration:**
```yaml
Name: bus-frontend-server
Image: Oracle Linux 8 or Ubuntu 22.04
Shape: VM.Standard.E2.1.Micro (Always Free)
OCPU: 1
Memory: 1 GB
Boot Volume: 50 GB
```

Follow same steps as backend instance.

### 2.3 Create Database Instance (Optional)

**Option A: Use Autonomous Database (Managed)**
```yaml
Name: bus-booking-db
Workload Type: Transaction Processing
Deployment Type: Shared Infrastructure
Database Version: 19c or 21c
OCPU: 1
Storage: 20 GB
```

**Option B: Install on Compute Instance**
- Use the backend instance for database
- Install PostgreSQL or MySQL manually

---

## Step 3: Setup Database

### 3.1 Install PostgreSQL on Compute Instance

**Connect to instance:**
```bash
ssh -i ~/.ssh/your-key.pem opc@<instance-public-ip>
```

**Install PostgreSQL:**
```bash
# Oracle Linux 8
sudo dnf install -y postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
sudo vi /var/lib/pgsql/data/postgresql.conf
# Change: listen_addresses = '*'

sudo vi /var/lib/pgsql/data/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

**Create databases:**
```bash
sudo -u postgres psql

CREATE DATABASE user_service_db;
CREATE DATABASE booking_service_db;
CREATE DATABASE bus_service_db;

CREATE USER busapp WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE user_service_db TO busapp;
GRANT ALL PRIVILEGES ON DATABASE booking_service_db TO busapp;
GRANT ALL PRIVILEGES ON DATABASE bus_service_db TO busapp;

\q
```

### 3.2 Configure Firewall for Database

```bash
# Open PostgreSQL port
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

---

## Step 4: Configure Network & Security

### 4.1 Create Security Lists

**Navigate to:** Networking > Virtual Cloud Networks > Your VCN > Security Lists

**Ingress Rules:**
```yaml
# HTTP
Source: 0.0.0.0/0
Protocol: TCP
Port: 80

# HTTPS
Source: 0.0.0.0/0
Protocol: TCP
Port: 443

# SSH
Source: Your-IP/32
Protocol: TCP
Port: 22

# API Gateway
Source: 0.0.0.0/0
Protocol: TCP
Port: 8080

# Backend Services (Internal only)
Source: VCN CIDR
Protocol: TCP
Ports: 8081, 8082, 8083

# Database (Internal only)
Source: VCN CIDR
Protocol: TCP
Port: 5432

# MinIO
Source: VCN CIDR
Protocol: TCP
Port: 9000
```

**Egress Rules:**
```yaml
# Allow all outbound
Destination: 0.0.0.0/0
Protocol: All
```

### 4.2 Configure Instance Firewall

**On each instance:**
```bash
# Allow HTTP/HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Allow API Gateway
sudo firewall-cmd --permanent --add-port=8080/tcp

# Allow backend services (on backend instance)
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=8082/tcp
sudo firewall-cmd --permanent --add-port=8083/tcp

# Reload firewall
sudo firewall-cmd --reload
```

---

## Step 5: Deploy Backend Services

### 5.1 Install Java on Backend Instance

```bash
# Connect to backend instance
ssh -i ~/.ssh/your-key.pem opc@<backend-instance-ip>

# Install Java 17
sudo dnf install -y java-17-openjdk java-17-openjdk-devel

# Verify installation
java -version
```

### 5.2 Install Maven (for building)

```bash
sudo dnf install -y maven

# Verify
mvn -version
```

### 5.3 Clone and Build Backend Services

```bash
# Create application directory
sudo mkdir -p /opt/bus-booking
sudo chown opc:opc /opt/bus-booking
cd /opt/bus-booking

# Clone repositories (replace with your repo URLs)
git clone https://github.com/your-org/user-service.git
git clone https://github.com/your-org/booking-service.git
git clone https://github.com/your-org/bus-service.git
git clone https://github.com/your-org/api-gateway.git

# Build each service
cd user-service
mvn clean package -DskipTests
cd ..

cd booking-service
mvn clean package -DskipTests
cd ..

cd bus-service
mvn clean package -DskipTests
cd ..

cd api-gateway
mvn clean package -DskipTests
cd ..
```

### 5.4 Configure Application Properties

**User Service (`user-service/src/main/resources/application.yml`):**
```yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/user_service_db
    username: busapp
    password: your-secure-password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
  bucket-name: profile-images
```

**Booking Service (`booking-service/src/main/resources/application.yml`):**
```yaml
server:
  port: 8082

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/booking_service_db
    username: busapp
    password: your-secure-password
  jpa:
    hibernate:
      ddl-auto: update
```

**Bus Service (`bus-service/src/main/resources/application.yml`):**
```yaml
server:
  port: 8083

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bus_service_db
    username: busapp
    password: your-secure-password
  jpa:
    hibernate:
      ddl-auto: update
```

**API Gateway (`api-gateway/src/main/resources/application.yml`):**
```yaml
server:
  port: 8080

spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: http://localhost:8081
          predicates:
            - Path=/api/users/**, /api/profile/**, /api/wallets/**
        
        - id: booking-service
          uri: http://localhost:8082
          predicates:
            - Path=/api/bookings/**, /api/admin/bookings/**
        
        - id: bus-service
          uri: http://localhost:8083
          predicates:
            - Path=/api/buses/**, /api/routes/**, /api/schedules/**
```

### 5.5 Create Systemd Services

**User Service (`/etc/systemd/system/user-service.service`):**
```ini
[Unit]
Description=User Service
After=network.target postgresql.service

[Service]
Type=simple
User=opc
WorkingDirectory=/opt/bus-booking/user-service
ExecStart=/usr/bin/java -jar target/user-service-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Booking Service (`/etc/systemd/system/booking-service.service`):**
```ini
[Unit]
Description=Booking Service
After=network.target postgresql.service

[Service]
Type=simple
User=opc
WorkingDirectory=/opt/bus-booking/booking-service
ExecStart=/usr/bin/java -jar target/booking-service-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Bus Service (`/etc/systemd/system/bus-service.service`):**
```ini
[Unit]
Description=Bus Service
After=network.target postgresql.service

[Service]
Type=simple
User=opc
WorkingDirectory=/opt/bus-booking/bus-service
ExecStart=/usr/bin/java -jar target/bus-service-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**API Gateway (`/etc/systemd/system/api-gateway.service`):**
```ini
[Unit]
Description=API Gateway
After=network.target user-service.service booking-service.service bus-service.service

[Service]
Type=simple
User=opc
WorkingDirectory=/opt/bus-booking/api-gateway
ExecStart=/usr/bin/java -jar target/api-gateway-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 5.6 Start Services

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable user-service
sudo systemctl enable booking-service
sudo systemctl enable bus-service
sudo systemctl enable api-gateway

# Start services
sudo systemctl start user-service
sudo systemctl start booking-service
sudo systemctl start bus-service
sudo systemctl start api-gateway

# Check status
sudo systemctl status user-service
sudo systemctl status booking-service
sudo systemctl status bus-service
sudo systemctl status api-gateway

# View logs
sudo journalctl -u user-service -f
```

### 5.7 Install and Configure MinIO

```bash
# Download MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# Create data directory
sudo mkdir -p /opt/minio/data
sudo chown opc:opc /opt/minio/data

# Create systemd service
sudo vi /etc/systemd/system/minio.service
```

**MinIO Service:**
```ini
[Unit]
Description=MinIO
After=network.target

[Service]
Type=simple
User=opc
Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin"
ExecStart=/usr/local/bin/minio server /opt/minio/data --console-address ":9001"
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Start MinIO
sudo systemctl daemon-reload
sudo systemctl enable minio
sudo systemctl start minio
sudo systemctl status minio
```

---

## Step 6: Deploy Frontend Application

### 6.1 Install Node.js on Frontend Instance

```bash
# Connect to frontend instance
ssh -i ~/.ssh/your-key.pem opc@<frontend-instance-ip>

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node -v
npm -v
```

### 6.2 Install Nginx

```bash
sudo dnf install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6.3 Clone and Build Frontend

```bash
# Create application directory
sudo mkdir -p /var/www/bus-booking
sudo chown opc:opc /var/www/bus-booking
cd /var/www/bus-booking

# Clone frontend repository
git clone https://github.com/your-org/bus-booking-frontend.git .

# Install dependencies
npm install

# Create production environment file
vi .env.production
```

**`.env.production`:**
```env
REACT_APP_API_URL=http://<backend-instance-ip>:8080
REACT_APP_WS_URL=ws://<backend-instance-ip>:8080
```

**Build application:**
```bash
npm run build
```

### 6.4 Configure Nginx

```bash
sudo vi /etc/nginx/conf.d/bus-booking.conf
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP
    root /var/www/bus-booking/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://<backend-instance-ip>:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://<backend-instance-ip>:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Test and restart Nginx:**
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 7: Setup Load Balancer

### 7.1 Create Load Balancer

**Navigate to:** Networking > Load Balancers

**Configuration:**
```yaml
Name: bus-booking-lb
Type: Load Balancer
Shape: Flexible (10 Mbps min, 100 Mbps max)
Visibility: Public
```

### 7.2 Configure Backend Sets

**Backend Set 1: Frontend**
```yaml
Name: frontend-backend-set
Policy: Weighted Round Robin
Health Check:
  Protocol: HTTP
  Port: 80
  URL Path: /
  Interval: 10s
  Timeout: 3s
  Retries: 3

Backends:
  - Frontend Instance IP:80
```

**Backend Set 2: API**
```yaml
Name: api-backend-set
Policy: Weighted Round Robin
Health Check:
  Protocol: HTTP
  Port: 8080
  URL Path: /actuator/health
  Interval: 10s
  Timeout: 3s
  Retries: 3

Backends:
  - Backend Instance IP:8080
```

### 7.3 Configure Listeners

**Listener 1: HTTP**
```yaml
Name: http-listener
Protocol: HTTP
Port: 80
Default Backend Set: frontend-backend-set
```

**Listener 2: HTTPS (after SSL setup)**
```yaml
Name: https-listener
Protocol: HTTPS
Port: 443
SSL Certificate: Your SSL Certificate
Default Backend Set: frontend-backend-set
```

---

## Step 8: Configure Domain & SSL

### 8.1 Configure DNS

**Add DNS Records:**
```
Type: A
Name: @
Value: <load-balancer-public-ip>
TTL: 300

Type: A
Name: www
Value: <load-balancer-public-ip>
TTL: 300
```

### 8.2 Install SSL Certificate (Let's Encrypt)

**On frontend instance:**
```bash
# Install Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 8.3 Upload Certificate to OCI

1. Navigate to **Certificates** in OCI Console
2. Click **Create Certificate**
3. Upload certificate files from `/etc/letsencrypt/live/your-domain.com/`
4. Associate with Load Balancer HTTPS listener

---

## Step 9: Setup Monitoring

### 9.1 Enable Compute Metrics

**Navigate to:** Compute > Instances > Your Instance > Metrics

Enable:
- CPU Utilization
- Memory Utilization
- Network Bytes In/Out
- Disk Read/Write

### 9.2 Create Alarms

**CPU Alarm:**
```yaml
Name: high-cpu-usage
Metric: CpuUtilization
Condition: Greater than 80%
Duration: 5 minutes
Notification: Email
```

**Memory Alarm:**
```yaml
Name: high-memory-usage
Metric: MemoryUtilization
Condition: Greater than 85%
Duration: 5 minutes
Notification: Email
```

### 9.3 Setup Application Logging

**Install Filebeat (optional):**
```bash
# Download and install Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.11.0-x86_64.rpm
sudo rpm -vi filebeat-8.11.0-x86_64.rpm

# Configure Filebeat
sudo vi /etc/filebeat/filebeat.yml

# Start Filebeat
sudo systemctl enable filebeat
sudo systemctl start filebeat
```

---

## Troubleshooting

### Common Issues

**1. Cannot connect to instance**
```bash
# Check security list rules
# Verify SSH key is correct
# Check instance state (should be Running)
# Verify public IP is assigned
```

**2. Services not starting**
```bash
# Check logs
sudo journalctl -u service-name -n 50

# Check port conflicts
sudo netstat -tulpn | grep :8080

# Verify Java installation
java -version
```

**3. Database connection failed**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify firewall rules
sudo firewall-cmd --list-all

# Test connection
psql -h localhost -U busapp -d user_service_db
```

**4. Frontend not loading**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build directory
ls -la /var/www/bus-booking/build
```

**5. API Gateway timeout**
```bash
# Check backend services are running
sudo systemctl status user-service
sudo systemctl status booking-service
sudo systemctl status bus-service

# Check API Gateway logs
sudo journalctl -u api-gateway -f
```

### Performance Optimization

**1. Increase Java Heap Size**
```bash
# Edit service file
sudo vi /etc/systemd/system/user-service.service

# Add JVM options
ExecStart=/usr/bin/java -Xms512m -Xmx1024m -jar target/user-service-1.0.0.jar

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart user-service
```

**2. Enable Nginx Caching**
```nginx
# Add to nginx config
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    # ... other proxy settings
}
```

**3. Database Connection Pooling**
```yaml
# application.yml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
```

---

## Backup Strategy

### Database Backup

```bash
# Create backup script
vi /opt/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup all databases
pg_dump -U busapp user_service_db > $BACKUP_DIR/user_service_$DATE.sql
pg_dump -U busapp booking_service_db > $BACKUP_DIR/booking_service_$DATE.sql
pg_dump -U busapp bus_service_db > $BACKUP_DIR/bus_service_$DATE.sql

# Compress backups
gzip $BACKUP_DIR/*.sql

# Delete backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /opt/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /opt/scripts/backup-db.sh
```

### Application Backup

```bash
# Backup application files
tar -czf /opt/backups/app-$(date +%Y%m%d).tar.gz /opt/bus-booking/

# Upload to Object Storage (optional)
oci os object put --bucket-name backups --file /opt/backups/app-$(date +%Y%m%d).tar.gz
```

---

## Security Best Practices

1. **Change default passwords** for database, MinIO, etc.
2. **Use private subnets** for backend services
3. **Enable WAF** on Load Balancer
4. **Implement rate limiting** in API Gateway
5. **Regular security updates**:
   ```bash
   sudo dnf update -y
   ```
6. **Use secrets management** for sensitive data
7. **Enable audit logging** in OCI
8. **Implement backup encryption**
9. **Use VPN** for administrative access
10. **Regular security scans**

---

## Cost Optimization

### Always Free Resources
- 2 x VM.Standard.E2.1.Micro instances
- 2 x Autonomous Databases (20 GB each)
- 10 GB Object Storage
- 10 GB Archive Storage
- Load Balancer (1 instance, 10 Mbps)

### Cost-Saving Tips
1. Use Always Free tier resources
2. Stop instances when not in use
3. Use auto-scaling for production
4. Monitor and optimize resource usage
5. Use reserved instances for predictable workloads
6. Clean up unused resources regularly

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor application logs
- Check service health
- Review error rates

**Weekly:**
- Review performance metrics
- Check disk space
- Update dependencies

**Monthly:**
- Security updates
- Database optimization
- Backup verification
- Cost review

---

## Support & Resources

- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/Content/home.htm)
- [OCI Free Tier](https://www.oracle.com/cloud/free/)
- [OCI Community](https://community.oracle.com/customerconnect/categories/oci)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev/)

---

## Conclusion

Your Bus Booking Application is now deployed on Oracle Cloud Infrastructure! 

**Next Steps:**
1. Configure monitoring and alerts
2. Setup automated backups
3. Implement CI/CD pipeline
4. Configure custom domain
5. Enable SSL/TLS
6. Perform load testing
7. Document operational procedures

For production deployments, consider:
- Multi-region setup for high availability
- Database replication
- CDN for static assets
- Advanced security configurations
- Disaster recovery plan
