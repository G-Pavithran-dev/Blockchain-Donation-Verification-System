import { useState, useEffect } from 'react';
import { loadContractConfig } from '../lib/contracts';

/**
 * Hook to load and cache contract configuration
 */
export function useContractConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      try {
        setLoading(true);
        const contractConfig = await loadContractConfig();
        if (!cancelled) {
          setConfig(contractConfig);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.error('Failed to load contract config:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return { config, loading, error };
}
