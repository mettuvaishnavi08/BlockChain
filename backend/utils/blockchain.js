const { ethers } = require('ethers');
const InstitutionRegistryABI = require('../abi/InstitutionRegistry.json');
const CredentialRegistryABI = require('../abi/CredentialRegistry.json');

class BlockchainService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        this.institutionRegistryAddress = process.env.INSTITUTION_REGISTRY_ADDRESS;
        this.credentialRegistryAddress = process.env.CREDENTIAL_REGISTRY_ADDRESS;

        // Read-only contracts
        this.institutionRegistry = new ethers.Contract(
            this.institutionRegistryAddress,
            InstitutionRegistryABI,
            this.provider
        );

        this.credentialRegistry = new ethers.Contract(
            this.credentialRegistryAddress,
            CredentialRegistryABI,
            this.provider
        );
    }

    // Create contract instance with signer
    getContractWithSigner(privateKey, contractAddress, abi) {
        const wallet = new ethers.Wallet(privateKey, this.provider);
        return new ethers.Contract(contractAddress, abi, wallet);
    }

    // Issue credential on blockchain
    async issueCredential(institutionPrivateKey, credentialData) {
        try {
            const contract = this.getContractWithSigner(
                institutionPrivateKey,
                this.credentialRegistryAddress,
                CredentialRegistryABI
            );

            const tx = await contract.issueCredential(
                credentialData.studentAddress,
                credentialData.credentialType,
                credentialData.program,
                credentialData.grade,
                credentialData.ipfsHash,
                credentialData.expiryDate
            );

            const receipt = await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash,
                credentialId: receipt.events[0].args.credentialId,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Blockchain issue credential error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verify credential on blockchain
    async verifyCredential(credentialId) {
        try {
            const result = await this.credentialRegistry.verifyCredential(credentialId);

            return {
                isValid: result.isValid,
                student: result.student,
                institution: result.institution,
                credentialType: result.credentialType,
                program: result.program,
                grade: result.grade,
                issueDate: new Date(result.issueDate.toNumber() * 1000),
                expiryDate: new Date(result.expiryDate.toNumber() * 1000)
            };
        } catch (error) {
            console.error('Blockchain verify credential error:', error);
            throw error;
        }
    }

    // Check if institution is registered
    async isRegisteredInstitution(address) {
        try {
            return await this.institutionRegistry.isRegisteredInstitution(address);
        } catch (error) {
            console.error('Check institution registration error:', error);
            return false;
        }
    }

    // Get institution details
    async getInstitutionDetails(address) {
        try {
            const details = await this.institutionRegistry.getInstitution(address);
            return {
                name: details.name,
                website: details.website,
                isActive: details.isActive,
                registeredAt: new Date(details.registeredAt.toNumber() * 1000)
            };
        } catch (error) {
            console.error('Get institution details error:', error);
            return null;
        }
    }

    // Get student credentials
    async getStudentCredentials(studentAddress) {
        try {
            const credentialIds = await this.credentialRegistry.getStudentCredentials(studentAddress);
            return credentialIds;
        } catch (error) {
            console.error('Get student credentials error:', error);
            return [];
        }
    }
}

module.exports = new BlockchainService();