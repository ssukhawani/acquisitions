#!/bin/bash

# Acquisitions App Setup Script
# This script helps set up the Docker environment for both development and production

set -e

echo "🚀 Acquisitions App Docker Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}$1${NC}"
    echo "----------------------------------------"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed ✓"
}

# Create environment files from examples
setup_env_files() {
    print_header "Setting up environment files"
    
    # Check if .env.development exists
    if [ ! -f .env.development ]; then
        print_status "Creating .env.development from template..."
        cp .env.example .env.development
        
        # Add development-specific configurations
        cat >> .env.development << EOF

# Development Environment Configuration - Added by setup script
NODE_ENV=development
LOG_LEVEL=debug
DB_URL=postgres://neon:npg@neon-local:5432/main?sslmode=require

# Neon Local Configuration (REQUIRED - Please update with your values)
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=br-your-parent-branch-id-here

# Arcjet
ARCJET_ENV=development
ARCJET_KEY=your_arcjet_key_here
EOF
        print_status ".env.development created ✓"
    else
        print_warning ".env.development already exists, skipping..."
    fi
    
    # Check if .env.production exists
    if [ ! -f .env.production ]; then
        print_status "Creating .env.production from template..."
        cp .env.example .env.production
        
        # Add production-specific configurations
        cat >> .env.production << EOF

# Production Environment Configuration - Added by setup script
NODE_ENV=production
LOG_LEVEL=info
DB_URL=your_neon_cloud_database_url_here

# Arcjet
ARCJET_ENV=production
ARCJET_KEY=your_production_arcjet_key_here
EOF
        print_status ".env.production created ✓"
    else
        print_warning ".env.production already exists, skipping..."
    fi
}

# Display setup instructions
show_instructions() {
    print_header "Next Steps"
    
    echo "1. Update your Neon Database credentials:"
    echo "   - Edit .env.development with your Neon API key, Project ID, and Parent Branch ID"
    echo "   - Edit .env.production with your Neon Cloud database URL"
    echo ""
    echo "2. Get your Neon credentials from:"
    echo "   - API Key: https://console.neon.tech/app/settings/api-keys"
    echo "   - Project ID: Your Neon project settings"
    echo "   - Parent Branch ID: Your main branch (usually starts with 'br-')"
    echo ""
    echo "3. Start development environment:"
    echo "   ${GREEN}docker-compose --env-file .env.development -f docker-compose.dev.yml up -d${NC}"
    echo ""
    echo "4. Start production environment:"
    echo "   ${GREEN}docker-compose --env-file .env.production -f docker-compose.prod.yml up -d${NC}"
    echo ""
    echo "5. View logs:"
    echo "   ${GREEN}docker-compose -f docker-compose.dev.yml logs -f${NC}"
    echo ""
    print_status "Setup complete! Check README.md for detailed instructions."
}

# Build Docker images
build_images() {
    print_header "Building Docker images"
    
    print_status "Building application image..."
    docker build -t acquisitions-app .
    
    print_status "Docker images built successfully ✓"
}

# Validate environment
validate_env() {
    print_header "Validating environment"
    
    # Check if required files exist
    local required_files=("Dockerfile" "docker-compose.dev.yml" "docker-compose.prod.yml" "package.json")
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file $file not found!"
            exit 1
        fi
    done
    
    print_status "All required files present ✓"
}

# Main setup function
main() {
    echo "Starting setup process..."
    echo ""
    
    check_docker
    validate_env
    setup_env_files
    
    # Ask if user wants to build images
    echo ""
    read -p "Do you want to build Docker images now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_images
    else
        print_status "Skipping Docker image build. You can build later with: docker build -t acquisitions-app ."
    fi
    
    show_instructions
}

# Run setup if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi