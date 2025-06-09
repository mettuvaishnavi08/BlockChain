// // frontend/src/config/contracts.js
// import VerificationContract from '../artifacts/contracts/VerificationContract.sol/VerificationContract.json';
// import AccessControl from '../artifacts/contracts/AccessControl.sol/AccessControl.json';
// Import compiled contract ABIs from artifacts
// Note: Update these paths based on your actual artifact structure
import CredentialRegistryArtifact from "../artifacts/contracts/CredentialRegistry.sol/CredentialRegistry.json";
import InstitutionRegistryArtifact from '../artifacts/contracts/InstitutionRegistry.sol/InstitutionRegistry.json';
import VerificationContractArtifact from '../artifacts/contracts/Lock.sol/Lock.json';
import AccessControlArtifact from '../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json';

// Contract addresses - These will be set after deployment
// You can override these with environment variables
const CONTRACT_ADDRESSES = {
  // Hardhat local network (chainId: 31337)
  31337: {
    CREDENTIAL_REGISTRY: process.env.REACT_APP_CREDENTIAL_REGISTRY_ADDRESS_LOCAL || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    INSTITUTION_REGISTRY: process.env.REACT_APP_INSTITUTION_REGISTRY_ADDRESS_LOCAL || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    VERIFICATION_CONTRACT: process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS_LOCAL || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    ACCESS_CONTROL: process.env.REACT_APP_ACCESS_CONTROL_ADDRESS_LOCAL || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  },
  // Sepolia testnet (chainId: 11155111)
  11155111: {
    CREDENTIAL_REGISTRY: process.env.REACT_APP_CREDENTIAL_REGISTRY_ADDRESS_SEPOLIA || '',
    INSTITUTION_REGISTRY: process.env.REACT_APP_INSTITUTION_REGISTRY_ADDRESS_SEPOLIA || '',
    VERIFICATION_CONTRACT: process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS_SEPOLIA || '',
    ACCESS_CONTROL: process.env.REACT_APP_ACCESS_CONTROL_ADDRESS_SEPOLIA || ''
  },
  // Ethereum mainnet (chainId: 1)
  1: {
    CREDENTIAL_REGISTRY: process.env.REACT_APP_CREDENTIAL_REGISTRY_ADDRESS_MAINNET || '',
    INSTITUTION_REGISTRY: process.env.REACT_APP_INSTITUTION_REGISTRY_ADDRESS_MAINNET || '',
    VERIFICATION_CONTRACT: process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS_MAINNET || '',
    ACCESS_CONTROL: process.env.REACT_APP_ACCESS_CONTROL_ADDRESS_MAINNET || ''
  },
  // Polygon mainnet (chainId: 137)
  137: {
    CREDENTIAL_REGISTRY: process.env.REACT_APP_CREDENTIAL_REGISTRY_ADDRESS_POLYGON || '',
    INSTITUTION_REGISTRY: process.env.REACT_APP_INSTITUTION_REGISTRY_ADDRESS_POLYGON || '',
    VERIFICATION_CONTRACT: process.env.REACT_APP_VERIFICATION_CONTRACT_ADDRESS_POLYGON || '',
    ACCESS_CONTROL: process.env.REACT_APP_ACCESS_CONTROL_ADDRESS_POLYGON || ''
  }
};

// Contract configurations
export const CONTRACTS = {
  CREDENTIAL_REGISTRY: {
    name: 'CredentialRegistry',
    abi: CredentialRegistryArtifact.abi,
    bytecode: CredentialRegistryArtifact.bytecode,
    getAddress: (chainId) => CONTRACT_ADDRESSES[chainId]?.CREDENTIAL_REGISTRY,
    events: {
      CREDENTIAL_ISSUED: 'CredentialIssued',
      CREDENTIAL_REVOKED: 'CredentialRevoked',
      CREDENTIAL_VERIFIED: 'CredentialVerified'
    }
  },

  INSTITUTION_REGISTRY: {
    name: 'InstitutionRegistry',
    abi: InstitutionRegistryArtifact.abi,
    bytecode: InstitutionRegistryArtifact.bytecode,
    getAddress: (chainId) => CONTRACT_ADDRESSES[chainId]?.INSTITUTION_REGISTRY,
    events: {
      INSTITUTION_REGISTERED: 'InstitutionRegistered',
      INSTITUTION_VERIFIED: 'InstitutionVerified',
      INSTITUTION_SUSPENDED: 'InstitutionSuspended'
    }
  },

  VERIFICATION_CONTRACT: {
    name: 'VerificationContract',
    abi: VerificationContractArtifact.abi,
    bytecode: VerificationContractArtifact.bytecode,
    getAddress: (chainId) => CONTRACT_ADDRESSES[chainId]?.VERIFICATION_CONTRACT,
    events: {
      VERIFICATION_REQUESTED: 'VerificationRequested',
      VERIFICATION_COMPLETED: 'VerificationCompleted',
      VERIFICATION_FAILED: 'VerificationFailed'
    }
  },

  ACCESS_CONTROL: {
    name: 'AccessControl',
    abi: AccessControlArtifact.abi,
    bytecode: AccessControlArtifact.bytecode,
    getAddress: (chainId) => CONTRACT_ADDRESSES[chainId]?.ACCESS_CONTROL,
    events: {
      ROLE_GRANTED: 'RoleGranted',
      ROLE_REVOKED: 'RoleRevoked',
      ROLE_ADMIN_CHANGED: 'RoleAdminChanged'
    }
  }
};

// Helper function to get contract configuration
export const getContractConfig = (contractName, chainId) => {
  const contract = CONTRACTS[contractName];
  if (!contract) {
    throw new Error(`Contract ${contractName} not found`);
  }

  const address = contract.getAddress(chainId);
  if (!address) {
    throw new Error(`Contract ${contractName} not deployed on chain ${chainId}`);
  }

  return {
    ...contract,
    address
  };
};

// Helper function to get all contract addresses for a specific chain
export const getContractAddresses = (chainId) => {
  return CONTRACT_ADDRESSES[chainId] || {};
};

// Contract interaction gas limits
export const GAS_LIMITS = {
  ISSUE_CREDENTIAL: 200000,
  VERIFY_CREDENTIAL: 100000,
  REVOKE_CREDENTIAL: 150000,
  REGISTER_INSTITUTION: 250000,
  VERIFY_INSTITUTION: 100000,
  GRANT_ROLE: 100000,
  REVOKE_ROLE: 100000
};

// Common contract errors
export const CONTRACT_ERRORS = {
  USER_REJECTED: 'User rejected the transaction',
  INSUFFICIENT_FUNDS: 'Insufficient funds for gas',
  NETWORK_ERROR: 'Network error occurred',
  CONTRACT_NOT_DEPLOYED: 'Contract not deployed on this network',
  INVALID_ADDRESS: 'Invalid contract address',
  TRANSACTION_FAILED: 'Transaction failed',
  UNAUTHORIZED: 'Unauthorized access',
  CREDENTIAL_EXISTS: 'Credential already exists',
  CREDENTIAL_NOT_FOUND: 'Credential not found',
  INSTITUTION_NOT_VERIFIED: 'Institution not verified'
};

// Export default for easier importing
export default {
  CONTRACTS,
  getContractConfig,
  getContractAddresses,
  GAS_LIMITS,
  CONTRACT_ERRORS
};