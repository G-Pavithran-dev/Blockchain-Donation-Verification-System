import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getNgoByAddress } from '@/lib/role';

export function Header() {
  const { address, isConnected } = useAccount();
  const [ngo, setNgo] = useState(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setNgo(null);
      return;
    }
    let cancelled = false;
    getNgoByAddress(address).then((data) => {
      if (!cancelled && data?.ngoId) setNgo(data);
      else if (!cancelled) setNgo(null);
    });
    return () => { cancelled = true; };
  }, [address, isConnected]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">CivicTrust</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {ngo?.verified && (
              <>
                <Link to={`/ngos/${ngo.ngoId}`} className="transition-colors hover:text-primary">
                  My NGO
                </Link>
                <Link to="/dashboard" className="transition-colors hover:text-primary">
                  My Campaigns
                </Link>
              </>
            )}
            <Link to="/ngos" className="transition-colors hover:text-primary">
              NGOs
            </Link>
            <Link to="/campaigns" className="transition-colors hover:text-primary">
              Campaigns
            </Link>
            <Link to="/campaigns" className="transition-colors hover:text-primary font-medium text-primary">
              Donate
            </Link>
            <Link to="/register-ngo" className="transition-colors hover:text-primary">
              Register NGO
            </Link>
            <Link to="/dashboard" className="transition-colors hover:text-primary">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
