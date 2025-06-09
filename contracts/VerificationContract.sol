// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VerificationContract {
    struct Credential {
        string studentName;
        string courseName;
        uint256 issueDate;
        address institution;
        bool isValid;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bool) public authorizedInstitutions;
    
    event CredentialIssued(bytes32 indexed credentialId, address indexed institution, string studentName);
    
    function issueCredential(
        bytes32 _credentialId,
        string memory _studentName,
        string memory _courseName
    ) external {
        require(authorizedInstitutions[msg.sender], "Not authorized institution");
        
        credentials[_credentialId] = Credential({
            studentName: _studentName,
            courseName: _courseName,
            issueDate: block.timestamp,
            institution: msg.sender,
            isValid: true
        });
        
        emit CredentialIssued(_credentialId, msg.sender, _studentName);
    }
    
    function verifyCredential(bytes32 _credentialId) external view returns (bool) {
        return credentials[_credentialId].isValid;
    }
    
    function authorizeInstitution(address _institution) external {
        authorizedInstitutions[_institution] = true;
    }
}