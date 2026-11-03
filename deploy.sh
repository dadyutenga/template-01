#!/bin/bash

# Kibegi Frontend - Quick Netlify Deployment Script
# Run this script to prepare and deploy your app to Netlify

echo "🚀 Kibegi Frontend Deployment Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm version: $(npm --version)${NC}"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo ""

# Build the project
echo -e "${YELLOW}🔨 Building the project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}⚠️  Netlify CLI is not installed.${NC}"
    echo ""
    echo "Choose deployment method:"
    echo "1. Install Netlify CLI and deploy (recommended)"
    echo "2. Manual deployment instructions"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            echo -e "${YELLOW}📦 Installing Netlify CLI globally...${NC}"
            npm install -g netlify-cli
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Netlify CLI installed successfully${NC}"
            else
                echo -e "${RED}❌ Failed to install Netlify CLI${NC}"
                exit 1
            fi
            ;;
        2)
            echo ""
            echo -e "${GREEN}📝 Manual Deployment Instructions:${NC}"
            echo ""
            echo "1. Go to https://app.netlify.com/drop"
            echo "2. Drag and drop the 'dist' folder"
            echo "3. Your site will be deployed!"
            echo ""
            echo "OR"
            echo ""
            echo "1. Go to https://app.netlify.com"
            echo "2. Click 'Add new site' → 'Import an existing project'"
            echo "3. Connect your GitHub repository"
            echo "4. Configure build settings (already set in netlify.toml)"
            echo "5. Deploy!"
            echo ""
            echo -e "${GREEN}✅ Build completed. Your 'dist' folder is ready!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${YELLOW}🌐 Deploying to Netlify...${NC}"
echo ""
echo "Choose deployment type:"
echo "1. Production deployment"
echo "2. Draft deployment (preview)"
echo ""
read -p "Enter your choice (1 or 2): " deploy_choice

case $deploy_choice in
    1)
        echo -e "${YELLOW}🚀 Deploying to production...${NC}"
        netlify deploy --prod
        ;;
    2)
        echo -e "${YELLOW}📋 Creating draft deployment...${NC}"
        netlify deploy
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🎉 Your Kibegi app is now live!"
    echo ""
    echo "Next steps:"
    echo "1. Set up custom domain (if needed)"
    echo "2. Configure environment variables"
    echo "3. Enable HTTPS"
    echo "4. Test your app thoroughly"
    echo ""
    echo "For more information, see NETLIFY_DEPLOYMENT.md"
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo "Please check the error messages above and try again."
    exit 1
fi
