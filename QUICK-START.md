# CivicTrust - Quick Start Guide

This guide will help you get the complete CivicTrust application up and running in minutes.

## Prerequisites

- ✅ Node.js 18+ and npm installed
- ✅ MetaMask browser extension installed

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 2. Start Hardhat Local Node

Open a new terminal (Terminal 1):

```bash
cd Backend
npm run node
```

**Keep this terminal running!** This starts a local blockchain at http://127.0.0.1:8545

You should see a list of test accounts with private keys.

### 3. Deploy Smart Contracts

Open a new terminal (Terminal 2):

```bash
cd Backend
npm run deploy
```

This deploys the contracts to the local blockchain. You should see deployment addresses printed.

### 4. Start Backend API

Keep Terminal 2 open and run:

```bash
npm run api
```

**Keep this terminal running!** The API will be available at http://localhost:3001

### 5. Install Frontend Dependencies

Open a new terminal (Terminal 3):

```bash
cd Frontend/my-app
npm install
```

### 6. Start Frontend Application

In the same terminal (Terminal 3):

```bash
npm run dev
```

**Keep this terminal running!** The frontend will open at http://localhost:5173

### 7. Configure MetaMask

1. Open MetaMask
2. Add Hardhat Network:
   - Click network dropdown → "Add Network" → "Add a network manually"
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
   - Click "Save"

3. Import Admin Account:
   - Click your account icon → "Import Account"
   - Paste private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Click "Import"
   - This is Account #0 (the admin account)

4. Optional - Import Test Accounts:
   - Repeat above for other test accounts if needed
   - Account 1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Account 2: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

### 8. Connect Wallet to Application

1. Open http://localhost:5173 in your browser
2. Click "Connect Wallet" in the top right
3. Select "MetaMask"
4. Approve the connection
5. Make sure you're on the Hardhat Local network

## Testing the Application

### As Admin (Account #0)

1. Go to Dashboard - you should see "Admin Dashboard"
2. Navigate to Admin Panel
3. Wait for NGO registrations to verify them

### Register an NGO (Switch to Account 1 or 2)

1. Switch to a different account in MetaMask
2. Go to Dashboard
3. Click "Register Your NGO" or navigate to `/register-ngo`
4. Fill in:
   - **Organization Name:** Test NGO
   - **Registration Number:** REG123456
   - **PAN Number:** ABCDE1234F
5. Click "Register NGO"
6. Confirm transaction in MetaMask
7. Wait for confirmation

### Verify NGO (Switch back to Admin Account)

1. Switch back to Account #0 in MetaMask
2. Go to Admin Panel
3. Find the pending NGO registration
4. Click "Verify"
5. Confirm transaction in MetaMask

### Create a Campaign (Switch to NGO Account)

1. Switch to the verified NGO account
2. Go to Dashboard
3. Click "Create Campaign"
4. Fill in:
   - **Campaign Title:** Help Poor Children
   - **Description:** Support education for underprivileged children
   - **End Date:** Pick a future date
5. Click "Create Campaign"
6. Confirm transaction in MetaMask

### Make a Donation (Any Account)

1. Switch to any account with ETH
2. Browse to "Campaigns"
3. Click on a campaign
4. Click "Donate"
5. Enter:
   - **Amount:** 1000000000000000000 (1 ETH in Wei)
   - **Transaction Reference:** UPI-123456
6. Click "Record Donation"
7. Confirm transaction in MetaMask

## Common Commands

### Restart Everything

If you need to restart:

```bash
# Stop all terminals (Ctrl+C in each)

# Terminal 1: Start Hardhat Node
cd Backend
npm run node

# Terminal 2: Deploy & Start API
cd Backend
npm run deploy
npm run api

# Terminal 3: Start Frontend
cd Frontend/my-app
npm run dev
```

### Reset Blockchain

If you want a fresh start:

1. Stop the Hardhat node (Ctrl+C in Terminal 1)
2. Delete `Backend/deployments/localhost` folder
3. Start again from Step 2

## Ports Used

- **Hardhat Node:** http://127.0.0.1:8545
- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:5173

## Troubleshooting

### "Cannot connect to backend"
- Make sure Terminal 2 is running with the API
- Check http://localhost:3001/health in your browser

### "Deployments not loaded"
- Run `npm run deploy` in the Backend directory
- Check that `Backend/deployments/localhost/addresses.json` exists

### "Wrong network" in MetaMask
- Switch to "Hardhat Local" network
- Chain ID should be 31337

### Transaction fails
- Make sure you have ETH in your account
- Check you're connected to the correct network
- Verify you have the right permissions for the action

## Next Steps

- Browse NGOs at http://localhost:5173/ngos
- View campaigns at http://localhost:5173/campaigns
- Check your dashboard at http://localhost:5173/dashboard
- Admin panel at http://localhost:5173/admin

## Need Help?

Check the detailed README files:
- Frontend: `Frontend/my-app/README.md`
- Backend: `Backend/README-DEPLOY-API.md`

Enjoy using CivicTrust! 🎉
