// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AccessControl {
    mapping(address => bool) public institutions;
    address public owner;
    
    event InstitutionRegistered(address indexed institution);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    function registerInstitution(address _institution) external onlyOwner {
        institutions[_institution] = true;
        emit InstitutionRegistered(_institution);
    }
    
    function isInstitution(address _address) external view returns (bool) {
        return institutions[_address];
    }
}