# MicroFund Smart Contract Deployment Guide

## Pre-Deployment Checklist

- [ ] Funded wallet with test ETH on target network
- [ ] `.env` file configured with correct RPC URLs and API keys
- [ ] Private key added to `.env` (never commit this!)
- [ ] Sufficient gas for deployment (~1-2M gas)

## Step-by-Step Deployment

### 1. Prepare Testnet ETH

**For Sepolia:**
- Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**For Polygon Amoy:**
- Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### 2. Verify Configuration

\`\`\`bash
# Check that hardhat.config.ts has correct networks
cat hardhat.config.ts
\`\`\`

### 3. Compile Contracts

\`\`\`bash
npm run compile
\`\`\`

### 4. Deploy to Sepolia

\`\`\`bash
npm run deploy:sepolia
\`\`\`

Expected output:
\`\`\`
Deploying MicroFund to sepolia...
Deploying contracts with account: 0x...
Account balance: X.X ETH
MicroFund contract deployed to: 0x...
Waiting for block confirmations...
Verifying contract on block explorer...
Contract verified successfully
\`\`\`

### 5. Save Deployment Address

After successful deployment, save the contract address from the output. You'll need it for frontend integration.

Example format for `.env` in the frontend:
\`\`\`
NEXT_PUBLIC_MICROFUND_CONTRACT_ADDRESS=0x...
\`\`\`

## Troubleshooting

### "Insufficient funds for gas"
- **Solution**: Get more test ETH from the faucet
- Ensure wallet address is correct

### "Invalid private key"
- **Solution**: Check `.env` file
- Private key should be without `0x` prefix or with it (both formats work)

### "Network error"
- **Solution**: Verify RPC URL in `.env`
- Test RPC with: `curl <RPC_URL>`

### "Verification failed"
- **Solution**: This is non-critical
- Contract is still deployed and usable
- Can verify manually later via block explorer

## Contract Interaction

### Get Contract Information

\`\`\`bash
# Using ethers CLI (install: npm install -g ethers)
ethers provider getNetwork

# Check deployed contract
ethers call 0x<CONTRACT_ADDRESS> users(0x<USER_ADDRESS>)
\`\`\`

### Manual Verification on Etherscan

If automatic verification fails:
1. Go to [Etherscan](https://etherscan.io/) (or Polygonscan for Polygon)
2. Find your contract address
3. Click "Verify and Publish"
4. Select "Solidity (Multi-file)"
5. Upload all contract files

## Next Steps

1. **Frontend Integration**: Update frontend with contract address
2. **Set Up Admin Functions**: 
   - Register initial users
   - Verify KYC for test users
3. **Test the Flow**:
   - Create test loans
   - Fund loans
   - Repay loans
4. **Monitor**: Watch transaction costs and adjust platform fees if needed

## Mainnet Deployment (Production)

Before mainnet deployment:
- [ ] Conduct full security audit
- [ ] Test extensively on testnet
- [ ] Review contract code for vulnerabilities
- [ ] Set appropriate platform fee percentage
- [ ] Document contract parameters

Mainnet deployment follows the same process but uses real funds and is irreversible.
