// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InstitutionRegistry is Ownable {
    struct Institution {
        string name;
        string website;
        address wallet;
        bool isActive;
        uint256 registeredAt;
    }
    
    mapping(address => Institution) public institutions;
    mapping(bytes32 => bool) public institutionExists;
    address[] public institutionAddresses;
    
    event InstitutionRegistered(address indexed institution, string name);
    event InstitutionDeactivated(address indexed institution);
    
    modifier onlyRegisteredInstitution() {
        require(institutions[msg.sender].isActive, "Not a registered institution");
        _;
    }
    
    constructor() {}
    
    function registerInstitution(
        address _wallet,
        string memory _name,
        string memory _website
    ) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet address");
        require(!institutions[_wallet].isActive, "Institution already registered");
        
        bytes32 institutionHash = keccak256(abi.encodePacked(_name, _website));
        require(!institutionExists[institutionHash], "Institution details already exist");
        
        institutions[_wallet] = Institution({
            name: _name,
            website: _website,
            wallet: _wallet,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        institutionExists[institutionHash] = true;
        institutionAddresses.push(_wallet);
        
        emit InstitutionRegistered(_wallet, _name);
    }
    
    function deactivateInstitution(address _wallet) external onlyOwner {
        require(institutions[_wallet].isActive, "Institution not active");
        institutions[_wallet].isActive = false;
        emit InstitutionDeactivated(_wallet);
    }
    
    function isRegisteredInstitution(address _wallet) external view returns (bool) {
        return institutions[_wallet].isActive;
    }
    
    function getInstitution(address _wallet) 
        external 
        view 
        returns (
            string memory name,
            string memory website,
            bool isActive,
            uint256 registeredAt
        ) 
    {
        Institution memory inst = institutions[_wallet];
        return (inst.name, inst.website, inst.isActive, inst.registeredAt);
    }
    
    function getAllInstitutions() external view returns (address[] memory) {
        return institutionAddresses;
    }
}