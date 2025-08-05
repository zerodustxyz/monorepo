// src/lib/wagmi.ts
// Simplified wallet and chain configuration with auto-detected wallets first
import { http, createConfig } from 'wagmi'
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect, injected } from 'wagmi/connectors'
import type { Chain } from 'wagmi/chains'

// Start with the most popular and well-supported chains
const supportedChains: readonly [Chain, ...Chain[]] = [
  mainnet, // Ethereum
  base, // Base (Coinbase's L2)
  arbitrum, // Arbitrum One
  optimism, // Optimism
  polygon, // Polygon
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
  
  // RPC endpoints for each chain
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
})

// Export chain information for your UI
export const chainConfig = {
  chains: [
    {
      id: mainnet.id,
      name: 'Ethereum',
      displayName: 'Ethereum',
      gasLevel: 'high',
      avgFee: '$5.00',
      tier: 'premium'
    },
    {
      id: base.id,
      name: 'Base',
      displayName: 'Base',
      gasLevel: 'low',
      avgFee: '$0.02',
      tier: 'launch'
    },
    {
      id: arbitrum.id,
      name: 'Arbitrum One',
      displayName: 'Arbitrum',
      gasLevel: 'low',
      avgFee: '$0.03',
      tier: 'launch'
    },
    {
      id: optimism.id,
      name: 'Optimism',
      displayName: 'Optimism',
      gasLevel: 'low',
      avgFee: '$0.02',
      tier: 'launch'
    },
    {
      id: polygon.id,
      name: 'Polygon',
      displayName: 'Polygon',
      gasLevel: 'low',
      avgFee: '$0.01',
      tier: 'launch'
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