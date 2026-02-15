// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
 * Verification Ledger Contract
 * Purpose:
 *  - Register NGOs
 *  - Verify NGOs (admin only)
 *  - Maintain immutable NGO identity records
 *
 * This contract DOES NOT handle donations or campaigns.
 */

contract VerificationLedger {
    address public admin;
    uint256 public ngoCounter;

    constructor() {
        admin = msg.sender;
        ngoCounter = 0;
    }

    struct NGO {
        uint256 ngoId;
        string name;
        string registrationNumber;
        string panCardNumber;
        address walletAddress;
        bool isVerified;
        bool exists;
    }

    mapping(uint256 => NGO) private ngos;
    mapping(address => uint256) private walletToNgoId;
    mapping(string => uint256) private regNumToNgoId;
    mapping(string => uint256) private panNumToNgoId;

    /**
     * Events and Modifiers
    */

    event NGORegistered(uint256 indexed ngoId, string name, string registrationNumber, address walletAddress);
    event NGOVerified(uint256 indexed ngoId);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier validNGO(uint256 _ngoId) {
        require(_ngoId > 0 && _ngoId <= ngoCounter, "Invalid NGO ID");
        _;
    }

    /** 
     * Admin Functionalities :
     * Verify NGOs
     * Transfer admin role
    */

    function listOfNGOs()
    external
    view
    onlyAdmin
    returns (NGO[] memory)
{
    NGO[] memory list = new NGO[](ngoCounter);

    for (uint256 i = 0; i < ngoCounter; i++) {
        list[i] = ngos[i + 1]; // NGO IDs start from 1
    }

    return list;
}


    function verifyNGO(uint256 _ngoId) external onlyAdmin validNGO(_ngoId) {
        ngos[_ngoId].isVerified = true;
        emit NGOVerified(_ngoId);
    }
    
    function rejectNGO(uint256 _ngoId) external onlyAdmin validNGO(_ngoId) {
        delete regNumToNgoId[ngos[_ngoId].registrationNumber];
        delete panNumToNgoId[ngos[_ngoId].panCardNumber];
        delete walletToNgoId[ngos[_ngoId].walletAddress];
        delete ngos[_ngoId];
    }

    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "New admin cannot be zero address");
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    /** 
     * NGO Functionalities
     * Register NGO
    */

   function registerNGO(
        string calldata _name,
        string calldata _registrationNumber,
        string calldata _panCardNumber
   ) external {
        require(walletToNgoId[msg.sender] == 0, "Wallet already registered");
        require(regNumToNgoId[_registrationNumber] == 0, "Registration number already registered");
        require(panNumToNgoId[_panCardNumber] == 0, "PAN card number already registered");

        ngoCounter++;
        ngos[ngoCounter] = NGO({
            ngoId: ngoCounter,
            name: _name,
            registrationNumber: _registrationNumber,
            panCardNumber: _panCardNumber,
            walletAddress: msg.sender,
            isVerified: false,
            exists: true
        });

        walletToNgoId[msg.sender] = ngoCounter;
        regNumToNgoId[_registrationNumber] = ngoCounter;
        panNumToNgoId[_panCardNumber] = ngoCounter;

        emit NGORegistered(ngoCounter, _name, _registrationNumber, msg.sender);
    }

    /** 
     * View Functionalities
     * Get NGO details by
     *     - ID
     *     - Wallet Address
     *     - Registration Number
     *     - PAN Card Number
    */
    
    function getNGOById(uint256 _ngoId) external view validNGO(_ngoId) returns (uint256 id, string memory name, string memory registrationNumber, string memory panCardNumber, bool isVerified) {
        require(ngos[_ngoId].exists, "NGO not found");
        NGO memory ngo = ngos[_ngoId];
        return (ngo.ngoId, ngo.name, ngo.registrationNumber, ngo.panCardNumber, ngo.isVerified);
    }

    function getNGOByRegistrationNumber(string calldata _registrationNumber) external view returns (uint256 id, string memory name, string memory registrationNumber, string memory panCardNumber,  bool isVerified) {
        uint256 ngoId = regNumToNgoId[_registrationNumber];
        require(ngos[ngoId].exists, "NGO not found");
        NGO memory ngo = ngos[ngoId];
        return (ngo.ngoId, ngo.name, ngo.registrationNumber, ngo.panCardNumber, ngo.isVerified);
    }

    function getNGOByWalletAddress(address _walletAddress) external view returns (uint256 id, string memory name, string memory registrationNumber, string memory panCardNumber, bool isVerified) {
        uint256 ngoId = walletToNgoId[_walletAddress];
        require(ngos[ngoId].exists, "NGO not found");
        NGO memory ngo = ngos[ngoId];
        return (ngo.ngoId, ngo.name, ngo.registrationNumber, ngo.panCardNumber, ngo.isVerified);
    }

    function getNGOByPanCardNumber(string calldata _panCardNumber) external view returns (uint256 id, string memory name, string memory registrationNumber, string memory panCardNumber, bool isVerified) {
        uint256 ngoId = panNumToNgoId[_panCardNumber];
        require(ngos[ngoId].exists, "NGO not found");
        NGO memory ngo = ngos[ngoId];
        return (ngo.ngoId, ngo.name, ngo.registrationNumber, ngo.panCardNumber, ngo.isVerified);
    }
}