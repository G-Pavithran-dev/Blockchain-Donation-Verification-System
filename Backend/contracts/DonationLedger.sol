// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*
 * Donation Ledger Contract
 * Purpose:
 *  - Record donation proofs
 *  - Link donations to campaigns
 *  - Store UPI / bank transaction reference
 *
 * Note:
 *  - No on-chain fund transfer
 *  - Only records transparency data
 */

interface ICampaignLedger {
    function isCampaignActive(uint256 _campaignId) external view returns (bool);
}

contract DonationLedger {

    ICampaignLedger public campaignLedger;
    uint256 public donationCounter;

    constructor(address _campaignLedgerAddress) {
        campaignLedger = ICampaignLedger(_campaignLedgerAddress);
        donationCounter = 0;
    }

    struct Donation {
        uint256 donationId;
        uint256 campaignId;
        address donor;
        uint256 amount;
        string transactionRef; // UPI / bank reference
        uint256 timestamp;
    }

    mapping(uint256 => Donation) private donations;
    mapping(uint256 => uint256[]) private campaignDonations;

    event DonationRecorded(
        uint256 indexed donationId,
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    /**
     * Record donation proof
     */
    function recordDonation(
        uint256 _campaignId,
        uint256 _amount,
        string calldata _transactionRef
    ) external {

        require(
            campaignLedger.isCampaignActive(_campaignId),
            "Campaign is not active"
        );

        donationCounter++;

        donations[donationCounter] = Donation({
            donationId: donationCounter,
            campaignId: _campaignId,
            donor: msg.sender,
            amount: _amount,
            transactionRef: _transactionRef,
            timestamp: block.timestamp
        });

        campaignDonations[_campaignId].push(donationCounter);

        emit DonationRecorded(
            donationCounter,
            _campaignId,
            msg.sender,
            _amount
        );
    }

    /**
     * View donation by ID
     */
    function getDonationById(uint256 _donationId)
        external
        view
        returns (
            uint256 donationId,
            uint256 campaignId,
            address donor,
            uint256 amount,
            string memory transactionRef,
            uint256 timestamp
        )
    {
        Donation memory d = donations[_donationId];
        return (
            d.donationId,
            d.campaignId,
            d.donor,
            d.amount,
            d.transactionRef,
            d.timestamp
        );
    }

    /**
     * Get donations for a campaign
     */
    function getDonationsByCampaign(uint256 _campaignId)
        external
        view
        returns (uint256[] memory)
    {
        return campaignDonations[_campaignId];
    }
}
