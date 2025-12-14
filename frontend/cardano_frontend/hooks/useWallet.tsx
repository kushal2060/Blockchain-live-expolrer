import { useCallback, useEffect, useState } from "react";

export type WalletApi = {
  name: string;
  api: any; // raw CIP-30 API returned by enable()
  address?: string; // optional display address (string) if available
};

declare global {
  interface Window {
    cardano?: Record<string, any>;
  }
}

export function useWallets() {
  const [available, setAvailable] = useState<string[]>([]);
  const [connected, setConnected] = useState<WalletApi[]>([]);

  // detect wallets that inject window.cardano
  useEffect(() => {
    const adapters = window.cardano ? Object.keys(window.cardano) : [];
    setAvailable(adapters);
  }, []);

  const connect = useCallback(
    async (walletName: string) => {
      if (!window.cardano || !window.cardano[walletName]) {
        throw new Error(`${walletName} not available`);
      }

      // enable must be called in response to user gesture
      const provider = window.cardano[walletName];
      const api = await provider.enable(); // CIP-30

      // try to fetch a readable address or reward address (some wallets return CBOR/hex)
      let address: string | undefined;
      try {
        // common calls (may vary by wallet)
        const used = await api.getUsedAddresses?.();
        const change = await api.getChangeAddress?.();
        const reward = await api.getRewardAddresses?.();

        // prefer used addresses, then change, then reward
        const pick = (arr?: string[]) => (arr && arr.length ? arr[0] : undefined);
        address = pick(used) || pick(change) || pick(reward);
        // NOTE: address may be hex CBOR; you can decode with cardano-serialization-lib if needed
      } catch (e) {
        console.warn("Could not read addresses from wallet:", walletName, e);
      }

      // avoid duplicates
      setConnected((prev) => {
        if (prev.some((w) => w.name === walletName)) return prev;
        return [...prev, { name: walletName, api, address }];
      });
    },
    []
  );

  const disconnect = useCallback((walletName: string) => {
    setConnected((prev) => prev.filter((w) => w.name !== walletName));
    // many wallets don't expose a standard disable() — clearing local state is acceptable.
  }, []);

  return {
    available,
    connected,
    connect,
    disconnect,
  };
}