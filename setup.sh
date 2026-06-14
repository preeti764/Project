#!/bin/bash
# Quick Start Script for Alumni Portal

echo "================================"
echo "Alumni Portal - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend || exit 1

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your MongoDB URI and JWT_SECRET"
fi

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "✅ Backend setup complete"
echo ""

# Frontend Setup
echo "📦 Setting up Frontend..."
cd ../frontend || exit 1

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "✅ Frontend .env created with default settings"
fi

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Frontend setup complete"
echo ""

# Summary
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next Steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT_SECRET"
echo "2. Run backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Run frontend (in new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173"
echo ""
echo "For help, see:"
echo "- Setup Guide: SETUP_GUIDE.md"
echo "- API Docs: API_DOCUMENTATION.md"
echo "- Deployment: DEPLOYMENT.md"
echo ""
