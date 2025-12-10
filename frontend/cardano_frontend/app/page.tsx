import BlockList from '@/components/BlockList';
import TransactionList from '@/components/TransactionList';
import Stats from '@/components/Stats';

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Cardano PreProd Explorer
          </h1>
          <p className="text-gray-600 text-lg">
            Live blockchain data from Cardano PreProd Testnet
          </p>
        </header>

        <Stats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <BlockList />
          <TransactionList />
        </div>
      </div>
    </main>
  );
}