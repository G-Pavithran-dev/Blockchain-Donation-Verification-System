// API client for Backend REST endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Config
export const getConfig = () => fetchAPI('/api/config');

// NGOs
export const getNgoList = () => fetchAPI('/api/ngo/list');
export const getNgoByWallet = (address) => fetchAPI(`/api/ngo/wallet/${address}`);
export const getNgoById = (ngoId) => fetchAPI(`/api/ngo/${ngoId}`);
export const getAdmin = () => fetchAPI('/api/ngo/admin');

// Campaigns
export const getCampaignsCount = () => fetchAPI('/api/campaigns/count');
export const getCampaignById = (campaignId) => fetchAPI(`/api/campaigns/${campaignId}`);
export const getCampaignsByNgo = (ngoId) => fetchAPI(`/api/campaigns/ngo/${ngoId}`);

// Donations
export const getDonationsByCampaign = (campaignId) => fetchAPI(`/api/donations/campaign/${campaignId}`);
export const getDonationsByDonor = (donorAddress) => fetchAPI(`/api/donations/donor/${donorAddress}`);

export default {
  getConfig,
  getNgoList,
  getNgoByWallet,
  getNgoById,
  getAdmin,
  getCampaignsCount,
  getCampaignById,
  getCampaignsByNgo,
  getDonationsByCampaign,
  getDonationsByDonor,
};
