# Acquisitions App - Dockerized with Neon Database

A Node.js Express application with Drizzle ORM and Neon Database, fully dockerized for both development and production environments.

## Architecture Overview

- **Development**: Uses Neon Local proxy in Docker to create ephemeral database branches
- **Production**: Connects directly to Neon Cloud database
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Security**: Arcjet protection, Helmet middleware, security headers

## Prerequisites

- Docker & Docker Compose
- Neon Database account and project
- Node.js 20+ (for local development)

## Environment Setup

### 1. Neon Database Configuration

First, you'll need to set up your Neon project:

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or use an existing one
3. Get your credentials:
   - **NEON_API_KEY**: From [Account Settings → API Keys](https://console.neon.tech/app/settings/api-keys)
   - **NEON_PROJECT_ID**: From Project Settings → General
   - **PARENT_BRANCH_ID**: Your main branch ID (usually starts with `br-`)
   - **Production DB_URL**: Your production database connection string

### 2. Environment Files

Copy and configure the environment files:

```bash
# Copy environment templates
cp .env.development.example .env.development
cp .env.production.example .env.production

# Edit with your actual values
nano .env.development
nano .env.production
```

#### `.env.development` Configuration

```env
# Development Environment Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Database configuration - Neon Local
DB_URL=postgres://neon:npg@neon-local:5432/main?sslmode=require

# Neon Local Configuration
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=br-your-parent-branch-id-here

# Arcjet
ARCJET_ENV=development
ARCJET_KEY=your_arcjet_key_here
```

#### `.env.production` Configuration

```env
# Production Environment Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Database configuration - Neon Cloud
DB_URL=postgres://username:password@ep-xyz.us-east-1.aws.neon.tech/dbname?sslmode=require

# Arcjet
ARCJET_ENV=production
ARCJET_KEY=your_production_arcjet_key_here
```

## Development Setup

### Quick Start

```bash
# 1. Configure environment
cp .env.development.example .env.development
# Edit .env.development with your Neon credentials

# 2. Start development environment
docker-compose --env-file .env.development -f docker-compose.dev.yml up -d

# 3. View logs
docker-compose -f docker-compose.dev.yml logs -f

# 4. Access your app
open http://localhost:3000
```

### Development Features

- **Ephemeral Database Branches**: Each container restart creates a fresh database branch
- **Hot Reload**: Source code changes are reflected without rebuilding
- **Neon Local Proxy**: Seamless connection to Neon Cloud through local proxy
- **Debug Logging**: Enhanced logging for development debugging

### Development Commands

```bash
# Start development environment
docker-compose --env-file .env.development -f docker-compose.dev.yml up -d

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build

# View application logs
docker-compose -f docker-compose.dev.yml logs -f app

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs -f neon-local

# Execute commands in app container
docker-compose -f docker-compose.dev.yml exec app sh

# Run database migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## Production Deployment

### Production Setup

```bash
# 1. Configure environment
cp .env.production.example .env.production
# Edit .env.production with your production Neon Cloud URL

# 2. Deploy production environment
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d

# 3. Verify deployment
curl http://localhost/health
```

### Production Features

- **Direct Neon Cloud Connection**: No local proxy, direct secure connection
- **Nginx Reverse Proxy**: Load balancing, security headers, rate limiting
- **Security Hardened**: Read-only filesystem, dropped capabilities, resource limits
- **Health Checks**: Automated health monitoring and restart policies

### Production Commands

```bash
# Deploy production
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d

# Scale application (if needed)
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Rolling update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor container health
docker-compose -f docker-compose.prod.yml ps
```

## Database Management

### Migrations

```bash
# Generate new migration
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

### Neon Local Features

- **Ephemeral Branches**: Fresh database for each development session
- **Git Integration**: Persistent branches per Git branch (optional)
- **Multi-driver Support**: Works with both Postgres and Neon serverless drivers
- **Automatic Cleanup**: Branches deleted when container stops

## Environment Switching

The application automatically adapts based on the Docker Compose file and environment variables used:

```bash
# Development (Neon Local)
docker-compose --env-file .env.development -f docker-compose.dev.yml up -d

# Production (Neon Cloud)
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## Monitoring and Debugging

### Health Checks

Both environments include health checks:

```bash
# Check application health
curl http://localhost:3000/health

# Check Docker health status
docker-compose ps
```

### Logs

```bash
# Application logs
docker-compose logs -f app

# Nginx logs (production)
docker-compose -f docker-compose.prod.yml logs -f nginx

# Neon Local logs (development)
docker-compose -f docker-compose.dev.yml logs -f neon-local
```

### Debugging

```bash
# Access application container
docker-compose exec app sh

# View environment variables
docker-compose exec app env | grep -E '(DB_URL|NODE_ENV)'

# Test database connection
docker-compose exec app node -e "
const { db } = require('./src/config/database.js');
console.log('Database connection test...');
"
```

## Security Considerations

### Development
- Uses ephemeral branches (data not persisted)
- Debug logging enabled
- Hot reload for development efficiency

### Production
- Read-only filesystem
- Dropped Linux capabilities
- Resource limits enforced
- Rate limiting via Nginx
- Security headers
- No debug logging

## Troubleshooting

### Common Issues

1. **Neon Local Connection Issues**
   ```bash
   # Check Neon credentials
   docker-compose -f docker-compose.dev.yml logs neon-local
   
   # Verify API key and project ID
   echo $NEON_API_KEY
   echo $NEON_PROJECT_ID
   ```

2. **Database Connection Failed**
   ```bash
   # Test connection string
   docker-compose exec app node -e "console.log(process.env.DB_URL)"
   
   # Check network connectivity
   docker-compose exec app ping neon-local
   ```

3. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :5432
   
   # Stop conflicting services
   docker-compose down
   ```

### Logs and Diagnostics

```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Network inspection
docker network inspect acquisitions_app-network

# Volume inspection
docker volume ls | grep acquisitions
```

## File Structure

```
.
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.dev.yml     # Development with Neon Local
├── docker-compose.prod.yml    # Production with Neon Cloud
├── nginx.conf                 # Production reverse proxy config
├── .env.development           # Development environment variables
├── .env.production            # Production environment variables
├── .gitignore                 # Git ignore rules
├── src/                       # Application source code
│   ├── config/
│   │   └── database.js        # Database configuration
│   └── ...
├── drizzle/                   # Database migrations
└── README.md                  # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes using development environment
4. Test with `docker-compose -f docker-compose.dev.yml up -d`
5. Submit pull request

## Support

- [Neon Documentation](https://neon.com/docs)
- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Note**: Remember to never commit your `.env.development` and `.env.production` files to version control. They contain sensitive credentials.