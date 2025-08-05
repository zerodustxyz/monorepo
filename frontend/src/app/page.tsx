// src/app/page.tsx
import { MultiChainBalance } from '@/components/MultiChainBalance'
import { WalletConnect } from '@/components/WalletConnect'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ZeroDust Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-2">ZeroDust</h1>
          <p className="text-black">
            Move leftover ETH from unused chains with sponsored gas
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="border-2 border-black rounded-lg p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Connect Your Wallet</h2>
          <WalletConnect />
        </div>

        {/* Multi-Chain Balance */}
<div className="border-2 border-black rounded-lg p-6">
<MultiChainBalance />
</div>

        {/* Simple Info */}
        <div className="text-center text-sm text-black">
          <p>Supports: Ethereum • Base • Arbitrum • Optimism • Polygon</p>
        </div>
      </div>
    </div>
  )
}