# Docker Commands Quick Reference

## Development Environment

### Start Development
```bash
# Start with Neon Local
docker-compose --env-file .env.development -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Development Management
```bash
# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build

# Execute commands in app container
docker-compose -f docker-compose.dev.yml exec app sh

# Run migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio

# View specific service logs
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f neon-local
```

## Production Environment

### Deploy Production
```bash
# Deploy with Neon Cloud
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Production Management
```bash
# Rolling update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Monitor health
docker-compose -f docker-compose.prod.yml ps

# View service logs
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx
```

## Docker Management

### Image Management
```bash
# Build application image
docker build -t acquisitions-app .

# Remove unused images
docker image prune -f

# Remove all containers and networks
docker-compose -f docker-compose.dev.yml down --volumes --remove-orphans
```

### Debugging
```bash
# Container status
docker-compose ps

# Resource usage
docker stats

# Network inspection
docker network ls
docker network inspect acquisitions_app-network

# Volume inspection
docker volume ls
docker volume inspect acquisitions_neon-local-data
```

## Health Checks

### Application Health
```bash
# Development
curl http://localhost:3000/health

# Production (through nginx)
curl http://localhost/health
```

### Database Connection Test
```bash
# Test Neon Local connection
docker-compose -f docker-compose.dev.yml exec app node -e "
const { sql } = require('./src/config/database.js');
sql\`SELECT version()\`.then(result => console.log('DB Connected:', result[0].version));
"

# Test direct Neon connection (production)
docker-compose -f docker-compose.prod.yml exec app node -e "
const { sql } = require('./src/config/database.js');
sql\`SELECT version()\`.then(result => console.log('DB Connected:', result[0].version));
"
```

## Troubleshooting

### Common Issues
```bash
# Check if ports are in use
lsof -i :3000
lsof -i :5432

# Reset everything
docker-compose -f docker-compose.dev.yml down --volumes
docker system prune -f

# View container logs for errors
docker-compose -f docker-compose.dev.yml logs app

# Check Neon Local status
docker-compose -f docker-compose.dev.yml logs neon-local
```

### Environment Variables
```bash
# View environment variables in container
docker-compose -f docker-compose.dev.yml exec app env | grep -E '(DB_URL|NODE_ENV|NEON_)'
```

## Quick Setup

### First Time Setup
```bash
# Run setup script
./setup.sh

# Or manually:
cp .env.example .env.development
cp .env.example .env.production

# Edit files with your Neon credentials
nano .env.development
nano .env.production

# Start development
docker-compose --env-file .env.development -f docker-compose.dev.yml up -d
```