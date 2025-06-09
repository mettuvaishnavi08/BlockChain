// backend/src/config/blockchain.js
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

class BlockchainConfig {
  constructor() {
    this.web3 = null;
    this.contracts = {};
    this.accounts = [];
    this.networkId = null;
    this.gasPrice = null;
    this.gasLimit = null;
    this.isConnected = false;
  }

  // Initialize Web3 connection
  async initialize() {
    try {
      // Connect to blockchain network
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));

      // Test connection
      await this.testConnection();

      // Get network information
      this.networkId = await this.web3.eth.net.getId();
      this.gasPrice = await this.web3.eth.getGasPrice();
      this.gasLimit = process.env.DEFAULT_GAS_LIMIT || 6721975;

      // Get accounts
      this.accounts = await this.web3.eth.getAccounts();

      // Load smart contracts
      await this.loadContracts();

      this.isConnected = true;
      console.log(`✅ Blockchain connected to network ID: ${this.networkId}`);
      console.log(`📍 RPC URL: ${rpcUrl}`);
      console.log(`⛽ Gas Price: ${this.web3.utils.fromWei(this.gasPrice.toString(), 'gwei')} Gwei`);
      
      return true;
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  // Test blockchain connection
  async testConnection() {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      console.log(`🔗 Connected to blockchain. Latest block: ${blockNumber}`);
      return true;
    } catch (error) {
      throw new Error(`Failed to connect to blockchain: ${error.message}`);
    }
  }

  // Load smart contracts
  async loadContracts() {
    try {
      const contractsDir = path.join(__dirname, '../contracts');
      
      // Contract configurations
      const contractConfigs = [
        {
          name: 'AcademicCredential',
          address: process.env.ACADEMIC_CREDENTIAL_CONTRACT_ADDRESS,
          abiFile: 'AcademicCredential.json'
        },
        {
          name: 'InstitutionRegistry',
          address: process.env.INSTITUTION_REGISTRY_CONTRACT_ADDRESS,
          abiFile: 'InstitutionRegistry.json'
        },
        {
          name: 'CredentialVerification',
          address: process.env.CREDENTIAL_VERIFICATION_CONTRACT_ADDRESS,
          abiFile: 'CredentialVerification.json'
        },
        {
          name: 'DegreeCertificate',
          address: process.env.DEGREE_CERTIFICATE_CONTRACT_ADDRESS,
          abiFile: 'DegreeCertificate.json'
        },
        {
          name: 'AccessControl',
          address: process.env.ACCESS_CONTROL_CONTRACT_ADDRESS,
          abiFile: 'AccessControl.json'
        }
      ];

      for (const config of contractConfigs) {
        await this.loadContract(config, contractsDir);
      }

      console.log(`📋 Loaded ${Object.keys(this.contracts).length} smart contracts`);
    } catch (error) {
      console.error('❌ Failed to load contracts:', error.message);
      throw error;
    }
  }

  // Load individual contract
  async loadContract(config, contractsDir) {
    try {
      if (!config.address) {
        console.warn(`⚠️  No address provided for ${config.name} contract`);
        return;
      }

      // Load ABI
      const abiPath = path.join(contractsDir, config.abiFile);
      if (!fs.existsSync(abiPath)) {
        console.warn(`⚠️  ABI file not found for ${config.name}: ${abiPath}`);
        return;
      }

      const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      const abi = contractData.abi || contractData;

      // Create contract instance
      const contract = new this.web3.eth.Contract(abi, config.address);
      
      // Verify contract exists
      const code = await this.web3.eth.getCode(config.address);
      if (code === '0x') {
        throw new Error(`No contract found at address ${config.address}`);
      }

      this.contracts[config.name] = {
        instance: contract,
        address: config.address,
        abi: abi
      };

      console.log(`✅ Loaded ${config.name} at ${config.address}`);
    } catch (error) {
      console.error(`❌ Failed to load ${config.name}:`, error.message);
      throw error;
    }
  }

  // Get contract instance
  getContract(contractName) {
    if (!this.contracts[contractName]) {
      throw new Error(`Contract ${contractName} not found or not loaded`);
    }
    return this.contracts[contractName].instance;
  }

  // Get contract address
  getContractAddress(contractName) {
    if (!this.contracts[contractName]) {
      throw new Error(`Contract ${contractName} not found or not loaded`);
    }
    return this.contracts[contractName].address;
  }

  // Issue Academic Credential
  async issueCredential(credentialData, fromAddress, privateKey) {
    try {
      const contract = this.getContract('AcademicCredential');
      
      const txData = contract.methods.issueCredential(
        credentialData.recipientAddress,
        credentialData.institutionId,
        credentialData.credentialHash,
        credentialData.metadataURI,
        credentialData.credentialType,
        credentialData.issueDate,
        credentialData.expiryDate
      );

      const transaction = await this.sendTransaction(txData, fromAddress, privateKey);
      
      console.log(`✅ Credential issued: ${transaction.transactionHash}`);
      return transaction;
    } catch (error) {
      console.error('❌ Failed to issue credential:', error.message);
      throw error;
    }
  }

  // Verify Credential
  async verifyCredential(credentialId) {
    try {
      const contract = this.getContract('CredentialVerification');
      
      const result = await contract.methods.verifyCredential(credentialId).call();
      
      return {
        isValid: result.isValid,
        issuer: result.issuer,
        recipient: result.recipient,
        issueDate: result.issueDate,
        expiryDate: result.expiryDate,
        isRevoked: result.isRevoked,
        verificationHash: result.verificationHash
      };
    } catch (error) {
      console.error('❌ Failed to verify credential:', error.message);
      throw error;
    }
  }

  // Register Institution
  async registerInstitution(institutionData, fromAddress, privateKey) {
    try {
      const contract = this.getContract('InstitutionRegistry');
      
      const txData = contract.methods.registerInstitution(
        institutionData.name,
        institutionData.country,
        institutionData.accreditationBody,
        institutionData.institutionType,
        institutionData.metadataURI
      );

      const transaction = await this.sendTransaction(txData, fromAddress, privateKey);
      
      console.log(`✅ Institution registered: ${transaction.transactionHash}`);
      return transaction;
    } catch (error) {
      console.error('❌ Failed to register institution:', error.message);
      throw error;
    }
  }

  // Revoke Credential
  async revokeCredential(credentialId, reason, fromAddress, privateKey) {
    try {
      const contract = this.getContract('AcademicCredential');
      
      const txData = contract.methods.revokeCredential(credentialId, reason);
      const transaction = await this.sendTransaction(txData, fromAddress, privateKey);
      
      console.log(`✅ Credential revoked: ${transaction.transactionHash}`);
      return transaction;
    } catch (error) {
      console.error('❌ Failed to revoke credential:', error.message);
      throw error;
    }
  }

  // Send Transaction
  async sendTransaction(txData, fromAddress, privateKey) {
    try {
      const gas = await txData.estimateGas({ from: fromAddress });
      const gasPrice = await this.web3.eth.getGasPrice();
      
      const txObject = {
        from: fromAddress,
        to: txData._parent._address,
        data: txData.encodeABI(),
        gas: Math.floor(gas * 1.2), // Add 20% buffer
        gasPrice: gasPrice
      };

      if (privateKey) {
        const signedTx = await this.web3.eth.accounts.signTransaction(txObject, privateKey);
        return await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      } else {
        return await this.web3.eth.sendTransaction(txObject);
      }
    } catch (error) {
      console.error('❌ Transaction failed:', error.message);
      throw error;
    }
  }

  // Get Transaction Receipt
  async getTransactionReceipt(txHash) {
    try {
      return await this.web3.eth.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('❌ Failed to get transaction receipt:', error.message);
      throw error;
    }
  }

  // Get Block Information
  async getBlockInfo(blockNumber = 'latest') {
    try {
      return await this.web3.eth.getBlock(blockNumber);
    } catch (error) {
      console.error('❌ Failed to get block info:', error.message);
      throw error;
    }
  }

  // Get Account Balance
  async getBalance(address) {
    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('❌ Failed to get balance:', error.message);
      throw error;
    }
  }

  // Get Gas Estimate
  async estimateGas(txData, fromAddress) {
    try {
      return await txData.estimateGas({ from: fromAddress });
    } catch (error) {
      console.error('❌ Failed to estimate gas:', error.message);
      throw error;
    }
  }

  // Get Network Information
  getNetworkInfo() {
    return {
      networkId: this.networkId,
      gasPrice: this.gasPrice,
      gasLimit: this.gasLimit,
      isConnected: this.isConnected,
      accountsCount: this.accounts.length,
      contracts: Object.keys(this.contracts)
    };
  }

  // Event Listeners
  subscribeToEvents(contractName, eventName, callback, fromBlock = 'latest') {
    try {
      const contract = this.getContract(contractName);
      
      const subscription = contract.events[eventName]({
        fromBlock: fromBlock
      });

      subscription.on('data', callback);
      subscription.on('error', (error) => {
        console.error(`❌ Event subscription error for ${contractName}.${eventName}:`, error);
      });

      return subscription;
    } catch (error) {
      console.error('❌ Failed to subscribe to events:', error.message);
      throw error;
    }
  }

  // Get Past Events
  async getPastEvents(contractName, eventName, options = {}) {
    try {
      const contract = this.getContract(contractName);
      
      const defaultOptions = {
        fromBlock: 0,
        toBlock: 'latest'
      };

      const eventOptions = { ...defaultOptions, ...options };
      
      return await contract.getPastEvents(eventName, eventOptions);
    } catch (error) {
      console.error('❌ Failed to get past events:', error.message);
      throw error;
    }
  }

  // Utility Functions
  toWei(amount, unit = 'ether') {
    return this.web3.utils.toWei(amount.toString(), unit);
  }

  fromWei(amount, unit = 'ether') {
    return this.web3.utils.fromWei(amount.toString(), unit);
  }

  isValidAddress(address) {
    return this.web3.utils.isAddress(address);
  }

  generateAccount() {
    return this.web3.eth.accounts.create();
  }

  // Health Check
  async healthCheck() {
    try {
      const latestBlock = await this.web3.eth.getBlockNumber();
      const networkId = await this.web3.eth.net.getId();
      
      return {
        status: 'healthy',
        latestBlock: latestBlock,
        networkId: networkId,
        timestamp: new Date().toISOString(),
        contracts: Object.keys(this.contracts).length
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const blockchainConfig = new BlockchainConfig();

module.exports = {
  blockchain: blockchainConfig,
  Web3
};