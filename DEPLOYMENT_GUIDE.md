# Finality Oracle - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option A: One-Click Deploy (Easiest)

1. **Push to GitHub:**
   ```bash
   # Initialize git repository (if not already done)
   git init
   git add .
   git commit -m "Initial commit: Finality Oracle frontend"
   
   # Create GitHub repository and push
   # Visit: https://github.com/new
   # Follow GitHub instructions to push your code
   ```

2. **Deploy with Vercel:**
   - Visit: https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Vercel will auto-detect React settings
   - Click "Deploy"

### Option B: Direct Upload

1. **Visit Vercel Dashboard:**
   - Go to: https://vercel.com/dashboard
   - Click "Add New Project"
   - Select "Upload Folder"
   - Upload the entire `frontend` folder

### Option C: Vercel CLI (Current Terminal)

The Vercel CLI is currently waiting for you to select a login method.
Choose your preferred authentication method and follow the prompts.

## 📋 Environment Variables

After deployment, add these in Vercel Dashboard > Settings > Environment Variables:

```
REACT_APP_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_NETWORK_NAME=Hardhat Local
REACT_APP_CHAIN_ID=31337
REACT_APP_RPC_URL=http://127.0.0.1:8545
```

**Note:** For production with real networks, update these values:
```
REACT_APP_CONTRACT_ADDRESS=<your-mainnet-contract>
REACT_APP_NETWORK_NAME=Ethereum Mainnet  
REACT_APP_CHAIN_ID=1
REACT_APP_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
```

## 🌐 After Deployment

Your Finality Oracle will be available at:
`https://your-project-name.vercel.app`

### Features Available:
- ✅ Oracle management dashboard
- ✅ Finality proof submission
- ✅ Transaction verification
- ✅ MetaMask integration
- ✅ Real-time monitoring

### Network Configuration

Users will need to:
1. Install MetaMask
2. Add Hardhat network: `http://127.0.0.1:8545` (Chain ID: 31337)
3. Import test accounts from your local Hardhat node

## 🔧 Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 📊 Production Checklist

- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Test MetaMask connection
- [ ] Verify contract interactions
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)