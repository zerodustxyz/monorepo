import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { SWEEPER_ABI } from '@/lib/sweeper-abi'
import { getContractAddress } from '@/lib/contracts'

// Hook for reading contract data
export function useSweeperContract(chainId?: number) {
  const contractAddress = chainId ? getContractAddress(chainId) : null
  
  return {
    contractAddress,
    abi: SWEEPER_ABI
  }
}

// Hook for calculating fees
export function useCalculateFee(chainId: number, estimatedGasCost: bigint, ethPriceUSD: bigint) {
  const { contractAddress } = useSweeperContract(chainId)
  
  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: SWEEPER_ABI,
    functionName: 'calculateFee',
    args: [estimatedGasCost, ethPriceUSD],
    query: {
      enabled: !!contractAddress && estimatedGasCost > 0n && ethPriceUSD > 0n
    }
  })
}

// Hook for getting paymaster balance
export function usePaymasterBalance(chainId: number) {
  const { contractAddress } = useSweeperContract(chainId)
  
  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: SWEEPER_ABI,
    functionName: 'getPaymasterBalance',
    query: {
      enabled: !!contractAddress
    }
  })
}

// Hook for getting contract balance
export function useContractBalance(chainId: number) {
  const { contractAddress } = useSweeperContract(chainId)
  
  return useReadContract({
    address: contractAddress as `0x${string}`,
    abi: SWEEPER_ABI, 
    functionName: 'getBalance',
    query: {
      enabled: !!contractAddress
    }
  })
}

// Hook for sweep and bridge transaction
export function useSweepAndBridge() {
  const { writeContract, ...rest } = useWriteContract()
  
  const sweepAndBridge = async ({
    chainId,
    destinationChainId, 
    amount,
    estimatedGasCost,
    ethPriceUSD,
    bungeeCalldata
  }: {
    chainId: number
    destinationChainId: number
    amount: string
    estimatedGasCost: bigint
    ethPriceUSD: bigint
    bungeeCalldata: `0x${string}`
  }) => {
    const contractAddress = getContractAddress(chainId)
    
    if (!contractAddress) {
      throw new Error(`Contract not deployed on chain ${chainId}`)
    }
    
    return writeContract({
      address: contractAddress as `0x${string}`,
      abi: SWEEPER_ABI,
      functionName: 'sweepAndBridge',
      args: [
        BigInt(destinationChainId),
        estimatedGasCost,
        ethPriceUSD, 
        bungeeCalldata
      ],
      value: parseEther(amount)
    })
  }
  
  return {
    sweepAndBridge,
    ...rest
  }
}

// Helper function to format ETH prices for contract (8 decimals)
export function formatEthPrice(priceUSD: number): bigint {
  return BigInt(Math.round(priceUSD * 100000000)) // 8 decimal places
}

// Helper function to format gas cost
export function formatGasCost(gasCostEth: number): bigint {
  return parseEther(gasCostEth.toString())
}

// Hook for getting Bungee quote and calldata
export async function getBungeeQuote({
  userAddress,
  sourceChainId,
  destinationChainId,
  amount
}: {
  userAddress: string
  sourceChainId: number
  destinationChainId: number
  amount: string
}) {
  const apiKey = process.env.NEXT_PUBLIC_BUNGEE_API_KEY
  const endpoint = process.env.NEXT_PUBLIC_BUNGEE_ENDPOINT
  
  if (!apiKey || !endpoint) {
    throw new Error('Bungee API configuration missing')
  }
  
  const amountWei = parseEther(amount).toString()
  
  const queryParams = new URLSearchParams({
    userAddress,
    originChainId: sourceChainId.toString(),
    destinationChainId: destinationChainId.toString(),
    inputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH
    outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH
    inputAmount: amountWei,
    receiverAddress: userAddress
  })
  
  const response = await fetch(`${endpoint}/api/v1/bungee/quote?${queryParams}`, {
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Bungee API error: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(`Bungee quote error: ${data.message || 'Unknown error'}`)
  }
  
  return data.result
}