#!/bin/bash

# =============================================
# Personal Finance Dashboard - Deploy Script
# =============================================

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Install with: npm install -g @supabase/cli"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI not found. Install with: npm install -g vercel"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js"
        exit 1
    fi
    
    print_status "All dependencies are installed"
}

# Install npm dependencies
install_dependencies() {
    echo "Installing npm dependencies..."
    npm install
    print_status "Dependencies installed"
}

# Build and test the project
build_project() {
    echo "Building project..."
    
    # Type check
    echo "Running type check..."
    npm run typecheck
    print_status "Type check passed"
    
    # Lint
    echo "Running linter..."
    npm run lint
    print_status "Linting passed"
    
    # Build
    echo "Building for production..."
    npm run build
    print_status "Build completed"
}

# Deploy to Supabase
deploy_supabase() {
    echo "Deploying to Supabase..."
    
    # Check if logged in
    if ! supabase projects list &> /dev/null; then
        print_warning "Not logged in to Supabase. Please run: supabase login"
        exit 1
    fi
    
    # Push database schema
    echo "Pushing database schema..."
    supabase db push
    print_status "Database schema deployed"
    
    # Deploy edge functions
    echo "Deploying edge functions..."
    supabase functions deploy forecast
    print_status "Edge functions deployed"
    
    # Optional: Reset database with seed data
    read -p "Reset database with seed data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Seeding database..."
        supabase db reset --debug
        print_status "Database seeded"
    fi
}

# Deploy to Vercel
deploy_vercel() {
    echo "Deploying to Vercel..."
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Please run: vercel login"
        exit 1
    fi
    
    # Deploy
    vercel --prod
    print_status "Deployed to Vercel"
}

# Verify deployment
verify_deployment() {
    echo "Verifying deployment..."
    
    # Get project info
    PROJECT_URL=$(vercel --prod --confirm 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -n "$PROJECT_URL" ]; then
        print_status "Deployment successful: $PROJECT_URL"
        
        # Optional: Open in browser
        read -p "Open deployment in browser? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$PROJECT_URL" || xdg-open "$PROJECT_URL" || echo "Please open: $PROJECT_URL"
        fi
    else
        print_warning "Could not determine deployment URL"
    fi
}

# Main deployment flow
main() {
    echo "🏦 Personal Finance Dashboard Deployment"
    echo "========================================"
    
    check_dependencies
    install_dependencies
    build_project
    deploy_supabase
    deploy_vercel
    verify_deployment
    
    echo
    print_status "Deployment complete! 🎉"
    echo
    echo "Next steps:"
    echo "1. Set up custom domain (optional): vercel domains add your-domain.com"
    echo "2. Configure monitoring and analytics"
    echo "3. Set up backup strategy"
    echo "4. Review security settings"
    echo
    echo "For help: See DEPLOYMENT.md"
}

# Run main function
main "$@"