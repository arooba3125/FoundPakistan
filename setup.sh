#!/bin/bash
# Found Pakistan - Complete Setup Script
# Run this to fully initialize both frontend and backend

set -e

echo "🚀 Found Pakistan Setup"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Backend Setup
echo -e "${BLUE}Step 1: Setting up Backend...${NC}"
cd api

if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
else
  echo "Backend dependencies already installed"
fi

echo "Generating Prisma client..."
npm run prisma:generate

echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# 2. Database Migration
echo -e "${BLUE}Step 2: Setting up Database...${NC}"
echo "Running Prisma migrations..."
npx prisma migrate dev --name init

echo -e "${GREEN}✓ Database setup complete${NC}"
echo ""

# 3. Frontend Setup
echo -e "${BLUE}Step 3: Setting up Frontend...${NC}"
cd ..

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
else
  echo "Frontend dependencies already installed"
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"
echo ""

# 4. Summary
echo "================================================================"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "================================================================"
echo ""
echo "📌 Next steps:"
echo ""
echo "1. Start backend (Terminal 1):"
echo "   cd api && npm run start:dev"
echo ""
echo "2. Start frontend (Terminal 2):"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000 (Frontend)"
echo "   http://localhost:3001/api (Backend)"
echo ""
echo "4. Optional - View database:"
echo "   cd api && npx prisma studio"
echo ""
echo "📖 See INTEGRATION_GUIDE.md for API documentation"
echo "📊 See COMPLETION_SUMMARY.md for what was completed"
echo ""
