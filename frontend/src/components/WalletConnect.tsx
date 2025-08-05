// src/components/WalletConnect.tsx
// Clean black and white version
'use client'

import { useAccount, useConnect, useDisconnect } from './WalletProvider'
import { useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectors, setShowConnectors] = useState(false)

  // If wallet is already connected, show account info
  if (isConnected) {
    return (
      <div className="bg-white border-2 border-black rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-black">Connected</p>
            <p className="font-mono text-sm text-black">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 rounded border-2 border-black transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  // If wallet not connected, show connection options
  return (
    <div className="space-y-4">
      {!showConnectors ? (
        <button
          onClick={() => setShowConnectors(true)}
          className="w-full bg-black text-white font-semibold py-3 px-6 rounded-lg border-2 border-black hover:bg-gray-800 transition-colors"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Choose Wallet</h3>
            <button
              onClick={() => setShowConnectors(false)}
              className="text-black hover:text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>
          
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              className="w-full flex items-center justify-between p-4 border-2 border-black rounded-lg bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm">
                  {connector.name === 'MetaMask' && '🦊'}
                  {connector.name === 'Coinbase Wallet' && '🔵'}
                  {connector.name === 'WalletConnect' && '🔗'}
                  {connector.name === 'Rabby Wallet' && '🐰'}
                  {connector.name === 'Keplr' && '🌌'}
                  {connector.name === 'Backpack' && '🎒'}
                  {!['MetaMask', 'Coinbase Wallet', 'WalletConnect', 'Rabby Wallet', 'Keplr', 'Backpack'].includes(connector.name) && '💼'}
                </div>
                <span className="font-medium text-black">{connector.name}</span>
              </div>
            </button>
          ))}
          
          <p className="text-xs text-black text-center mt-4">
            WalletConnect supports Rabby, Rainbow, Uniswap, OKX, Trust, and 300+ more wallets
          </p>
        </div>
      )}
    </div>
  )
}