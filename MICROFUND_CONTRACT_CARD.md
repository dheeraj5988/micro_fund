# 🏦 MicroFund Smart Contract - Quick Reference Card

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    MICROFUND SMART CONTRACT SUMMARY                          ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

## 📋 Contract Details

| Property | Value |
|----------|-------|
| **Contract Name** | MicroFund |
| **Network** | Ethereum Sepolia (11155111) |
| **Solidity Version** | ^0.8.19 |
| **License** | MIT |
| **Status** | ✅ Ready for Deployment |
| **Deployment Method** | Hardhat |
| **Verification** | Etherscan (automatic) |

---

## 🎯 Core Functions Quick Reference

### 🧑‍💼 User Management
```
registerUser(username)           → Self-register
verifyKYC(address)              → Admin verify user
revokeKYC(address)              → Admin revoke KYC
getUser(address)                → View user profile
```

### 💰 Loan Creation
```
createLoan(amount, rate, duration, purpose)
  → Returns: loanId
  → Requires: KYC verified
  → Gas: ~150k
  → Example: createLoan(1 ETH, 5%, 30 days, "Business")
```

### 💳 Loan Funding
```
fundLoan(loanId)                
  → Payable: send ETH amount
  → Requires: KYC verified
  → Auto-activation: When 100% funded
  → Gas: ~250k
  → Auto-distributes: 2% platform fee
```

### ✅ Loan Repayment
```
repayLoan(loanId)
  → Payable: principal + interest
  → Auto-distributes: Interest to all lenders (by share)
  → Updates: Borrower reputation +5
  → Gas: ~500k (scales with # of lenders)
```

### ⚙️ Admin Functions
```
markLoanDefaulted(loanId)       → Mark late loan as default
withdrawPlatformFees()           → Claim collected fees
setPlatformFeePercentage(%)      → Adjust fee %
```

---

## 📊 Data Structures at a Glance

### Loan Status Flow
```
FUNDING → ACTIVE → REPAID ✅
                 → DEFAULTED ❌
```

### Loan Structure
```
struct Loan {
  id                uint256  → Unique ID
  borrower          address  → Who requested
  amount            uint256  → Total amount
  interestRate      uint256  → In basis points
  duration          uint256  → Seconds to repay
  purpose           string   → Reason for loan
  status            enum     → Current state
  amountFunded      uint256  → Collected so far
  createdAt         uint256  → Block timestamp
  fundingDeadline   uint256  → +30 days
  repaymentDeadline uint256  → Set at activation
}
```

### User Structure
```
struct User {
  username          string   → Display name
  isKycVerified     bool     → KYC status
  reputationScore   uint256  → 0-100 points
  totalBorrowed     uint256  → Career total
  totalRepaid       uint256  → Career total
  defaultCount      uint256  → Defaults made
}
```

---

## 🔢 Key Numbers

| Metric | Value |
|--------|-------|
| **Platform Fee** | 2% on loan disbursement |
| **Max Interest** | 100% (10,000 basis points) |
| **Funding Deadline** | 30 days |
| **Reputation Boost** | +5 for successful repayment |
| **Reputation Penalty** | -10 for default |
| **Max Reputation** | 100 points |
| **Initial Reputation** | 50 points on registration |

---

## 📈 Usage Flow Examples

### Example 1: Complete Loan Cycle
```
┌─────────────────────────────────────────────────────────┐
│ 1. User "alice" registers                               │
│    → registerUser("alice")                              │
│    → Reputation: 50                                     │
├─────────────────────────────────────────────────────────┤
│ 2. Admin verifies alice                                 │
│    → verifyKYC(alice_address)                           │
│    → Now eligible to borrow                             │
├─────────────────────────────────────────────────────────┤
│ 3. Alice creates 1 ETH loan request                     │
│    → createLoan(1 ETH, 500, 2592000, "Business")        │
│    → Gets loanId = 1                                    │
│    → Status: FUNDING (30-day deadline)                  │
├─────────────────────────────────────────────────────────┤
│ 4. Bob funds 0.6 ETH                                    │
│    → fundLoan(1, {value: 0.6 ETH})                      │
│    → amountFunded: 0.6 ETH                              │
├─────────────────────────────────────────────────────────┤
│ 5. Carol funds 0.4 ETH                                  │
│    → fundLoan(1, {value: 0.4 ETH})                      │
│    → amountFunded: 1.0 ETH                              │
│    → 🔔 LOAN ACTIVATED!                                 │
│    → Status: ACTIVE                                     │
│    → Alice receives: 0.98 ETH (2% fee kept)             │
│    → Repayment deadline set                             │
├─────────────────────────────────────────────────────────┤
│ 6. Alice repays 1.05 ETH (1 + 5% interest)              │
│    → repayLoan(1, {value: 1.05 ETH})                    │
│    → Status: REPAID                                     │
│    → Alice's reputation: 55 (+5)                        │
│    → Interest distributed:                              │
│      • Bob gets: 0.63 ETH (60% of 1.05)                 │
│      • Carol gets: 0.42 ETH (40% of 1.05)               │
│    → Both earn 5% ROI on their contribution             │
└─────────────────────────────────────────────────────────┘
```

### Example 2: Default Scenario
```
┌─────────────────────────────────────────────────────────┐
│ Same as above, but...                                   │
├─────────────────────────────────────────────────────────┤
│ 5. Repayment deadline passes, alice doesn't repay       │
│    → Admin marks as default:                            │
│    → markLoanDefaulted(1)                               │
│    → Status: DEFAULTED                                  │
│    → Alice's reputation: 45 (-10)                       │
├─────────────────────────────────────────────────────────┤
│ 6. Consequences:                                        │
│    ❌ Bob loses: 0.6 ETH (can't fund alice again)       │
│    ❌ Carol loses: 0.4 ETH (hard to lend)               │
│    ❌ Alice's defaultCount: 1 (flagged as risky)        │
│    ⚠️  Alice's next loan will be harder to fund         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

| Feature | Description | Protection |
|---------|-------------|-----------|
| **ReentrancyGuard** | Prevents re-entry attacks | ✅ Included |
| **Access Control** | Owner-only admin functions | ✅ Included |
| **KYC Requirement** | Only verified users can participate | ✅ Included |
| **Escrow System** | Funds held until fully funded | ✅ Included |
| **Safe Transfers** | Uses `.call{}` instead of `.transfer()` | ✅ Included |
| **Input Validation** | Comprehensive require statements | ✅ Included |
| **Reputation System** | Disincentivizes defaults | ✅ Included |

---

## 💾 State Variables

```solidity
nextLoanId                      // Auto-incrementing counter
platformFeePercentage = 2       // % fee on disbursement
platformFeeBalance              // Collected fees
users[address]                  // User profiles
loans[uint256]                  // Loan data
loanFunders[loanId][lender]    // Contribution tracking
loanFundersList[loanId][]       // Lenders array
```

---

## 📡 Events Emitted

```
UserRegistered(address user, string username)
KYCVerified(address user)
KYCRevoked(address user)
LoanCreated(uint256 loanId, address borrower, uint256 amount)
LoanFunded(uint256 loanId, address lender, uint256 amount)
LoanActivated(uint256 loanId)
LoanRepaid(uint256 loanId, address borrower, uint256 amount)
LoanDefaulted(uint256 loanId)
ReputationUpdated(address user, uint256 newScore)
PlatformFeeWithdrawn(address owner, uint256 amount)
```

---

## ⛽ Gas Estimates

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| `registerUser()` | ~50k | Low cost user creation |
| `verifyKYC()` | ~25k | Simple state update |
| `createLoan()` | ~150k | Includes mapping setup |
| `fundLoan()` new | ~250k | Full loan activation included |
| `fundLoan()` existing | ~200k | Just update contribution |
| `repayLoan()` 5 lenders | ~350k | Distribution cost scales |
| `repayLoan()` 20 lenders | ~800k | More lenders = more gas |
| `markLoanDefaulted()` | ~100k | State changes + events |
| `withdrawPlatformFees()` | ~50k | Simple transfer |

---

## 🚀 Deployment Checklist

- [ ] Compile contract: `npm run compile`
- [ ] Deploy to testnet: `npm run deploy:sepolia`
- [ ] Wait for block confirmations (6 blocks)
- [ ] Verify on Etherscan (automatic)
- [ ] Save contract address
- [ ] Extract ABI from artifacts
- [ ] Update frontend constants
- [ ] Test basic functions
- [ ] Monitor gas usage
- [ ] Conduct security audit

---

## 📱 Frontend Integration

```typescript
// Import
import { ethers } from 'ethers';
import MicroFundABI from '@/abis/MicroFund.json';

// Initialize
const contract = new ethers.Contract(
  MICROFUND_ADDRESS,
  MicroFundABI,
  signer
);

// Use
const user = await contract.getUser(address);
const loan = await contract.getLoan(1);
const tx = await contract.createLoan(...);

// Listen
contract.on('LoanCreated', (loanId, borrower, amount) => {
  console.log(`Loan created: ${loanId}`);
});
```

---

## 🔗 Contract Deployment Info

**Network**: Sepolia Testnet  
**Chain ID**: 11155111  
**Currency**: SepoliaETH  
**Explorer**: https://sepolia.etherscan.io/  

**After deployment, your contract will be available at:**
```
https://sepolia.etherscan.io/address/0x{YOUR_CONTRACT_ADDRESS}
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_INSTRUCTIONS.md` | Step-by-step deployment guide |
| `CONTRACT_SUMMARY.md` | Detailed contract overview |
| `SMART_CONTRACT_SPECIFICATION.md` | Complete technical specs |
| `DEPLOYMENT_GUIDE.md` | Full integration guide |

---

## ✅ Ready for Production?

Before mainnet deployment:
- [ ] ✅ Contract tested on testnet
- [ ] ✅ All functions verified
- [ ] ✅ Events properly emitted
- [ ] ✅ Gas optimization checked
- [ ] ⏳ Professional security audit (RECOMMENDED)
- [ ] ⏳ Community review period
- [ ] ⏳ Insurance coverage

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Deployment fails | Check private key and RPC URL |
| Transaction reverts | Check if user is KYC verified |
| Low on gas | Get more SepoliaETH from faucet |
| Loan won't activate | Wait for full funding |
| Can't repay | Check deadline hasn't passed |

---

## 📞 Support

- **Contract Code**: `/blockchain/contracts/MicroFund.sol`
- **Deployment Script**: `/blockchain/scripts/deploy.ts`
- **ABI Location**: `/blockchain/artifacts/contracts/MicroFund.sol/MicroFund.json`
- **Configuration**: `/blockchain/hardhat.config.ts`

---

**MicroFund Contract v1.0.0**  
**Status**: 🟢 READY FOR DEPLOYMENT  
**Network**: Sepolia Testnet  
**Date**: 2024

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  Deploy with: npm run deploy:sepolia                                         ║
║  Verify at: https://sepolia.etherscan.io/address/YOUR_ADDRESS                ║
║  Monitor at: Vercel Dashboard + Etherscan                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```
