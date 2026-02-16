import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat, localhost } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from '@/components/ui/sonner';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { NgosPage } from './pages/NgosPage';
import { NgoDetailPage } from './pages/NgoDetailPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { DonatePage } from './pages/DonatePage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { RegisterNgoPage } from './pages/RegisterNgoPage';

// Configure wagmi
const config = getDefaultConfig({
  appName: 'CivicTrust',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [localhost, hardhat],
  transports: {
    [localhost.id]: http(),
    [hardhat.id]: http(),
  },
});

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/ngos" element={<NgosPage />} />
                  <Route path="/ngos/:ngoId" element={<NgoDetailPage />} />
                  <Route path="/campaigns" element={<CampaignsPage />} />
                  <Route path="/campaigns/:campaignId" element={<CampaignDetailPage />} />
                  <Route path="/donate/:campaignId" element={<DonatePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/register-ngo" element={<RegisterNgoPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
