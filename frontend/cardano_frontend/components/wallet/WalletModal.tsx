'use client';

import { useWallet } from '@/context/WalletContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function WalletModal({ isOpen, onClose }: Props) {
  const { availableWallets, connectWallet, isConnecting, error } = useWallet();

  if (!isOpen) return null;

  const handleConnect = async (walletId: string) => {
    try {
      await connectWallet(walletId);
      onClose();
    } catch (err) {
      // Error is handled in context
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {availableWallets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No Cardano wallets detected
              </p>
              <p className="text-sm text-gray-400">
                Please install Nami, Eternl, or another CIP-30 compatible wallet
              </p>
            </div>
          ) : (
            availableWallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                disabled={isConnecting}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                {wallet.icon && (
                  <img src={wallet.icon} alt="" className="w-10 h-10" />
                )}
                <div className="text-left flex-1">
                  <div className="font-semibold">{wallet.name}</div>
                  <div className="text-sm text-gray-500">
                    {wallet.isInstalled ? 'Installed' : 'Not installed'}
                  </div>
                </div>
                {isConnecting && <div className="animate-spin">⏳</div>}
              </button>
            ))
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By connecting, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}