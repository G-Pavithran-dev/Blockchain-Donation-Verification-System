# CivicTrust Backend – Deploy & API

## Deployment (Account #0)

Deployment always uses **Account #0** (the first signer from your chain). With `npm run node`, that’s the first Hardhat test account. The deployer becomes the **admin** of VerificationLedger.

1. **Compile contracts**
   ```bash
   npm run compile
   ```

2. **Local chain (for dev with shadcn/ui)**
   - Terminal 1: `npm run node` (starts Hardhat node at `http://127.0.0.1:8545`)
   - Terminal 2: `npm run deploy` (deploys to localhost and writes to `deployments/localhost/` and `api/contracts/abis.json`)

3. **Ephemeral Hardhat network**
   ```bash
   npm run deploy:hardhat
   ```
   Uses in-process network; set `NETWORK=hardhat` when running the API if you need to point at this.

4. **Sepolia**
   ```bash
   # Set RPC_URL_SEPOLIA and PRIVATE_KEY in .env
   npm run deploy:sepolia
   ```
   Set `NETWORK=sepolia` and `RPC_URL` for the API.

## Node.js API

Serves REST endpoints that call the deployed contracts. Intended for use with a shadcn/ui frontend.

1. **Env**
   - Copy `.env.example` to `.env`.
   - `NETWORK` – must match the folder under `deployments/` (e.g. `localhost`, `hardhat`, `sepolia`).
   - `RPC_URL` – RPC for that network (default `http://127.0.0.1:8545`).
   - **`PRIVATE_KEY`** (admin) – verify/reject NGO, transfer admin (use Account #0 key as deployer). Optional: NGO_PRIVATE_KEY and DONOR_PRIVATE_KEY in .env for campaign/donor API writes. User-facing writes (register NGO, create campaign, record donation) should be done from the frontend with the user’s wallet using the config from `/api/config`.

2. **Run**
   ```bash
   npm install
   npm run api
   ```
   API runs at `http://localhost:3001` (or `PORT` from `.env`).

3. **Endpoints (for shadcn/ui)**

   - **`GET /api/config`** – Contract addresses and ABIs for the frontend. Use with ethers/viem and the user’s wallet to send:
     - `registerNGO`, `createCampaign`, `recordDonation`
   - **NGO:** `GET /api/ngo/count`, `/api/ngo/id/:id`, `/api/ngo/wallet/:address`, `/api/ngo/list` (admin), `POST /api/ngo/verify`, `POST /api/ngo/reject`
   - **Campaigns:** `GET /api/campaigns/count`, `/api/campaigns/:id`, `/api/campaigns/ngo/:ngoId`, `POST /api/campaigns/deactivate`
   - **Donations:** `GET /api/donations/count`, `/api/donations/:id`, `/api/donations/campaign/:campaignId`, `POST /api/donations/record`

## Frontend (shadcn/ui)

- Call `GET /api/config` once to get `contracts.VerificationLedger`, `contracts.CampaignLedger`, `contracts.DonationLedger` (each has `address` and `abi`).
- Use these with `ethers` or `viem` and the user’s wallet to build and sign transactions for `registerNGO`, `createCampaign`, and `recordDonation`.
- Use the other API routes for read-only data (e.g. NGO by id, campaign list, donations) to display in your UI.
