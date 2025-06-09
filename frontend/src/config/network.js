// frontend/src/config/networks.js

// Supported blockchain networks configuration
export const NETWORKS = {
  // Hardhat Local Development Network
  31337: {
    chainId: '0x7A69', // 31337 in hex
    chainName: 'Hardhat Local',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: ['http://localhost:8545'], // No block explorer for local
    isTestnet: true,
    isLocal: true,
    networkType: 'development'
  },

  // Ethereum Sepolia Testnet
  11155111: {
    chainId: '0xAA36A7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SEP',
      decimals: 18
    },
    rpcUrls: [
      'https://sepolia.infura.io/v3/' + process.env.REACT_APP_INFURA_PROJECT_ID,
      'https://eth-sepolia.g.alchemy.com/v2/' + process.env.REACT_APP_ALCHEMY_API_KEY,
      'https://sepolia.gateway.tenderly.co',
      'https://rpc.sepolia.org'
    ],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    isTestnet: true,
    isLocal: false,
    networkType: 'testnet',
    faucetUrls: [
      'https://sepoliafaucet.com/',
      'https://faucet.sepolia.dev/'
    ]
  },

  // Ethereum Mainnet
  1: {
    chainId: '0x1', // 1 in hex
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: [
      'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_PROJECT_ID,
      'https://eth-mainnet.g.alchemy.com/v2/' + process.env.REACT_APP_ALCHEMY_API_KEY,
      'https://cloudflare-eth.com',
      'https://ethereum.publicnode.com'
    ],
    blockExplorerUrls: ['https://etherscan.io'],
    isTestnet: false,
    isLocal: false,
    networkType: 'mainnet'
  },

  // Polygon Mainnet
  137: {
    chainId: '0x89', // 137 in hex
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://polygon-mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_PROJECT_ID,
      'https://polygon-mainnet.g.alchemy.com/v2/' + process.env.REACT_APP_ALCHEMY_API_KEY,
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.network'
    ],
    blockExplorerUrls: ['https://polygonscan.com'],
    isTestnet: false,
    isLocal: false,
    networkType: 'mainnet'
  },

  // Polygon Mumbai Testnet
  80001: {
    chainId: '0x13881', // 80001 in hex
    chainName: 'Polygon Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: [
      'https://polygon-mumbai.infura.io/v3/' + process.env.REACT_APP_INFURA_PROJECT_ID,
      'https://polygon-mumbai.g.alchemy.com/v2/' + process.env.REACT_APP_ALCHEMY_API_KEY,
      'https://rpc-mumbai.maticvigil.com',
      'https://matic-mumbai.chainstacklabs.com'
    ],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    isTestnet: true,
    isLocal: false,
    networkType: 'testnet',
    faucetUrls: [
      'https://faucet.polygon.technology/',
      'https://mumbaifaucet.com/'
    ]
  },

  // Binance Smart Chain Mainnet
  56: {
    chainId: '0x38', // 56 in hex
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org'
    ],
    blockExplorerUrls: ['https://bscscan.com'],
    isTestnet: false,
    isLocal: false,
    networkType: 'mainnet'
  }
};

// Default network configuration
export const DEFAULT_NETWORK = process.env.NODE_ENV === 'development' ? 31337 : 11155111;

// Supported networks list
export const SUPPORTED_NETWORKS = Object.keys(NETWORKS).map(Number);

// Network utility functions
export const getNetworkConfig = (chainId) => {
  const networkId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  return NETWORKS[networkId];
};

export const isNetworkSupported = (chainId) => {
  const networkId = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  return SUPPORTED_NETWORKS.includes(networkId);
};

export const getNetworkName = (chainId) => {
  const network = getNetworkConfig(chainId);
  return network ? network.chainName : 'Unknown Network';
};

export const isTestnetNetwork = (chainId) => {
  const network = getNetworkConfig(chainId);
  return network ? network.isTestnet : false;
};

export const isLocalNetwork = (chainId) => {
  const network = getNetworkConfig(chainId);
  return network ? network.isLocal : false;
};

export const getBlockExplorerUrl = (chainId, txHash = null, address = null) => {
  const network = getNetworkConfig(chainId);
  if (!network || !network.blockExplorerUrls[0]) return null;

  const baseUrl = network.blockExplorerUrls[0];
  
  if (txHash) {
    return `${baseUrl}/tx/${txHash}`;
  } else if (address) {
    return `${baseUrl}/address/${address}`;
  }
  
  return baseUrl;
};

export const getRpcUrl = (chainId) => {
  const network = getNetworkConfig(chainId);
  return network ? network.rpcUrls[0] : null;
};

export const getFaucetUrls = (chainId) => {
  const network = getNetworkConfig(chainId);
  return network ? network.faucetUrls || [] : [];
};

// Network switching function for MetaMask
export const switchNetwork = async (chainId) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const network = getNetworkConfig(chainId);
  if (!network) {
    throw new Error(`Network ${chainId} is not supported`);
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: network.chainId }],
    });
  } catch (switchError) {
    // If the network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [network],
        });
      } catch (addError) {
        throw new Error(`Failed to add network: ${addError.message}`);
      }
    } else {
      throw new Error(`Failed to switch network: ${switchError.message}`);
    }
  }
};

// Get current network from window.ethereum
export const getCurrentNetwork = async () => {
  if (!window.ethereum) return null;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return getNetworkConfig(chainId);
  } catch (error) {
    console.error('Failed to get current network:', error);
    return null;
  }
};

// Network status checker
export const checkNetworkStatus = async (chainId) => {
  const network = getNetworkConfig(chainId);
  if (!network) return { isConnected: false, error: 'Network not supported' };

  try {
    const response = await fetch(network.rpcUrls[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    });
    
    const data = await response.json();
    return {
      isConnected: !!data.result,
      blockNumber: data.result ? parseInt(data.result, 16) : null,
      error: null
    };
  } catch (error) {
    return {
      isConnected: false,
      error: error.message
    };
  }
};

// Export default configuration
export default {
  NETWORKS,
  DEFAULT_NETWORK,
  SUPPORTED_NETWORKS,
  getNetworkConfig,
  isNetworkSupported,
  getNetworkName,
  isTestnetNetwork,
  isLocalNetwork,
  getBlockExplorerUrl,
  getRpcUrl,
  getFaucetUrls,
  switchNetwork,
  getCurrentNetwork,
  checkNetworkStatus
};