// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./InstitutionRegistry.sol";

contract CredentialRegistry {
    InstitutionRegistry public institutionRegistry;
    
    struct Credential {
        bytes32 credentialId;
        address student;
        address institution;
        string credentialType;
        string program;
        string grade;
        string ipfsHash;
        uint256 issueDate;
        uint256 expiryDate;
        bool isRevoked;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bytes32[]) public studentCredentials;
    mapping(address => bytes32[]) public institutionCredentials;
    
    event CredentialIssued(
        bytes32 indexed credentialId,
        address indexed student,
        address indexed institution,
        string credentialType
    );
    
    event CredentialRevoked(bytes32 indexed credentialId);
    
    constructor(address _institutionRegistry) {
        institutionRegistry = InstitutionRegistry(_institutionRegistry);
    }
    
    modifier onlyRegisteredInstitution() {
        require(
            institutionRegistry.isRegisteredInstitution(msg.sender),
            "Not a registered institution"
        );
        _;
    }
    
    function issueCredential(
        address _student,
        string memory _credentialType,
        string memory _program,
        string memory _grade,
        string memory _ipfsHash,
        uint256 _expiryDate
    ) external onlyRegisteredInstitution returns (bytes32) {
        require(_student != address(0), "Invalid student address");
        require(bytes(_credentialType).length > 0, "Credential type required");
        require(_expiryDate > block.timestamp, "Invalid expiry date");
        
        bytes32 credentialId = keccak256(
            abi.encodePacked(
                _student,
                msg.sender,
                _credentialType,
                _program,
                block.timestamp,
                block.number
            )
        );
        
        require(credentials[credentialId].credentialId == bytes32(0), "Credential already exists");
        
        credentials[credentialId] = Credential({
            credentialId: credentialId,
            student: _student,
            institution: msg.sender,
            credentialType: _credentialType,
            program: _program,
            grade: _grade,
            ipfsHash: _ipfsHash,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            isRevoked: false
        });
        
        studentCredentials[_student].push(credentialId);
        institutionCredentials[msg.sender].push(credentialId);
        
        emit CredentialIssued(credentialId, _student, msg.sender, _credentialType);
        
        return credentialId;
    }
    
    function revokeCredential(bytes32 _credentialId) external {
        Credential storage credential = credentials[_credentialId];
        require(credential.institution == msg.sender, "Not authorized to revoke");
        require(!credential.isRevoked, "Credential already revoked");
        
        credential.isRevoked = true;
        emit CredentialRevoked(_credentialId);
    }
    
    function verifyCredential(bytes32 _credentialId) 
        external 
        view 
        returns (
            bool isValid,
            address student,
            address institution,
            string memory credentialType,
            string memory program,
            string memory grade,
            uint256 issueDate,
            uint256 expiryDate
        ) 
    {
        Credential memory credential = credentials[_credentialId];
        
        isValid = credential.credentialId != bytes32(0) && 
                 !credential.isRevoked && 
                 credential.expiryDate > block.timestamp &&
                 institutionRegistry.isRegisteredInstitution(credential.institution);
        
        return (
            isValid,
            credential.student,
            credential.institution,
            credential.credentialType,
            credential.program,
            credential.grade,
            credential.issueDate,
            credential.expiryDate
        );
    }
    
    function getStudentCredentials(address _student) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return studentCredentials[_student];
    }
    
    function getCredentialDetails(bytes32 _credentialId)
        external
        view
        returns (Credential memory)
    {
        return credentials[_credentialId];
    }
}