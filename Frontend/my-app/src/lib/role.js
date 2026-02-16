import { getAdmin, getNgoByWallet } from './api';

/**
 * Check if an address is the admin
 */
export async function isAdmin(address) {
  if (!address) return false;
  
  try {
    const adminData = await getAdmin();
    return adminData.admin?.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get NGO details for a wallet address
 */
export async function getNgoByAddress(address) {
  if (!address) return null;
  
  try {
    const ngo = await getNgoByWallet(address);
    return ngo;
  } catch (error) {
    // Not an NGO or error
    return null;
  }
}

/**
 * Determine user role based on address
 * Returns: 'admin' | 'ngo' | 'donor'
 */
export async function getUserRole(address) {
  if (!address) return 'donor';
  
  // Check admin first
  const admin = await isAdmin(address);
  if (admin) return 'admin';
  
  // Check if NGO
  const ngo = await getNgoByAddress(address);
  if (ngo && ngo.ngoId) return 'ngo';
  
  // Default to donor
  return 'donor';
}

export default {
  isAdmin,
  getNgoByAddress,
  getUserRole,
};
