#!/bin/bash

# ╔════════════════════════════════════════════════════════════════╗
# ║          MicroFund Smart Contract - Quick Start Deploy         ║
# ║                    Sepolia Testnet Edition                     ║
# ╚════════════════════════════════════════════════════════════════╝

echo "🚀 MicroFund Smart Contract Deployment"
echo "========================================"
echo ""

# Step 1: Navigate to blockchain directory
echo "📁 Step 1: Navigating to blockchain directory..."
cd blockchain || exit 1
echo "✅ In blockchain directory"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Step 3: Compile contract
echo "🔨 Step 3: Compiling smart contract..."
npm run compile
if [ $? -eq 0 ]; then
    echo "✅ Contract compiled successfully"
else
    echo "❌ Compilation failed"
    exit 1
fi
echo ""

# Step 4: Check environment variables
echo "🔐 Step 4: Checking environment variables..."
if [ -z "$PRIVATE_KEY" ]; then
    echo "⚠️  PRIVATE_KEY not set in environment"
    echo "    Please add it to Vercel environment variables"
    exit 1
fi

if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "⚠️  SEPOLIA_RPC_URL not set in environment"
    echo "    Please add it to Vercel environment variables"
    exit 1
fi
echo "✅ Environment variables verified"
echo ""

# Step 5: Deploy to Sepolia
echo "🌐 Step 5: Deploying to Sepolia Testnet..."
echo "   Network: Sepolia (11155111)"
echo "   This may take 1-2 minutes..."
echo ""

npm run deploy:sepolia

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ════════════════════════════════════════════════════════════"
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "✅ ════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Save the contract address from above"
    echo "   2. Update /lib/contract.ts with the address"
    echo "   3. Visit: https://sepolia.etherscan.io/address/YOUR_ADDRESS"
    echo "   4. Verify the contract is there and verified"
    echo ""
    echo "📖 Documentation:"
    echo "   • Read: /DEPLOYMENT_GUIDE.md for full integration"
    echo "   • Read: /MICROFUND_CONTRACT_CARD.md for quick reference"
    echo ""
    echo "🧪 Testing:"
    echo "   Follow testing scenarios in DEPLOYMENT_GUIDE.md"
    echo ""
else
    echo ""
    echo "❌ ════════════════════════════════════════════════════════════"
    echo "❌ DEPLOYMENT FAILED"
    echo "❌ ════════════════════════════════════════════════════════════"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check PRIVATE_KEY is valid"
    echo "  2. Check SEPOLIA_RPC_URL is valid"
    echo "  3. Ensure wallet has SepoliaETH (from faucet)"
    echo "  4. Check network connection"
    echo ""
    exit 1
fi
