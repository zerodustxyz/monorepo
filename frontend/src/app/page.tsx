import { WalletConnect } from '@/components/WalletConnect'
import { MultiChainBalance } from '@/components/MultiChainBalance'

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold">ZeroDust</h1>
          <p className="text-gray-600">Sweep leftover ETH from unused chains</p>
        </header>
        
        <WalletConnect />
        
        <MultiChainBalance />
      </div>
    </main>
  )
}