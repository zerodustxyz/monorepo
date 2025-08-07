// Contract addresses for ZeroDust Sweeper
// All chains use the same address: 0xdEa1412DcA2F300C4043009391ab39697450d74E

export const SWEEPER_CONTRACT_ADDRESS = "0xdEa1412DcA2F300C4043009391ab39697450d74E" as const;

export const PAYMASTER_ADDRESS = "0xD846063CFc26628A63bdDb4A9198B612F652F3fb" as const;

// Chain configurations for deployed contracts (TESTNET CHAIN IDs)
export const DEPLOYED_CHAINS = {
  // Ethereum Sepolia
  11155111: {
    chainId: 11155111,
    name: "Ethereum Sepolia", 
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia.etherscan.io",
    isDeployed: true
  },
  
  // Base Sepolia
  84532: {
    chainId: 84532,
    name: "Base Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS, 
    blockExplorer: "https://sepolia.basescan.org",
    isDeployed: true
  },
  
  // Arbitrum Sepolia
  421614: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia.arbiscan.io", 
    isDeployed: true
  },
  
  // Optimism Sepolia
  11155420: {
    chainId: 11155420,
    name: "Optimism Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    isDeployed: true
  },
  
  // Polygon Amoy
  80002: {
    chainId: 80002,
    name: "Polygon Amoy", 
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://amoy.polygonscan.com",
    isDeployed: true
  },
  
  // Avalanche Fuji
  43114: {
    chainId: 43114,
    name: "Avalanche Fuji",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://testnet.snowtrace.io",
    isDeployed: true
  },
  
  // BSC Testnet 
  56: {
    chainId: 56,
    name: "BSC Testnet",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://testnet.bscscan.com", 
    isDeployed: true
  },
  
  // Blast Sepolia
  81457: {
    chainId: 81457,
    name: "Blast Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia.blastscan.io",
    isDeployed: true
  },
  
  // Ink Sepolia
  57073: {
    chainId: 57073,
    name: "Ink Sepolia", 
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://explorer-sepolia.inkonchain.com",
    isDeployed: true
  },
  
  // Mode Sepolia
  34443: {
    chainId: 34443,
    name: "Mode Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia.explorer.mode.network",
    isDeployed: true
  },
  
  // Scroll Sepolia
  534352: {
    chainId: 534352, 
    name: "Scroll Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia.scrollscan.com",
    isDeployed: true
  },
  
  // Unichain Sepolia
  1301: {
    chainId: 1301,
    name: "Unichain Sepolia",
    contractAddress: SWEEPER_CONTRACT_ADDRESS,
    blockExplorer: "https://sepolia.uniscan.xyz", 
    isDeployed: true
  }
} as const;

// Helper function to check if chain has deployed contract
export function isChainSupported(chainId: number): boolean {
  return chainId in DEPLOYED_CHAINS;
}

// Helper function to get contract address for chain
export function getContractAddress(chainId: number): string | null {
  const chain = DEPLOYED_CHAINS[chainId as keyof typeof DEPLOYED_CHAINS];
  return chain?.contractAddress || null;
}

// Helper function to get block explorer URL
export function getBlockExplorerUrl(chainId: number, address: string): string | null {
  const chain = DEPLOYED_CHAINS[chainId as keyof typeof DEPLOYED_CHAINS];
  if (!chain) return null;
  return `${chain.blockExplorer}/address/${address}`;
}