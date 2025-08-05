// src/components/MultiChainBalance.tsx
// ZeroDust - One source → One destination sweep with Bungee integration
'use client'

import { useAccount, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'
import { formatEther } from 'viem'

// Chain configurations - All Bungee/Socket supported networks (as of 2025-03-21)
const SUPPORTED_CHAINS = [
  // Tier 1 - Major EVM Chains
  { id: 1, name: 'Ethereum', symbol: 'ETH', emoji: '🔷', tier: 1 },
  { id: 8453, name: 'Base', symbol: 'ETH', emoji: '🔵', tier: 1 },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', emoji: '🔷', tier: 1 },
  { id: 10, name: 'Optimism', symbol: 'ETH', emoji: '🔴', tier: 1 },
  { id: 137, name: 'Polygon', symbol: 'MATIC', emoji: '🟣', tier: 1 },
  
  // Tier 2 - Popular L2s and Alt-L1s
  { id: 56, name: 'Binance Smart Chain', symbol: 'BNB', emoji: '🟡', tier: 2 },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX', emoji: '🔺', tier: 2 },
  { id: 250, name: 'Fantom', symbol: 'FTM', emoji: '👻', tier: 2 }, // Limited support - being sunsetted
  { id: 100, name: 'Gnosis', symbol: 'xDAI', emoji: '🍯', tier: 2 },
  { id: 324, name: 'zkSync Era', symbol: 'ETH', emoji: '⚡', tier: 2 },
  
  // Tier 3 - New and Emerging Networks
  { id: 59144, name: 'Linea', symbol: 'ETH', emoji: '📏', tier: 3 },
  { id: 81457, name: 'Blast', symbol: 'ETH', emoji: '💥', tier: 3 },
  { id: 534352, name: 'Scroll', symbol: 'ETH', emoji: '📜', tier: 3 },
  { id: 5000, name: 'Mantle', symbol: 'MNT', emoji: '🧥', tier: 3 },
  { id: 34443, name: 'Mode', symbol: 'ETH', emoji: '🌙', tier: 3 },
  { id: 1101, name: 'Polygon zkEVM', symbol: 'ETH', emoji: '🔷', tier: 3 },
  { id: 1313161554, name: 'Aurora', symbol: 'ETH', emoji: '🌅', tier: 3 }, // Limited support - being sunsetted
  
  // Latest Additions (2024-2025)
  { id: 57073, name: 'Ink', symbol: 'ETH', emoji: '🖋️', tier: 3 },
  { id: 1301, name: 'Unichain', symbol: 'ETH', emoji: '🦄', tier: 3 },
  { id: 1946, name: 'Soneium', symbol: 'ETH', emoji: '🎵', tier: 3 },
  { id: 146, name: 'Sonic', symbol: 'S', emoji: '💫', tier: 3 },
  { id: 8333, name: 'B3', symbol: 'ETH', emoji: '🅱️', tier: 3 },
  { id: 80084, name: 'Berachain', symbol: 'BERA', emoji: '🐻', tier: 3 },
]

// Helper function: Get the current price for a cryptocurrency
function getTokenPrice(symbol: string, prices: any) {
  switch (symbol) {
    case 'ETH':
      return prices.ethereum?.usd || prices.ethereum || 0
    case 'MATIC':
      return prices['matic-network']?.usd || prices['matic-network'] || 0
    case 'BNB':
      return prices.binancecoin?.usd || prices.binancecoin || 0
    case 'AVAX':
      return prices.avalanche?.usd || prices.avalanche || 0
    case 'FTM':
      return prices.fantom?.usd || prices.fantom || 0
    case 'xDAI':
      return 1 // xDAI is pegged to $1
    case 'MNT':
      return prices.mantle?.usd || prices.mantle || 0
    case 'S':
      return prices.sonic?.usd || prices.sonic || 0.10 // Fallback for new tokens
    case 'BERA':
      return prices.berachain?.usd || prices.berachain || 1.00 // Fallback for testnet tokens
    default:
      return 0
  }
}

// Helper function: Calculate ZeroDust fees (FIXED VERSION)
function calculateZeroDustFee(amount: number, actualGasCost: number) {
  const baseFee = 0.05 // Always $0.05 base fee
  const gasWithBuffer = actualGasCost * 1.20 // Add 20% buffer to gas cost
  
  const totalFee = baseFee + gasWithBuffer
  
  return {
    baseFee,
    actualGasCost,
    gasBuffer: gasWithBuffer,  // ← FIXED: Now matches what the UI expects
    totalFee,
    userReceives: amount - totalFee,
    feePercentage: (totalFee / amount) * 100
  }
}

// Helper function: Get quote from Bungee (cross-chain bridge)
async function getBungeeQuote(params: {
  userAddress: string
  originChainId: number
  destinationChainId: number
  inputAmount: string
}) {
  try {
    // Build the API request URL
    const queryParams = new URLSearchParams({
      userAddress: params.userAddress,
      originChainId: params.originChainId.toString(),
      destinationChainId: params.destinationChainId.toString(),
      inputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Native token (ETH, MATIC, etc.)
      outputToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Native token on destination
      inputAmount: params.inputAmount,
      receiverAddress: params.userAddress
      // Note: No extra fees added - clean quotes for users
    })

    // Call Bungee API
    const response = await fetch(`https://public-backend.bungee.exchange/api/v1/bungee/quote?${queryParams}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Bungee quote error: ${data.message}`)
    }
    
    return data.result
  } catch (error) {
    console.error('Failed to get Bungee quote:', error)
    return null
  }
}

// Component: Display balance for a single blockchain
function ChainBalance({ chain, address, isSelected, onClick, prices }: {
  chain: any;
  address: `0x${string}` | undefined;
  isSelected: boolean;
  onClick: () => void;
  prices: any;
}) {
  // Get the balance for this specific chain
  const { data: balance, isLoading } = useBalance({
    address: address,
    chainId: chain.id,
  })

  // Convert balance from wei to readable format (like 0.005 ETH)
  const balanceInEther = balance ? formatEther(balance.value) : '0'
  const balanceFloat = parseFloat(balanceInEther)
  
  // Format balance for display (clean up very small amounts)
  const displayBalance = balanceFloat === 0 
    ? '0.0' 
    : balanceFloat < 0.0001 
    ? '<0.0001' 
    : balanceFloat.toFixed(6).replace(/\.?0+$/, '')

  // Calculate USD value using real-time prices
  const tokenPrice = getTokenPrice(chain.symbol, prices)
  const usdValue = balanceFloat * tokenPrice

  return (
    <div 
      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-black bg-gray-100' 
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
      onClick={onClick}
    >
      {/* Left side: Chain info */}
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{chain.emoji}</div>
        <div>
          <h3 className="font-semibold text-black">{chain.name}</h3>
          <span className="text-sm text-gray-600">{chain.symbol}</span>
        </div>
      </div>
      
      {/* Right side: Balance info */}
      <div className="text-right">
        {isLoading ? (
          <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <>
            <div className="font-mono font-semibold text-black">
              {displayBalance} {chain.symbol}
            </div>
            {balanceFloat > 0 && (
              <div className="text-xs text-gray-600">
                ≈ ${usdValue.toFixed(2)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Main Component: The complete ZeroDust interface
export function MultiChainBalance() {
  const { address, isConnected } = useAccount()
  
  // State: Which chains the user has selected
  const [sourceChainId, setSourceChainId] = useState<number | null>(null)
  const [destinationChainId, setDestinationChainId] = useState<number | null>(null)
  
  // State: Real-time cryptocurrency prices
  const [prices, setPrices] = useState<any>({})
  const [totalValue, setTotalValue] = useState(0)
  
  // State: Bridge quote information
  const [bungeeQuote, setBungeeQuote] = useState<any>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)

  // Get selected chain objects
  const sourceChain = SUPPORTED_CHAINS.find(c => c.id === sourceChainId)
  const destinationChain = SUPPORTED_CHAINS.find(c => c.id === destinationChainId)
  
  // Get balance for the selected source chain
  const sourceBalance = useBalance({ 
    address: address, 
    chainId: sourceChain?.id ?? 1, // Default to Ethereum if no source selected
    query: {
      enabled: isConnected && !!address && !!sourceChain // Only fetch when everything is ready
    }
  })

  // Calculate the amount available to sweep
  const sourceAmount = sourceBalance?.data && sourceChain && isConnected 
    ? parseFloat(formatEther(sourceBalance.data.value)) 
    : 0

  // Effect: Fetch real-time cryptocurrency prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // Fetch prices for all supported tokens
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,binancecoin,avalanche-2,fantom,mantle,moonbeam,moonriver,celo&vs_currencies=usd'
        )
        const data = await response.json()
        setPrices(data)
      } catch (error) {
        console.error('Failed to fetch prices:', error)
        // Use backup prices if the API fails
        setPrices({
          'ethereum': { usd: 3500 },
          'matic-network': { usd: 0.20 },
          'binancecoin': { usd: 600 },
          'avalanche-2': { usd: 40 },
          'fantom': { usd: 0.30 },
          'mantle': { usd: 0.50 },
          'moonbeam': { usd: 0.25 },
          'moonriver': { usd: 15 },
          'celo': { usd: 0.60 },
        })
      }
    }

    fetchPrices()
    // Update prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [])

  // Effect: Calculate total portfolio value (will be real when smart contracts are ready)
  useEffect(() => {
    if (!isConnected || Object.keys(prices).length === 0) return
    
    // TODO: Replace with real multi-chain balance calculation
    // For now, showing minimal amounts to avoid confusion
    setTotalValue(0)
  }, [isConnected, prices])

  // Effect: Get bridge quote when both chains are selected
  useEffect(() => {
    const getQuote = async () => {
      // Only get quote if we have all required information
      if (!sourceChain || !destinationChain || !address || !sourceAmount || sourceAmount <= 0 || !isConnected) {
        setBungeeQuote(null)
        return
      }

      setQuoteLoading(true)
      try {
        const quote = await getBungeeQuote({
          userAddress: address,
          originChainId: sourceChain.id,
          destinationChainId: destinationChain.id,
          inputAmount: (sourceAmount * 1e18).toString() // Convert to wei (blockchain format)
        })
        setBungeeQuote(quote)
      } catch (error) {
        console.error('Quote error:', error)
        setBungeeQuote(null)
      }
      setQuoteLoading(false)
    }

    getQuote()
  }, [sourceChain, destinationChain, address, sourceAmount, isConnected])

  // Calculate fees for the selected sweep
  const actualGasCost = 0.05 // Mock gas cost - in real app, get from Bungee quote
  const feeCalculation = sourceAmount > 0 && sourceChain && isConnected 
    ? calculateZeroDustFee(
        sourceAmount * getTokenPrice(sourceChain.symbol, prices), // Amount in USD
        actualGasCost
      ) 
    : null

  // Check if we can perform the sweep
  const canSweep = sourceChain && 
                   destinationChain && 
                   sourceChain.id !== destinationChain.id && 
                   sourceAmount > 0 && 
                   bungeeQuote && 
                   isConnected

  // Show connection prompt if wallet not connected
  if (!isConnected) {
    return (
      <div className="text-center p-8 border-2 border-black rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600">Connect your wallet to view balances and start sweeping</p>
      </div>
    )
  }

  // Handle the actual sweep transaction
  const handleSweep = async () => {
    if (!canSweep || !bungeeQuote || !feeCalculation) return
    
    try {
      // TODO: Replace with real smart contract integration
      // This is where you'll call your ZeroDust smart contracts
      
      // For now, show detailed breakdown
      alert(`
🚀 ZeroDust Sweep Preview:

📊 Transaction Details:
• From: ${sourceChain.name} (${sourceAmount.toFixed(6)} ${sourceChain.symbol})
• To: ${destinationChain.name}
• USD Amount: $${(sourceAmount * getTokenPrice(sourceChain.symbol, prices)).toFixed(2)}

💰 ZeroDust Fee Breakdown:
• Base Fee: $${feeCalculation.baseFee.toFixed(2)}
• Gas Cost: $${feeCalculation.actualGasCost.toFixed(2)}
• Gas Buffer (20%): $${feeCalculation.gasBuffer.toFixed(3)}
• Total Fee: $${feeCalculation.totalFee.toFixed(2)} (${feeCalculation.feePercentage.toFixed(1)}%)

✅ You'll Receive: $${feeCalculation.userReceives.toFixed(2)}

🔄 Powered by Bungee Protocol

Note: This is a preview. Smart contracts not yet deployed.
      `)
    } catch (error) {
      console.error('Sweep error:', error)
      alert('Failed to execute sweep. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Header */}
      <div className="bg-black text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Your Multi-Chain Portfolio</h2>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-mono">${totalValue > 0 ? totalValue.toFixed(2) : '---'}</span>
          <span className="text-gray-400">Total across all chains</span>
        </div>
      </div>

      {/* Step 1: Choose Source Chain */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">From</h3>
        <div className="space-y-2">
          {SUPPORTED_CHAINS.map((chain) => (
            <ChainBalance
              key={`source-${chain.id}`}
              chain={chain}
              address={address}
              isSelected={sourceChainId === chain.id}
              onClick={() => setSourceChainId(chain.id)}
              prices={prices}
            />
          ))}
        </div>
      </div>

      {/* Step 2: Choose Destination Chain */}
      {sourceChainId && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">To</h3>
          <div className="space-y-2">
            {SUPPORTED_CHAINS
              .filter(chain => chain.id !== sourceChainId) // Can't send to same chain
              .map((chain) => (
                <ChainBalance
                  key={`dest-${chain.id}`}
                  chain={chain}
                  address={address}
                  isSelected={destinationChainId === chain.id}
                  onClick={() => setDestinationChainId(chain.id)}
                  prices={prices}
                />
              ))}
          </div>
        </div>
      )}

      {/* Step 3: Fee Calculation & Preview */}
      {sourceChain && destinationChain && (
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
          <h3 className="text-lg font-semibold mb-4">💰 Preview</h3>
          
          {quoteLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="text-gray-600 mt-2">Getting best route from Bungee...</p>
            </div>
          ) : feeCalculation ? (
            <div className="space-y-3">
              {/* Transaction Summary */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">From:</span>
                <span className="font-semibold">{sourceChain.emoji} {sourceChain.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">To:</span>
                <span className="font-semibold">{destinationChain.emoji} {destinationChain.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount:</span>
                <span className="font-mono font-semibold">
                  {sourceAmount.toFixed(6)} {sourceChain.symbol}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">USD Value:</span>
                <span className="font-semibold">≈ ${(sourceAmount * getTokenPrice(sourceChain.symbol, prices)).toFixed(2)}</span>
              </div>
              
              <hr className="border-gray-300" />
              
              {/* Fee Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Fee:</span>
                  <span>${feeCalculation.baseFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gas Cost (×1.20):</span>
                  <span>${feeCalculation.gasBuffer.toFixed(3)}</span>
                </div>
                
                <div className="flex justify-between items-center font-semibold border-t pt-2">
                  <span>Total Fee:</span>
                  <span>${feeCalculation.totalFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-lg font-bold text-green-600">
                  <span>You'll Receive:</span>
                  <span>{(feeCalculation.userReceives / getTokenPrice(sourceChain.symbol, prices)).toFixed(6)} {destinationChain.symbol} (${feeCalculation.userReceives.toFixed(2)})</span>
                </div>
              </div>
              
              {/* Bridge Provider Info */}
              {bungeeQuote && (
                <div className="bg-purple-50 p-3 rounded text-center text-sm">
                  <span className="text-purple-600 font-semibold">🔄 Route: Powered by Bungee Protocol</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Unable to calculate fees. Please check your selection.
            </div>
          )}
        </div>
      )}

      {/* Step 4: Execute Sweep */}
      {canSweep && feeCalculation && (
        <button
          onClick={handleSweep}
          disabled={quoteLoading}
          className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {quoteLoading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Getting Quote...
            </span>
          ) : (
            `💸 Sweep ${(feeCalculation.userReceives / getTokenPrice(sourceChain.symbol, prices)).toFixed(6)} ${sourceChain.symbol} from ${sourceChain.name} to ${destinationChain.name}`
          )}
        </button>
      )}

      {/* Help Information */}
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 How ZeroDust works:</p>
        <p>
          Select a source chain and a destination chain, and we will transfer the total amount. 
          Our smart contract handles gas costs so that you can transfer the full amount and no longer worry about leaving dust on the chain.
        </p>
        <p className="mt-2 text-xs text-blue-600">
          <strong>Fee structure:</strong> $0.05 base fee + gas cost × 1.20 buffer
        </p>
        <p className="mt-1 text-xs text-blue-600">
          <strong>Status:</strong> Frontend ready, smart contracts coming soon!
        </p>
        <p className="mt-1 text-xs text-blue-600">
          <strong>Supported:</strong> {SUPPORTED_CHAINS.length} chains via Bungee Protocol
        </p>
      </div>
    </div>
  )
}