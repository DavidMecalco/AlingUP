#!/bin/bash

# Deployment script for Ticket Management Portal
# Usage: ./scripts/deploy.sh [staging|production]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="ticket-management-portal"
BUILD_DIR="dist"
BACKUP_DIR="backups"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

echo -e "${BLUE}🚀 Starting deployment to ${ENVIRONMENT}...${NC}"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm ci
fi

# Run pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check for linting errors
echo "  - Running linter..."
npm run lint || {
    echo -e "${RED}❌ Linting failed. Please fix errors before deploying.${NC}"
    exit 1
}

# Run type checking (if TypeScript)
if [[ -f "tsconfig.json" ]]; then
    echo "  - Running type check..."
    npm run type-check || {
        echo -e "${RED}❌ Type checking failed. Please fix errors before deploying.${NC}"
        exit 1
    }
fi

# Run tests
echo "  - Running tests..."
npm run test || {
    echo -e "${RED}❌ Tests failed. Please fix failing tests before deploying.${NC}"
    exit 1
}

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup current deployment (if exists)
if [[ -d "$BUILD_DIR" ]]; then
    BACKUP_NAME="${PROJECT_NAME}-${ENVIRONMENT}-$(date +%Y%m%d-%H%M%S)"
    echo -e "${BLUE}📦 Creating backup: ${BACKUP_NAME}${NC}"
    cp -r "$BUILD_DIR" "$BACKUP_DIR/$BACKUP_NAME"
fi

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf "$BUILD_DIR"

# Build for the specified environment
echo -e "${BLUE}🔨 Building for ${ENVIRONMENT}...${NC}"
if [[ "$ENVIRONMENT" == "production" ]]; then
    npm run build:production
else
    npm run build:staging
fi

# Verify build was successful
if [[ ! -d "$BUILD_DIR" ]]; then
    echo -e "${RED}❌ Build failed - ${BUILD_DIR} directory not found${NC}"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
echo -e "${GREEN}📊 Build size: ${BUILD_SIZE}${NC}"

# Deployment-specific actions
case "$ENVIRONMENT" in
    "staging")
        echo -e "${BLUE}🚀 Deploying to staging...${NC}"
        # Add your staging deployment commands here
        # Examples:
        # - Upload to staging server via rsync/scp
        # - Deploy to Netlify/Vercel staging
        # - Update staging environment variables
        
        echo "  - Staging deployment commands would go here"
        echo "  - Example: rsync -avz --delete $BUILD_DIR/ user@staging-server:/var/www/html/"
        echo "  - Example: netlify deploy --dir=$BUILD_DIR --site=staging-site-id"
        ;;
        
    "production")
        echo -e "${BLUE}🚀 Deploying to production...${NC}"
        
        # Additional production safety checks
        echo -e "${YELLOW}⚠️  Production deployment requires confirmation${NC}"
        read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
        
        if [[ "$confirm" != "yes" ]]; then
            echo -e "${YELLOW}❌ Deployment cancelled${NC}"
            exit 0
        fi
        
        # Add your production deployment commands here
        # Examples:
        # - Upload to production server via rsync/scp
        # - Deploy to Netlify/Vercel production
        # - Update production environment variables
        # - Notify team of deployment
        
        echo "  - Production deployment commands would go here"
        echo "  - Example: rsync -avz --delete $BUILD_DIR/ user@production-server:/var/www/html/"
        echo "  - Example: netlify deploy --prod --dir=$BUILD_DIR --site=production-site-id"
        ;;
esac

# Post-deployment verification
echo -e "${BLUE}🔍 Running post-deployment verification...${NC}"

# Check if critical files exist
CRITICAL_FILES=("index.html" "assets")
for file in "${CRITICAL_FILES[@]}"; do
    if [[ ! -e "$BUILD_DIR/$file" ]]; then
        echo -e "${RED}❌ Critical file missing: $file${NC}"
        exit 1
    fi
done

# Optional: Run smoke tests against deployed application
# echo "  - Running smoke tests..."
# npm run test:smoke:$ENVIRONMENT || {
#     echo -e "${RED}❌ Smoke tests failed${NC}"
#     exit 1
# }

echo -e "${GREEN}✅ Post-deployment verification passed${NC}"

# Cleanup old backups (keep last 5)
echo -e "${BLUE}🧹 Cleaning up old backups...${NC}"
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs -r rm -rf
cd ..

# Success message
echo -e "${GREEN}🎉 Deployment to ${ENVIRONMENT} completed successfully!${NC}"
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  - Environment: $ENVIRONMENT"
echo "  - Build size: $BUILD_SIZE"
echo "  - Backup created: $(ls -t $BACKUP_DIR | head -n 1)"
echo "  - Deployment time: $(date)"

# Optional: Send notification
# if [[ "$ENVIRONMENT" == "production" ]]; then
#     echo -e "${BLUE}📢 Sending deployment notification...${NC}"
#     # Add notification commands here (Slack, email, etc.)
# fi

echo -e "${GREEN}✨ All done!${NC}"