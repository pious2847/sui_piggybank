#!/bin/bash

# S-Bank Deployment Verification Script
# This script verifies that the system is ready for deployment

echo "🚀 S-Bank Deployment Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAILED++))
    fi
}

# 1. Check Node.js version
echo "📦 Checking Dependencies..."
node --version > /dev/null 2>&1
check_status "Node.js installed"

npm --version > /dev/null 2>&1
check_status "npm installed"

# 2. Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} node_modules directory missing (run: npm install)"
    ((FAILED++))
fi

# 3. Check environment file
echo ""
echo "⚙️  Checking Configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    ((PASSED++))
    
    # Check required variables
    if grep -q "VITE_TESTNET_COUNTER_PACKAGE_ID" .env; then
        echo -e "${GREEN}✓${NC} Package ID configured"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Package ID missing in .env"
        ((FAILED++))
    fi
    
    if grep -q "VITE_WALRUS_AGGREGATOR_URL" .env; then
        echo -e "${GREEN}✓${NC} Walrus aggregator configured"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Walrus aggregator missing in .env"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} .env file missing"
    ((FAILED++))
fi

# 4. Check Move contracts
echo ""
echo "📜 Checking Smart Contracts..."
if [ -d "move/counter/sources" ]; then
    echo -e "${GREEN}✓${NC} Move contracts directory exists"
    ((PASSED++))
    
    # Check for key contract files
    if [ -f "move/counter/sources/group_susu.move" ]; then
        echo -e "${GREEN}✓${NC} group_susu.move exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} group_susu.move missing"
        ((FAILED++))
    fi
    
    if [ -f "move/counter/sources/reputation.move" ]; then
        echo -e "${GREEN}✓${NC} reputation.move exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} reputation.move missing"
        ((FAILED++))
    fi
    
    if [ -f "move/counter/sources/nft_rewards.move" ]; then
        echo -e "${GREEN}✓${NC} nft_rewards.move exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} nft_rewards.move missing"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Move contracts directory missing"
    ((FAILED++))
fi

# 5. Check key source files
echo ""
echo "💻 Checking Frontend Files..."
if [ -f "src/App.tsx" ]; then
    echo -e "${GREEN}✓${NC} App.tsx exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} App.tsx missing"
    ((FAILED++))
fi

if [ -f "src/constants.ts" ]; then
    echo -e "${GREEN}✓${NC} constants.ts exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} constants.ts missing"
    ((FAILED++))
fi

if [ -f "src/networkConfig.ts" ]; then
    echo -e "${GREEN}✓${NC} networkConfig.ts exists"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} networkConfig.ts missing"
    ((FAILED++))
fi

# 6. Check documentation
echo ""
echo "📚 Checking Documentation..."
DOCS=("README.md" "QUICK_START.md" "DEPLOYMENT_CHECKLIST.md" "DEPLOYMENT_READY.md" "FINAL_SUMMARY.md" "SYSTEM_ARCHITECTURE.md")

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $doc missing"
        ((FAILED++))
    fi
done

# 7. Try to build
echo ""
echo "🔨 Testing Build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Production build successful"
    ((PASSED++))
    
    # Check if dist folder was created
    if [ -d "dist" ]; then
        echo -e "${GREEN}✓${NC} dist/ folder created"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} dist/ folder not created"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Production build failed"
    ((FAILED++))
fi

# Summary
echo ""
echo "=================================="
echo "📊 Verification Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! System is ready for deployment!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Please fix the issues before deploying.${NC}"
    exit 1
fi
