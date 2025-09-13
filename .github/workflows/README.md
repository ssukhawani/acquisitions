# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Acquisitions application.

## Available Workflows

| Workflow | File | Purpose | Triggers |
|----------|------|---------|----------|
| **Lint and Format** | `lint-and-format.yml` | Code quality and formatting checks | Push/PR to `main`, `staging` |
| **Tests** | `tests.yml` | Automated testing with coverage | Push/PR to `main`, `staging` |
| **Docker Build and Push** | `docker-build-and-push.yml` | Multi-platform Docker image builds | Push to `main`, Manual |

## Quick Setup

1. **Add Repository Secrets**:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub access token

2. **Enable Workflows**:
   - Workflows will run automatically on push/PR
   - Check the "Actions" tab in your repository

3. **Status Badges** (optional):
   ```markdown
   [![Lint and Format](https://github.com/username/acquisitions/actions/workflows/lint-and-format.yml/badge.svg)](https://github.com/username/acquisitions/actions/workflows/lint-and-format.yml)
   [![Tests](https://github.com/username/acquisitions/actions/workflows/tests.yml/badge.svg)](https://github.com/username/acquisitions/actions/workflows/tests.yml)
   [![Docker Build and Push](https://github.com/username/acquisitions/actions/workflows/docker-build-and-push.yml/badge.svg)](https://github.com/username/acquisitions/actions/workflows/docker-build-and-push.yml)
   ```

## Documentation

For detailed setup instructions, troubleshooting, and customization options, see:
- [CI/CD Workflows Documentation](../../CI_CD_WORKFLOWS.md)

## Local Development

Before pushing code, run these commands locally:

```bash
# Install dependencies
npm ci

# Check code quality
npm run lint
npm run format:check

# Run tests
npm test

# Fix issues automatically
npm run lint:fix
npm run format
```

## Support

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Troubleshooting](../../CI_CD_WORKFLOWS.md#common-issues-and-solutions)