#!/bin/bash

# ZeroDust Single Network Deployment Script
# Usage: ./deploy-single.sh <network_name>
# Example: ./deploy-single.sh base_sepolia

if [ $# -eq 0 ]; then
    echo "❌ Error: Please specify a network"
    echo ""
    echo "Usage: ./deploy-single.sh <network_name>"
    echo ""
    echo "Available networks:"
    echo "  ethereum_sepolia"
    echo "  base_sepolia"
    echo "  arbitrum_sepolia"
    echo "  optimism_sepolia"
    echo "  polygon_amoy"
    echo "  avalanche_fuji"
    echo "  bsc_testnet"
    echo "  blast_sepolia"
    echo "  berachain_artio"
    echo "  ink_sepolia"
    echo "  linea_sepolia"
    echo "  mode_sepolia"
    echo "  scroll_sepolia"
    echo "  soneium_minato"
    echo "  sonic_testnet"
    echo "  unichain_sepolia"
    echo "  zksync_sepolia"
    exit 1
fi

NETWORK=$1

echo "🚀 Deploying ZeroDust to $NETWORK..."
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    exit 1
fi

source .env

echo "✅ Environment loaded"
echo "📍 Paymaster: $PAYMASTER_ADDRESS"
echo ""

# Deploy to specified network
echo "🌐 Starting deployment..."

if forge script script/DeploySweeper.s.sol:DeploySweeperScript \
    --rpc-url $NETWORK \
    --broadcast \
    --verify \
    -vvvv; then
    echo ""
    echo "✅ Successfully deployed to $NETWORK!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Check deployment address in broadcast/ folder"
    echo "2. Verify contract on block explorer"
    echo "3. Fund paymaster wallet on this chain"
else
    echo ""
    echo "❌ Deployment failed"
    echo "Check network name and wallet balance"
fi