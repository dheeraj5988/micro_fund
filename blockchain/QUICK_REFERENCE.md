# MicroFund Blockchain - Quick Reference

## Essential Commands

### Installation & Setup
```bash
cd blockchain
npm install
cp .env.example .env
# Edit .env with your values
```

### Compilation & Testing
```bash
npm run compile          # Compile contracts
npm run test            # Run all tests
npm run test test/MicroFund.test.ts  # Run specific test
```

### Local Development
```bash
npx hardhat node        # Start local blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

### Testnet Deployment
```bash
npm run deploy:sepolia  # Deploy to Sepolia
npm run deploy:polygon  # Deploy to Polygon Amoy
```

### Utilities
```bash
npx ts-node scripts/generateABI.ts  # Generate ABI
REPORT_GAS=true npm run test        # Show gas usage
```

## Required Environment Variables

```env
PRIVATE_KEY=                    # Your private key (from wallet)
SEPOLIA_RPC_URL=              # Get from Alchemy or Infura
POLYGON_AMOY_RPC_URL=         # Get from Alchemy or Infura
ETHERSCAN_API_KEY=            # Get from etherscan.io
POLYGONSCAN_API_KEY=          # Get from polygonscan.com
```

## Smart Contract Addresses

**Sepolia Testnet**
```
Contract Address: [Deploy and paste here]
```

**Polygon Amoy Testnet**
```
Contract Address: [Deploy and paste here]
```

## Core Contract Functions

### Admin Functions (Owner Only)
```solidity
registerUser(address user, string username)
verifyKYC(address user)
revokeKYC(address user)
withdrawPlatformFees()
```

### User Functions (KYC Required)
```solidity
createLoan(uint256 amount, uint256 interestRate, uint256 duration, string purpose)
fundLoan(uint256 loanId) payable
repayLoan(uint256 loanId) payable
markLoanDefaulted(uint256 loanId)
```

### View Functions
```solidity
getLoan(uint256 loanId)
getUser(address user)
getLoanFunders(uint256 loanId)
```

## Event Emissions

```solidity
UserRegistered(address user, string username)
KYCVerified(address user)
KYCRevoked(address user)
LoanCreated(uint256 loanId, address borrower, uint256 amount, uint256 interestRate, uint256 duration)
LoanFunded(uint256 loanId, address lender, uint256 amount)
LoanActivated(uint256 loanId)
LoanRepaid(uint256 loanId, address borrower, uint256 amount)
LoanDefaulted(uint256 loanId)
ReputationUpdated(address user, uint256 newScore)
```

## Common Parameters

| Name | Type | Example | Notes |
|------|------|---------|-------|
| amount | uint256 | parseEther("1.5") | In wei |
| interestRate | uint256 | 500 | Basis points (500 = 5%) |
| duration | uint256 | 2592000 | Seconds (30 days) |
| purpose | string | "Business expansion" | Loan purpose |

## Test Faucets

| Network | Faucet | Amount |
|---------|--------|--------|
| Sepolia | https://sepoliafaucet.com | 0.05 ETH |
| Polygon Amoy | https://faucet.polygon.technology | 0.5 MATIC |

## Block Explorers

| Network | Explorer | Contract Address Lookup |
|---------|----------|--------------------------|
| Sepolia | https://sepolia.etherscan.io | Add address to URL |
| Polygon Amoy | https://amoy.polygonscan.com | Add address to URL |

## File Structure Quick Guide

```
contracts/
  └── MicroFund.sol          # Main contract (313 lines)

scripts/
  ├── deploy.ts              # Deployment script
  ├── generateABI.ts         # ABI generator
  └── contractUtils.ts       # Helper functions

test/
  └── MicroFund.test.ts      # Test suite

hardhat.config.ts            # Network configuration
package.json                 # Dependencies
.env.example                 # Environment template
```

## Loan Status Enum

```solidity
0 = Funding        (Waiting for lenders)
1 = Active         (Fully funded, repayment period)
2 = Repaid         (Successfully completed)
3 = Defaulted      (Repayment deadline missed)
```

## Reputation System

```
Initial Score:       50/100
Successful Repay:    +5 (max 100)
Default:            -10 (min 0)
Max Score:          100
Min Score:          0
```

## Gas Estimates (Sepolia)

```
Register User:      ~50K gas
Verify KYC:         ~35K gas
Create Loan:        ~120K gas
Fund Loan:          ~150K gas
Repay Loan:         ~180K gas
Mark Default:       ~50K gas
```

## Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "User not verified" | Not KYC verified | Verify KYC first |
| "Insufficient funds" | Not enough gas + funds | Get test ETH |
| "Loan does not exist" | Invalid loan ID | Check loan ID |
| "Only borrower can repay" | Wrong account | Use borrower account |
| "Loan not in funding phase" | Wrong status | Check loan status |
| "Funding exceeds loan amount" | Overfunding | Fund remaining amount |

## Development Tools

### Hardhat Console
```bash
npx hardhat console
> const contract = await ethers.getContractFactory("MicroFund")
> const deployed = await contract.deploy()
```

### Compile & Check
```bash
npx hardhat compile --force
npx hardhat clean
npx hardhat artifacts
```

### Network Info
```bash
npx hardhat accounts           # List test accounts
npx hardhat network-info       # Network details
```

## Documentation Index

| File | Purpose |
|------|---------|
| README.md | Setup overview |
| SETUP_SUMMARY.md | What's been created |
| DEVELOPMENT.md | Dev workflows |
| DEPLOYMENT_GUIDE.md | Step-by-step deployment |
| FRONTEND_INTEGRATION.md | Frontend integration code |
| PROJECT_OVERVIEW.md | Architecture & roadmap |
| QUICK_REFERENCE.md | This file |

## Frontend Integration URLs

```env
NEXT_PUBLIC_MICROFUND_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MICROFUND_CONTRACT_ABI=path/to/abi.json
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia: 11155111, Polygon Amoy: 80002
```

## Troubleshooting Quick Links

- **Installation issues**: See SETUP_SUMMARY.md
- **Deployment problems**: See DEPLOYMENT_GUIDE.md
- **Gas costs too high**: See DEVELOPMENT.md (Gas Optimization)
- **Frontend integration**: See FRONTEND_INTEGRATION.md
- **Local development**: See DEVELOPMENT.md (Local Development)

## 30-Second Deployment

```bash
# 1. Setup
npm install && cp .env.example .env
# (Edit .env with your keys)

# 2. Deploy
npm run deploy:sepolia

# 3. Copy address and integrate with frontend
```

## Status Checklist Before Going Live

- [ ] npm install succeeds
- [ ] npm run test passes
- [ ] npm run compile has no errors
- [ ] .env file configured
- [ ] Private key has test ETH
- [ ] npm run deploy:sepolia succeeds
- [ ] Contract address saved
- [ ] ABI generated
- [ ] Frontend integrated
- [ ] Test flow works end-to-end

## Useful Links

- **Hardhat Docs**: https://hardhat.org/
- **Solidity**: https://docs.soliditylang.org/
- **ethers.js**: https://docs.ethers.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Ethereum Dev**: https://ethereum.org/developers/

## Contact & Support

For issues or questions:
1. Check the relevant documentation file
2. Review error messages in DEPLOYMENT_GUIDE.md
3. Check Hardhat or Solidity documentation
4. Open an issue in the repository

---

**Last Updated**: January 27, 2024
**Version**: 1.0.0
