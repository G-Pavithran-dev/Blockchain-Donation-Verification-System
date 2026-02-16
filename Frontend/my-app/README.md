# CivicTrust Frontend

A modern React-based frontend for the CivicTrust blockchain donation verification system. Built with React, Vite, Tailwind CSS, shadcn/ui, and RainbowKit for wallet connectivity.

## Features

- 🔐 **Wallet Connect** - Connect with MetaMask and other Web3 wallets using RainbowKit
- 🏢 **NGO Management** - Browse verified NGOs and view their campaigns
- 📊 **Campaign Tracking** - View active campaigns with full transparency
- 💰 **Donation Recording** - Record donations on-chain with complete traceability
- 👥 **Role-Based Access** - Different dashboards for Donors, NGOs, and Admins
- ✅ **Admin Panel** - Verify and manage NGO registrations
- 🎨 **Modern UI** - Professional design with shadcn/ui components
- 📱 **Responsive** - Works on desktop and mobile devices

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui
- **Routing:** React Router v6
- **Wallet:** RainbowKit + wagmi + viem
- **State Management:** TanStack Query (React Query)

## Project Structure

```
Frontend/my-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Header, Footer, PageContainer
│   │   ├── shared/          # Reusable components (Cards, Badges, etc.)
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities (API, contracts, role management)
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx
│   │   ├── NgosPage.jsx
│   │   ├── NgoDetailPage.jsx
│   │   ├── CampaignsPage.jsx
│   │   ├── CampaignDetailPage.jsx
│   │   ├── DonatePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── RegisterNgoPage.jsx
│   ├── App.jsx              # Main app with routing and providers
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
├── package.json
├── vite.config.js
└── components.json          # shadcn/ui configuration
```

## Prerequisites

- Node.js 18+ and npm
- A running Hardhat node (Backend)
- Backend API running at `http://localhost:3001`
- MetaMask or another Web3 wallet extension

## Installation

1. **Install dependencies:**
   ```bash
   cd Frontend/my-app
   npm install
   ```

2. **Configure environment:**
   The `.env` file is already set up with:
   ```
   VITE_API_URL=http://localhost:3001
   ```

## Running the Application

### Complete Setup (Backend + Frontend)

**Terminal 1 - Start Hardhat Node:**
```bash
cd Backend
npm run node
```
This starts a local blockchain at http://127.0.0.1:8545

**Terminal 2 - Deploy Contracts:**
```bash
cd Backend
npm run deploy
```
This deploys the contracts and generates the config files.

**Terminal 3 - Start Backend API:**
```bash
cd Backend
npm run api
```
This starts the REST API at http://localhost:3001

**Terminal 4 - Start Frontend:**
```bash
cd Frontend/my-app
npm run dev
```
This starts the React app at http://localhost:5173

### Frontend Only

If the backend is already running:
```bash
cd Frontend/my-app
npm run dev
```

Open http://localhost:5173 in your browser.

## Connecting Your Wallet

1. Click "Connect Wallet" in the header
2. Select your wallet provider (MetaMask recommended)
3. Connect to the Hardhat network:
   - **Network Name:** Hardhat
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH

### Importing Hardhat Test Accounts

Hardhat provides test accounts with ETH. Import them into MetaMask:

**Admin Account (Account #0):**
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**Test Account 1:**
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Test Account 2:**
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

## User Roles

### Public (No Wallet)
- Browse verified NGOs
- View campaigns
- See donation history

### Donor (Connected Wallet)
- All public features
- Record donations to campaigns
- View donation dashboard

### NGO (Registered Wallet)
- All donor features
- Register NGO (pending verification)
- Create campaigns (after verification)
- Manage campaigns
- Deactivate campaigns

### Admin (Deployer Account)
- All features
- Verify/reject NGO registrations
- Transfer admin rights
- Access admin panel

## Key Features Usage

### Register as an NGO

1. Click "Go to Dashboard" and select "Register Your NGO"
2. Fill in:
   - Organization Name
   - Registration Number
   - PAN Number
3. Confirm transaction in wallet
4. Wait for admin verification

### Create a Campaign (NGO)

1. Go to Dashboard (must be verified NGO)
2. Click "Create Campaign"
3. Fill in:
   - Campaign Title
   - Description
   - End Date
4. Confirm transaction in wallet

### Record a Donation (Donor)

1. Browse to a campaign
2. Click "Donate"
3. Enter:
   - Amount (in Wei)
   - Transaction Reference (UPI/Bank ref)
4. Confirm transaction in wallet

### Verify NGO (Admin)

1. Go to Admin Panel
2. View pending registrations
3. Click "Verify" or "Reject"
4. Confirm transaction in wallet

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Troubleshooting

### "Cannot connect to backend"
- Ensure Backend API is running at http://localhost:3001
- Check `.env` has correct `VITE_API_URL`

### "Wrong network"
- Switch to Hardhat network in MetaMask
- Chain ID should be 31337

### "Transaction failed"
- Ensure you have ETH in your account
- Check you're using the correct role (e.g., only admin can verify NGOs)
- Verify the campaign is still active (for donations)

### "No deployments found"
- Run `npm run deploy` in Backend directory first
- Check `Backend/deployments/localhost/` has the deployment files

## API Integration

The frontend connects to the Backend API for:
- Contract configuration (`GET /api/config`)
- Reading NGO data (`GET /api/ngo/*`)
- Reading campaign data (`GET /api/campaigns/*`)
- Reading donation data (`GET /api/donations/*`)

User-initiated writes (register NGO, create campaign, record donation) are done directly on-chain via the connected wallet using wagmi and viem.

## License

MIT

## Support

For issues or questions, please check the Backend README or create an issue in the repository.

