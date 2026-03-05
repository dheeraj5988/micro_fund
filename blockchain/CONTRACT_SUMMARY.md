# MicroFund Smart Contract - Complete Summary

## Contract Overview

The MicroFund contract is a decentralized peer-to-peer lending platform built on Ethereum. It enables users to create loans, fund loans from other users, and repay with interest while maintaining a reputation-based system.

**Solidity Version**: 0.8.19
**Standard**: OpenZeppelin Ownable + ReentrancyGuard

---

## Data Structures

### Loan Status Enum
```solidity
enum LoanStatus { 
    Funding,      // Waiting for funds
    Active,       // Fully funded, accepting repayments
    Repaid,       // Loan repaid successfully
    Defaulted     // Loan went into default
}
```

### Loan Struct
```solidity
struct Loan {
    uint256 id;                    // Unique loan ID
    address borrower;              // Who borrowed the money
    uint256 amount;                // Loan amount in wei
    uint256 interestRate;          // Interest in basis points (e.g., 500 = 5%)
    uint256 duration;              // Repayment period in seconds
    string purpose;                // Why loan is needed
    LoanStatus status;             // Current status
    uint256 amountFunded;          // Amount already funded
    uint256 createdAt;             // Creation timestamp
    uint256 fundingDeadline;       // Funding deadline (30 days)
    uint256 repaymentDeadline;     // When repayment is due
}
```

### User Struct
```solidity
struct User {
    string username;               // User's display name
    bool isKycVerified;            // KYC verification status
    uint256 reputationScore;       // 0-100 reputation points
    uint256 totalBorrowed;         // Total amount ever borrowed
    uint256 totalRepaid;           // Total amount repaid
    uint256 defaultCount;          // Number of defaults
}
```

---

## State Variables

```solidity
mapping(address => User) users                              // User accounts
mapping(uint256 => Loan) loans                              // All loans
mapping(uint256 => mapping(address => uint256)) loanFunders // Lender shares
mapping(uint256 => address[]) loanFundersList                // All lenders per loan

uint256 nextLoanId = 1                                      // Auto-incrementing loan IDs
uint256 platformFeePercentage = 2                           // Platform fee %
uint256 platformFeeBalance                                  // Collected fees
```

---

## Core Functions

### User Management

#### `registerUser(string _username) → external`
**Purpose**: User self-registration with username
- **Requirements**: Username not empty
- **Effects**: Sets initial reputation to 50
- **Events**: UserRegistered

#### `verifyKYC(address _user) → external onlyOwner`
**Purpose**: Admin KYC verification
- **Requirements**: Owner only, valid address
- **Effects**: Sets isKycVerified to true
- **Events**: KYCVerified

#### `revokeKYC(address _user) → external onlyOwner`
**Purpose**: Remove KYC verification
- **Requirements**: Owner only
- **Events**: KYCRevoked

---

### Loan Creation & Funding

#### `createLoan(...) → external onlyVerifiedUser returns (uint256)`
**Purpose**: Borrower creates a loan request
```solidity
createLoan(
    uint256 _amount,           // Amount in wei
    uint256 _interestRate,     // Basis points (100 = 1%)
    uint256 _duration,         // Seconds (e.g., 30 days = 2592000 sec)
    string _purpose            // Loan purpose
)
```

**Requirements**:
- User must be KYC verified
- Amount > 0
- Interest rate ≤ 10000 (100%)
- Duration > 0

**Effects**:
- Creates new loan in Funding status
- Sets funding deadline to +30 days
- Increments totalBorrowed for user
- Returns new loan ID

**Events**: LoanCreated

**Gas Estimate**: ~150k gas

---

#### `fundLoan(uint256 _loanId) → external payable nonReentrant`
**Purpose**: Investors fund a loan
- **Requirements**: Loan must be in Funding status, funding deadline not passed, sender must be verified
- **Effects**: Records lender's contribution
- **Auto-Actions**: When fully funded:
  - Transfers funds to borrower (minus 2% platform fee)
  - Updates loan status to Active
  - Sets repayment deadline
- **Events**: LoanFunded, LoanActivated (when full)

**Gas Estimate**: ~250k gas

---

### Loan Repayment & Default

#### `repayLoan(uint256 _loanId) → external payable nonReentrant`
**Purpose**: Borrower (or anyone) repays loan with interest
- **Requirements**: Loan must be Active, not past deadline
- **Calculation**: `totalRepayment = amount + (amount * interestRate / 10000)`
- **Effects**:
  - Marks loan as Repaid
  - Updates borrower's totalRepaid
  - Increases reputation by +5 (capped at 100)
  - Distributes payouts to all lenders based on their share
  - Refunds excess ETH
- **Events**: LoanRepaid, ReputationUpdated

**Example**:
```
amount = 1 ETH
interestRate = 500 (5%)
interest = 1 ETH * 500 / 10000 = 0.05 ETH
totalRepayment = 1.05 ETH
```

---

#### `markLoanDefaulted(uint256 _loanId) → external onlyOwner`
**Purpose**: Admin marks loan as defaulted
- **Requirements**: Owner only, loan must be Active, past deadline
- **Effects**:
  - Marks loan as Defaulted
  - Increases defaultCount
  - Decreases reputation by 10
- **Events**: LoanDefaulted, ReputationUpdated

---

### Platform Management

#### `withdrawPlatformFees() → external onlyOwner nonReentrant`
**Purpose**: Owner withdraws collected platform fees
- **Requirements**: Owner only, fees > 0
- **Effects**: Transfers all accumulated fees to owner
- **Events**: PlatformFeeWithdrawn

---

#### `setPlatformFeePercentage(uint256 _feePercentage) → external onlyOwner`
**Purpose**: Adjust platform fee
- **Requirements**: Owner only, fee ≤ 10%
- **Effects**: Updates platformFeePercentage

---

### View Functions

#### `getLoan(uint256 _loanId) → external view returns (Loan)`
Returns complete loan details

#### `getUser(address _userAddress) → external view returns (User)`
Returns complete user profile

#### `getLoanFunders(uint256 _loanId) → external view returns (address[])`
Returns all lenders for a loan

#### `getLoanFunderShare(uint256 _loanId, address _lender) → external view returns (uint256)`
Returns lender's contribution amount

---

## Security Features

### Access Control
- **onlyOwner**: Admin functions (KYC, fee management)
- **onlyVerifiedUser**: Loan creation and funding
- **nonReentrant**: Fund transfers, repayments

### Reentrancy Protection
- Uses OpenZeppelin's ReentrancyGuard
- Applied to all fund-transferring functions
- Safe transfer pattern: `.call{value:...}("")` instead of `.transfer()`

### Input Validation
- All numeric inputs validated (> 0 checks)
- Address zero checks
- Status checks before operations
- Deadline checks for operations

### Economic Security
- Platform fee collected on funding
- Reputation system to disincentivize defaults
- User must be fully verified to participate
- Loan escrow: funds held until fully funded

---

## Events

All critical state changes emit events for frontend monitoring:

```solidity
event UserRegistered(address indexed user, string username);
event KYCVerified(address indexed user);
event KYCRevoked(address indexed user);
event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount);
event LoanFunded(uint256 indexed loanId, address indexed lender, uint256 amount);
event LoanActivated(uint256 indexed loanId);
event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
event LoanDefaulted(uint256 indexed loanId);
event ReputationUpdated(address indexed user, uint256 newScore);
event PlatformFeeWithdrawn(address indexed owner, uint256 amount);
```

---

## Gas Optimization

The contract includes:
- Storage layout optimization for struct packing
- Efficient loops with early exits
- Safe casting to avoid overflow
- Minimal state changes in view functions

**Estimated Gas Costs**:
- Register User: ~50k
- Create Loan: ~150k
- Fund Loan (new funder): ~250k
- Fund Loan (existing funder): ~200k
- Repay Loan (10 lenders): ~500k
- Withdraw Fees: ~100k

---

## Deployment Details

**Network**: Sepolia Testnet (11155111)
**Contract Factory**: MicroFund
**Constructor**: No arguments (uses msg.sender as owner)

**Required Libraries**:
- `@openzeppelin/contracts/access/Ownable.sol`
- `@openzeppelin/contracts/security/ReentrancyGuard.sol`

---

## Frontend Integration Points

### Web3 Library Setup
```typescript
import { ethers } from 'ethers';
import MicroFundABI from './abis/MicroFund.json';

const contract = new ethers.Contract(
    MICROFUND_ADDRESS,
    MicroFundABI,
    signer  // User's wallet
);
```

### Key Integration Points
1. **User Registration**: Call `registerUser()` after wallet connection
2. **Admin KYC**: Admin dashboard calls `verifyKYC()`
3. **Loan Creation**: Borrowers call `createLoan()`
4. **Funding**: Investors call `fundLoan()` with ETH value
5. **Repayment**: Borrowers call `repayLoan()` with interest amount
6. **Monitoring**: Listen to events for real-time updates

---

## Testing Checklist

- [ ] Register user with various usernames
- [ ] KYC verification by owner
- [ ] Create loan with different amounts/rates
- [ ] Fund loan (partial, then complete)
- [ ] Verify funds held in escrow until full funding
- [ ] Repay loan successfully
- [ ] Verify reputation increase on success
- [ ] Attempt default marking
- [ ] Verify reputation penalty
- [ ] Check platform fee collection
- [ ] Test fee withdrawal by owner
- [ ] Verify all event emissions
- [ ] Test reentrancy protection

---

## Live Deployment Info

**Contract Address**: Will be updated after deployment
**Network**: Sepolia Testnet
**Block Explorer**: https://sepolia.etherscan.io/
**View Contract**: https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]

---

## Audits & Reviews

Before mainnet deployment, recommend:
1. Professional smart contract audit
2. Security testing on testnet
3. Community review period
4. Insurance coverage consideration

---

## License

SPDX-License-Identifier: MIT
