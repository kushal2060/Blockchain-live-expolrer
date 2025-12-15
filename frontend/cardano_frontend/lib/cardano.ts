//configuring sabbai avilable cardano wallets

import { CardanoWallet,WalletInfo,WalletAPI,SignedData } from "@/types/wallet";

//extend window object to include cardano type safety ko lagi as typescript ko window ma cardano vanra hunna
declare global {
    interface Window {
        cardano?: {
            [key: string]: CardanoWallet
        };
    }
}

//cardano wallets haru
export const KNOWN_WALLETS: Record<string,WalletInfo> = {
   lace: {
    id: 'lace',
    name: 'Lace wallet',
    icon: 'https://lace.io/favicon-32x32.png',
    isInstalled: false,
    website: 'https://lace.io'
   },
    eternl: {
    id: 'eternl',
    name: 'Eternl',
    icon: 'https://eternl.io/favicon.ico',
    isInstalled: false,
    website: 'https://eternl.io',
  },
   yoroi: {
    id: 'yoroi',
    name: 'Yoroi',
    icon: 'https://yoroi-wallet.com/assets/images/yoroi-logo-shape-blue.png',
    isInstalled: false,
    website: 'https://yoroi-wallet.com',
  },
  typhon: {
    id: 'typhoncip30',  
    name: 'Typhon',
    icon: 'https://typhonwallet.io/assets/typhon.svg',
    isInstalled: false,
    website: 'https://typhonwallet.io',
  }

};
//connect to wallet
export const enableWallet = async (walletId: string): Promise<WalletAPI>=>{
    if(typeof window === 'undefined' || !window.cardano){
        throw new Error('Cardano wallets not available');
    }
    const wallet = window.cardano[walletId];

    if(!wallet){
        throw new Error(`Wallet ${walletId} not found`);
    }
    try {
        const api = await wallet.enable();
        return api;
    } catch (error) {
        console.error(`Failed to enable wallet ${walletId}:`, error);
        throw new Error(`Failed to enable wallet ${walletId}`);
    }
};

//if wallet is already enabled

export const isWalletEnabled = async (walletId: string): Promise<boolean>=>{
    if(typeof window === 'undefined' || !window.cardano){
        return false;
    }
    const wallet = window.cardano[walletId];

    if(!wallet){
        return false;
    }
    try {
        const enabled = await wallet.isEnabled();
        return enabled;
    } catch (error) {
        console.error(`Failed to check if wallet ${walletId} is enabled:`, error);
        return false;
    }   
}

//get wallet address innbech32 format
export const getWalletAddress = async (api: WalletAPI): Promise<string> => {
    const usedAddresses = await api.getUsedAddresses();

    if(usedAddresses.length === 0){
        const unusedAddresses = await api.getUnusedAddresses();
        if (unusedAddresses.length === 0){
            throw new Error('No addresses found in wallet');
        }
        return hexToAddress(unusedAddresses[0]);
    }
    return hexToAddress(usedAddresses[0]);
}
//convert hex address to bech32 address
export const hexToAddress = (hex: string): string => {
  // For simplicity, return hex as-is
  // In production, use @emurgo/cardano-serialization-lib-browser
  // to properly convert hex to bech32
  return hex;
};

export const getWalletBalance = async (api: WalletAPI): Promise<string> => {
    const balancehex = await api.getBalance();
    const balancelovelace = parseInt(balancehex,16);
    return (balancelovelace/1_000_000).toString(); //convert to ADA
}

//sign the message with wallet (CIP-8)

export const signMessage = async (
    api: WalletAPI,
    address: string,
    message: string
): Promise<SignedData> => {
    const messagehex = Buffer.from(message, 'utf8').toString('hex');
    try {
        const signedData = await api.signData(address, messagehex);
        return signedData;
    } catch (error:any){
        console.error('Failed to sign message:', error);
        throw new Error(`Failed to sign message: ${error?.message || error}`);
    }
};

//network id
export const getNetworkId = async (api: WalletAPI): Promise<number> =>{
    return await api.getNetworkId();
};

//check if wallet is on correct network
export const isCorrectNetwork = async (
  api: WalletAPI,
  expectedNetwork: 'mainnet' | 'testnet' = 'testnet'
): Promise<boolean> => {
  const networkId = await getNetworkId(api);
  const expectedId = expectedNetwork === 'mainnet' ? 1 : 0;
  return networkId === expectedId;
};

