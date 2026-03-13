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
export async function getNgoByWallet(address) {
  const data = await fetchAPI(`/api/ngo/wallet/${address}`);
  return data
    ? { ...data, ngoId: data.ngoId ?? data.id, verified: data.verified ?? data.isVerified }
    : null;
}
export async function getNgoById(ngoId) {
  const data = await fetchAPI(`/api/ngo/id/${ngoId}`);
  return {
    ...data,
    ngoId: data.ngoId ?? data.id,
    verified: data.verified ?? data.isVerified,
    panNumber: data.panNumber ?? data.panCardNumber,
  };
}
export const getAdmin = () => fetchAPI('/api/ngo/admin');

// Campaigns
export const getCampaignsCount = () => fetchAPI('/api/campaigns/count');
export const getCampaignById = (campaignId) => fetchAPI(`/api/campaigns/${campaignId}`);
/** Returns array of campaign objects for an NGO. */
export async function getCampaignsByNgo(ngoId) {
  const data = await fetchAPI(`/api/campaigns/ngo/${ngoId}`);
  const campaignIds = data?.campaignIds;
  if (!Array.isArray(campaignIds) || campaignIds.length === 0) return [];
  const campaigns = await Promise.all(
    campaignIds.map((id) => fetchAPI(`/api/campaigns/${id}`))
  );
  return campaigns;
}

// Donations
export const createRazorpayOrder = (payload) =>
  fetchAPI('/api/donations/razorpay/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

/** Returns array of donation objects for a campaign. */
export async function getDonationsByCampaign(campaignId) {
  const data = await fetchAPI(`/api/donations/campaign/${campaignId}`);
  const donationIds = data?.donationIds;
  if (!Array.isArray(donationIds) || donationIds.length === 0) return [];
  const donations = await Promise.all(
    donationIds.map((id) => fetchAPI(`/api/donations/${id}`))
  );
  return donations.map((d) => ({
    ...d,
    transactionReference: d.transactionReference ?? d.transactionRef,
  }));
}
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
  createRazorpayOrder,
  getDonationsByCampaign,
  getDonationsByDonor,
};
