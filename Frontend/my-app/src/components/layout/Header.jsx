import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">CivicTrust</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/ngos" className="transition-colors hover:text-primary">
              NGOs
            </Link>
            <Link to="/campaigns" className="transition-colors hover:text-primary">
              Campaigns
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
