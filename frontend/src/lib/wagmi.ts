// src/lib/wagmi.ts
// Wallet and chain configuration for TESTNETS (where contracts are deployed)
import { http, createConfig } from 'wagmi'
import { sepolia, baseSepolia, arbitrumSepolia, optimismSepolia, polygonAmoy } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect, injected } from 'wagmi/connectors'
import type { Chain } from 'wagmi/chains'

// Testnet chains where ZeroDust contracts are deployed
const supportedChains: readonly [Chain, ...Chain[]] = [
  sepolia, // Ethereum Sepolia
  baseSepolia, // Base Sepolia
  arbitrumSepolia, // Arbitrum Sepolia
  optimismSepolia, // Optimism Sepolia
  polygonAmoy, // Polygon Amoy (new testnet)
] as const

// Wallet connection setup
export const config = createConfig({
  chains: supportedChains,
  multiInjectedProviderDiscovery: false, // Disable auto-detection to prevent duplicates
  connectors: [
    // Only show wallet buttons if the actual wallets are detected
    ...(typeof window !== 'undefined' && (window as any).rabby ? [
      injected({
        target: () => ({
          id: 'rabby',
          name: 'Rabby Wallet',
          provider: (window as any).rabby,
        }),
      })
    ] : []),
    
    ...(typeof window !== 'undefined' && (window as any).keplr?.ethereum ? [
      injected({
        target: () => ({
          id: 'keplr',
          name: 'Keplr',
          provider: (window as any).keplr.ethereum,
        }),
      })
    ] : []),
    
    ...(typeof window !== 'undefined' && (window as any).backpack?.ethereum ? [
      injected({
        target: () => ({
          id: 'backpack',
          name: 'Backpack',
          provider: (window as any).backpack.ethereum,
        }),
      })
    ] : []),
    
    // Always show these standard options
    walletConnect({
      projectId: '3507ef7a713dfd781da48f858d04619d', // Replace with your actual Project ID
      metadata: {
        name: 'ZeroDust',
        description: 'Move leftover ETH from unused chains with sponsored gas',
        url: 'https://zerodust.xyz',
        icons: ['https://zerodust.xyz/logo.png'],
      },
    }),
    
    metaMask({
      dappMetadata: {
        name: 'ZeroDust',
        url: 'https://zerodust.xyz',
        iconUrl: 'https://zerodust.xyz/favicon.ico',
      },
    }),
    
    coinbaseWallet({
      appName: 'ZeroDust',
      appLogoUrl: 'https://zerodust.xyz/logo.png',
    }),
  ],
  
  // RPC endpoints for each testnet chain
  transports: {
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },
})

// Export testnet chain information for your UI
export const chainConfig = {
  chains: [
    {
      id: sepolia.id,
      name: 'Ethereum Sepolia',
      displayName: 'Ethereum Sepolia',
      gasLevel: 'low',
      avgFee: '$0.01',
      tier: 'testnet'
    },
    {
      id: baseSepolia.id,
      name: 'Base Sepolia',
      displayName: 'Base Sepolia',
      gasLevel: 'low',
      avgFee: '$0.001',
      tier: 'testnet'
    },
    {
      id: arbitrumSepolia.id,
      name: 'Arbitrum Sepolia',
      displayName: 'Arbitrum Sepolia',
      gasLevel: 'low',
      avgFee: '$0.001',
      tier: 'testnet'
    },
    {
      id: optimismSepolia.id,
      name: 'Optimism Sepolia',
      displayName: 'Optimism Sepolia',
      gasLevel: 'low',
      avgFee: '$0.001',
      tier: 'testnet'
    },
    {
      id: polygonAmoy.id,
      name: 'Polygon Amoy',
      displayName: 'Polygon Amoy',
      gasLevel: 'low',
      avgFee: '$0.001',
      tier: 'testnet'
    },
  ]
}

// Helper function to get chain info by ID
export function getChainInfo(chainId: number) {
  return chainConfig.chains.find(chain => chain.id === chainId)
}

// Helper function to check if chain is available (not too expensive)
export function isChainAvailable(chainId: number): boolean {
  const chainInfo = getChainInfo(chainId)
  return chainInfo ? true : false
}

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}