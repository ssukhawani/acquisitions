# CI/CD Workflows Documentation

This document describes the GitHub Actions CI/CD workflows implemented for the Acquisitions application.

## Overview

The project includes three main workflows:

1. **Lint and Format** - Code quality checks
2. **Tests** - Automated testing with coverage
3. **Docker Build and Push** - Container image building and publishing

## Workflows

### 1. Lint and Format (`lint-and-format.yml`)

**Purpose**: Ensures code quality and consistent formatting across the codebase.

**Triggers**:
- Push to `main` or `staging` branches
- Pull requests targeting `main` or `staging` branches

**What it does**:
- Sets up Node.js 20.x environment with npm caching
- Installs dependencies using `npm ci`
- Runs ESLint for code quality checks
- Runs Prettier for formatting validation
- Provides clear annotations and suggestions for fixes

**Key Features**:
- ✅ Caching enabled for faster builds
- ✅ Clear error annotations with fix suggestions
- ✅ GitHub step summaries showing results
- ✅ Fails the workflow if issues are found

**Commands to fix issues locally**:
```bash
# Fix ESLint issues
npm run lint:fix

# Fix formatting issues
npm run format
```

### 2. Tests (`tests.yml`)

**Purpose**: Runs automated tests with code coverage reporting.

**Triggers**:
- Push to `main` or `staging` branches
- Pull requests targeting `main` or `staging` branches

**Environment Variables**:
- `NODE_ENV=test`
- `NODE_OPTIONS=--experimental-vm-modules`
- `DATABASE_URL=postgres://test:test@localhost:5432/test_db`

**What it does**:
- Sets up Node.js 20.x environment with npm caching
- Starts PostgreSQL 15 service for testing
- Installs dependencies using `npm ci`
- Runs database migrations (if available)
- Executes test suite with `npm test`
- Generates coverage reports (if configured)
- Uploads coverage artifacts with 30-day retention

**Key Features**:
- ✅ PostgreSQL service for database testing
- ✅ Coverage report generation and artifact upload
- ✅ Test failure annotations
- ✅ GitHub step summaries with test results
- ✅ Graceful handling of missing test configurations

**Test Commands**:
```bash
# Run tests locally
npm test

# Run tests with coverage (if configured)
npm run test:coverage
```

### 3. Docker Build and Push (`docker-build-and-push.yml`)

**Purpose**: Builds and publishes multi-platform Docker images.

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch (`workflow_dispatch`)

**What it does**:
- Sets up Docker Buildx for multi-platform builds
- Logs in to Docker Hub using secrets
- Extracts metadata and generates tags/labels
- Builds images for `linux/amd64` and `linux/arm64`
- Pushes images to Docker Hub with caching
- Generates deployment summaries

**Generated Tags**:
- `latest` (for main branch)
- `prod-YYYYMMDD-HHmmss` (timestamped production tags)
- `main-<commit-sha>-YYYYMMDD-HHmmss` (commit-specific tags)

**Key Features**:
- ✅ Multi-platform builds (AMD64 + ARM64)
- ✅ GitHub Actions cache for faster builds
- ✅ Comprehensive tagging strategy
- ✅ Deployment information in summaries
- ✅ Docker image metadata and labels

## Setup Instructions

### Prerequisites

1. **GitHub Repository**: Ensure your code is in a GitHub repository
2. **Docker Hub Account**: Create an account at [Docker Hub](https://hub.docker.com/)
3. **Repository Secrets**: Configure the required secrets

### Required Secrets

Add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `myusername` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_...` |

### Setting up Docker Hub Access Token

1. Go to [Docker Hub Account Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a descriptive name (e.g., "GitHub Actions")
4. Select appropriate permissions (Read, Write, Delete)
5. Copy the generated token and add it as `DOCKER_PASSWORD` secret

### Repository Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd acquisitions
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify scripts work locally**:
   ```bash
   npm run lint
   npm run format:check
   npm test
   ```

4. **Test Docker build**:
   ```bash
   docker build -t acquisitions .
   ```

### Branch Protection Rules (Recommended)

Set up branch protection rules for `main` and `staging` branches:

1. Go to `Settings > Branches` in your GitHub repository
2. Add rules for `main` and `staging` branches:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators
   - Select status checks: `lint-and-format`, `test`

## Workflow Status

### Workflow Badges

Add these badges to your README.md:

```markdown
[![Lint and Format](https://github.com/username/acquisitions/actions/workflows/lint-and-format.yml/badge.svg)](https://github.com/username/acquisitions/actions/workflows/lint-and-format.yml)
[![Tests](https://github.com/username/acquisitions/actions/workflows/tests.yml/badge.svg)](https://github.com/username/acquisitions/actions/workflows/tests.yml)
[![Docker Build and Push](https://github.com/username/acquisitions/actions/workflows/docker-build-and-push.yml/badge.svg)](https://github.com/username/acquisitions/actions/workflows/docker-build-and-push.yml)
```

### Monitoring Workflows

- **View workflow runs**: Go to `Actions` tab in your GitHub repository
- **Check logs**: Click on any workflow run to see detailed logs
- **Re-run workflows**: Use the "Re-run all jobs" button if needed
- **Cancel running workflows**: Use the "Cancel workflow" button

## Common Issues and Solutions

### 1. ESLint/Prettier Failures

**Issue**: Code doesn't pass linting or formatting checks

**Solution**:
```bash
# Fix automatically
npm run lint:fix
npm run format

# Check what needs fixing
npm run lint
npm run format:check
```

### 2. Test Failures

**Issue**: Tests fail in CI but pass locally

**Common causes**:
- Missing environment variables
- Database connection issues
- Different Node.js versions

**Solutions**:
- Ensure test database is properly configured
- Check environment variables in workflow
- Run tests with same Node.js version (20.x)

### 3. Docker Build Failures

**Issue**: Docker build fails

**Common causes**:
- Missing Dockerfile
- Build context issues
- Invalid secrets

**Solutions**:
- Verify Dockerfile exists and is valid
- Check Docker Hub credentials
- Test build locally: `docker build -t acquisitions .`

### 4. Missing Docker Hub Credentials

**Issue**: Login to Docker Hub fails

**Solution**:
1. Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set
2. Generate new Docker Hub access token if needed
3. Ensure token has write permissions

## Development Workflow

### Standard Development Process

1. **Create feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and test locally**:
   ```bash
   npm run lint:fix
   npm run format
   npm test
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature
   ```

4. **Create Pull Request**:
   - Workflows will run automatically
   - Address any failures before merging

5. **Merge to main**:
   - Docker image will be built and pushed automatically
   - New image available for deployment

### Deployment

After successful workflow completion:

```bash
# Pull the latest image
docker pull docker.io/yourusername/acquisitions:latest

# Run with Docker Compose
docker-compose --env-file .env.production -f docker-compose.prod.yml up -d

# Or run directly
docker run -d -p 3000:3000 yourusername/acquisitions:latest
```

## Customization

### Adding New Environments

To add support for additional environments (e.g., `development`):

1. Update workflow triggers in all three files:
   ```yaml
   on:
     push:
       branches: [ main, staging, development ]
     pull_request:
       branches: [ main, staging, development ]
   ```

### Modifying Test Configuration

Update the test workflow (`tests.yml`) environment variables:

```yaml
env:
  NODE_ENV: test
  DATABASE_URL: your_test_database_url
  API_KEY: ${{ secrets.TEST_API_KEY }}
```

### Changing Docker Registry

To use a different registry (e.g., GitHub Container Registry):

1. Update `docker-build-and-push.yml`:
   ```yaml
   env:
     REGISTRY: ghcr.io
     IMAGE_NAME: ${{ github.repository }}
   ```

2. Update login action:
   ```yaml
   - name: Log in to Container Registry
     uses: docker/login-action@v3
     with:
       registry: ghcr.io
       username: ${{ github.actor }}
       password: ${{ secrets.GITHUB_TOKEN }}
   ```

## Security Considerations

1. **Secrets Management**: Never commit secrets to the repository
2. **Access Tokens**: Use personal access tokens with minimal required permissions
3. **Branch Protection**: Enforce status checks and reviews
4. **Container Security**: Regularly update base images in Dockerfile

## Performance Optimization

1. **Caching**: All workflows use npm caching for faster builds
2. **Docker Layer Caching**: Build workflow uses GitHub Actions cache
3. **Parallel Jobs**: Tests and linting run in parallel where possible
4. **Timeouts**: All jobs have reasonable timeout limits

---

For additional help or questions, please refer to the [GitHub Actions documentation](https://docs.github.com/en/actions) or create an issue in the repository.