// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IVerificationLedger {
    function getNGOByWalletAddress(
        address _walletAddress
    )
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory registrationNumber,
            string memory panCardNumber,
            bool isVerified
        );
}

contract CampaignLedger {
    uint256 public campaignCounter;
    address public verificationLedger;

    constructor(address _verificationLedger) {
        verificationLedger = _verificationLedger;
    }

    struct Campaign {
        uint256 campaignId;
        uint256 ngoId;
        string title;
        string description;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        bool exists;
    }

    mapping(uint256 => Campaign) private campaigns;
    mapping(uint256 => uint256[]) private ngoToCampaigns;

    event CampaignCreated(
        uint256 indexed campaignId,
        uint256 indexed ngoId,
        string title
    );

    event CampaignStatusUpdated(uint256 indexed campaignId, bool isActive);

    modifier onlyVerifiedNGO() {
        (uint256 ngoId, , , , bool isVerified) = IVerificationLedger(
            verificationLedger
        ).getNGOByWalletAddress(msg.sender);

        require(isVerified, "NGO not verified");
        _;
    }

    modifier validCampaign(uint256 _campaignId) {
        require(campaigns[_campaignId].exists, "Campaign not found");
        _;
    }

    /* ========== CORE FUNCTIONS ========== */

    function createCampaign(
        string calldata _title,
        string calldata _description,
        uint256 _endDate
    ) external onlyVerifiedNGO returns (uint256) {
        uint256 _startDate = block.timestamp;
        
        // Input validation
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_title).length <= 256, "Title too long");
        require(bytes(_description).length > 0, "Description required");
        require(bytes(_description).length <= 2000, "Description too long");
        require(_endDate > _startDate, "End date must be after start date");
        require(
            _endDate <= _startDate + 365 days,
            "Campaign duration exceeds 1 year"
        );

        (uint256 ngoId, , , , ) = IVerificationLedger(verificationLedger)
            .getNGOByWalletAddress(msg.sender);

        campaignCounter++;

        campaigns[campaignCounter] = Campaign({
            campaignId: campaignCounter,
            ngoId: ngoId,
            title: _title,
            description: _description,
            startDate: _startDate,
            endDate: _endDate,
            isActive: true,
            exists: true
        });

        ngoToCampaigns[ngoId].push(campaignCounter);

        emit CampaignCreated(campaignCounter, ngoId, _title);
        return campaignCounter;
    }

    function deactivateCampaign(
        uint256 _campaignId
    ) external onlyVerifiedNGO validCampaign(_campaignId) {
        campaigns[_campaignId].isActive = false;
        emit CampaignStatusUpdated(_campaignId, false);
    }

    /* ========== VIEW FUNCTIONS ========== */

    function getCampaignById(
        uint256 _campaignId
    )
        external
        view
        validCampaign(_campaignId)
        returns (
            uint256 campaignId,
            uint256 ngoId,
            string memory title,
            string memory description,
            uint256 startDate,
            uint256 endDate,
            bool isActive
        )
    {
        Campaign memory c = campaigns[_campaignId];
        return (
            c.campaignId,
            c.ngoId,
            c.title,
            c.description,
            c.startDate,
            c.endDate,
            c.isActive
        );
    }

    function getCampaignIdsByNGO(
        uint256 _ngoId
    ) external view returns (uint256[] memory) {
        return ngoToCampaigns[_ngoId];
    }

    function isCampaignActive(uint256 _campaignId) external view returns (bool) {
        return campaigns[_campaignId].exists && campaigns[_campaignId].isActive;
    }
}
