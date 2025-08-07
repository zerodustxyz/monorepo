#!/bin/bash

# ZeroDust Deployment Script for All Testnets
# This script deploys the Sweeper contract to multiple testnets

echo "🚀 Starting ZeroDust deployment to all testnets..."
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required environment variables"
    exit 1
fi

# Source environment variables
source .env

# Check required environment variables
if [ -z "$DEPLOYER_PRIVATE_KEY" ] || [ -z "$PAYMASTER_ADDRESS" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please check your .env file contains:"
    echo "- DEPLOYER_PRIVATE_KEY"
    echo "- PAYMASTER_ADDRESS"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "📍 Paymaster Address: $PAYMASTER_ADDRESS"
echo ""

# Array of networks to deploy to
declare -a networks=(
    "ethereum_sepolia"
    "base_sepolia" 
    "arbitrum_sepolia"
    "optimism_sepolia"
    "polygon_amoy"
    "avalanche_fuji"
    "bsc_testnet"
    "blast_sepolia"
    "berachain_artio"
    "ink_sepolia"
    "linea_sepolia"
    "mode_sepolia"
    "scroll_sepolia"
    "soneium_minato"
    "sonic_testnet"
    "unichain_sepolia"
    "zksync_sepolia"
)

# Deploy to each network
for network in "${networks[@]}"
do
    echo "🌐 Deploying to $network..."
    
    # Run deployment
    if forge script script/DeploySweeper.s.sol:DeploySweeperScript \
        --rpc-url $network \
        --broadcast \
        --verify \
        -vvvv; then
        echo "✅ Successfully deployed to $network"
    else
        echo "❌ Failed to deploy to $network"
        echo "   (This might be due to network issues or insufficient funds)"
    fi
    
    echo ""
    sleep 2  # Brief pause between deployments
done

echo "🎉 Deployment process completed!"
echo "================================================"
echo ""
echo "📋 Next Steps:"
echo "1. Check deployment addresses in broadcast/ folder"
echo "2. Verify contracts on block explorers"  
echo "3. Fund paymaster wallet on each chain"
echo "4. Update frontend with contract addresses"
echo ""
echo "💡 To deploy to a single network:"
echo "   forge script script/DeploySweeper.s.sol:DeploySweeperScript --rpc-url <network> --broadcast --verify"