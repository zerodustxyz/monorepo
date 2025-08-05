'use client'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            💸 ZeroDust
          </h1>
          <p className="text-xl text-gray-600">
            One-click crypto dust sweeping across all chains
          </p>
        </div>
        
        <div className="bg-black text-white p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-300 mb-4">
            ZeroDust is launching soon with support for 25+ EVM chains
          </p>
          <p className="text-sm text-gray-400">
            Smart contracts in development • Frontend ready
          </p>
        </div>
        
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl mb-2">🔷</div>
            <div className="text-sm font-semibold">Ethereum</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl mb-2">🔵</div>
            <div className="text-sm font-semibold">Base</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl mb-2">🔷</div>
            <div className="text-sm font-semibold">Arbitrum</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded">
            <div className="text-2xl mb-2">🟣</div>
            <div className="text-sm font-semibold">Polygon</div>
          </div>
        </div>
      </div>
    </div>
  )
}
