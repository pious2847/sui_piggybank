# S-Bank Deployment Verification Script (PowerShell)
# This script verifies that the system is ready for deployment

Write-Host "🚀 S-Bank Deployment Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0

function Check-Status {
    param($Message, $Condition)
    if ($Condition) {
        Write-Host "✓ $Message" -ForegroundColor Green
        $script:Passed++
    } else {
        Write-Host "✗ $Message" -ForegroundColor Red
        $script:Failed++
    }
}

# 1. Check Node.js and npm
Write-Host "📦 Checking Dependencies..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    Check-Status "Node.js installed ($nodeVersion)" ($null -ne $nodeVersion)
} catch {
    Check-Status "Node.js installed" $false
}

try {
    $npmVersion = npm --version 2>$null
    Check-Status "npm installed ($npmVersion)" ($null -ne $npmVersion)
} catch {
    Check-Status "npm installed" $false
}

# 2. Check node_modules
Check-Status "node_modules directory exists" (Test-Path "node_modules")

# 3. Check environment file
Write-Host ""
Write-Host "⚙️  Checking Configuration..." -ForegroundColor Yellow
Check-Status ".env file exists" (Test-Path ".env")

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    Check-Status "Package ID configured" ($envContent -match "VITE_TESTNET_COUNTER_PACKAGE_ID")
    Check-Status "Walrus aggregator configured" ($envContent -match "VITE_WALRUS_AGGREGATOR_URL")
}

# 4. Check Move contracts
Write-Host ""
Write-Host "📜 Checking Smart Contracts..." -ForegroundColor Yellow
Check-Status "Move contracts directory exists" (Test-Path "move/counter/sources")

if (Test-Path "move/counter/sources") {
    Check-Status "group_susu.move exists" (Test-Path "move/counter/sources/group_susu.move")
    Check-Status "reputation.move exists" (Test-Path "move/counter/sources/reputation.move")
    Check-Status "nft_rewards.move exists" (Test-Path "move/counter/sources/nft_rewards.move")
}

# 5. Check key source files
Write-Host ""
Write-Host "💻 Checking Frontend Files..." -ForegroundColor Yellow
Check-Status "App.tsx exists" (Test-Path "src/App.tsx")
Check-Status "constants.ts exists" (Test-Path "src/constants.ts")
Check-Status "networkConfig.ts exists" (Test-Path "src/networkConfig.ts")

# 6. Check documentation
Write-Host ""
Write-Host "📚 Checking Documentation..." -ForegroundColor Yellow
$docs = @(
    "README.md",
    "QUICK_START.md",
    "DEPLOYMENT_CHECKLIST.md",
    "DEPLOYMENT_READY.md",
    "FINAL_SUMMARY.md",
    "SYSTEM_ARCHITECTURE.md"
)

foreach ($doc in $docs) {
    Check-Status "$doc exists" (Test-Path $doc)
}

# 7. Try to build
Write-Host ""
Write-Host "🔨 Testing Build..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    $buildSuccess = $LASTEXITCODE -eq 0
    Check-Status "Production build successful" $buildSuccess
    
    if ($buildSuccess) {
        Check-Status "dist/ folder created" (Test-Path "dist")
    }
} catch {
    Check-Status "Production build successful" $false
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "🎉 All checks passed! System is ready for deployment!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some checks failed. Please fix the issues before deploying." -ForegroundColor Red
    exit 1
}
