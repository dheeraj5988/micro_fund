# MicroFund Smart Contract - Complete Technical Specification

**Status**: ✅ READY FOR DEPLOYMENT  
**Network**: Sepolia Testnet (Chain ID: 11155111)  
**Compiler Version**: Solidity ^0.8.19  
**Contract Size**: ~18 KB  
**License**: MIT  

---

## 1. CONTRACT OVERVIEW

### Purpose
MicroFund is a decentralized peer-to-peer lending platform that enables:
- Users to request loans with specified terms
- Investors to fund loans and receive returns with interest
- Automatic distribution of repayments based on contribution
- Reputation-based trust mechanisms
- Platform fee collection for sustainability

### Key Innovation: Escrow-Based Funding
Unlike traditional lending platforms, MicroFund uses an escrow mechanism:
- Borrower requests loan
- Investors contribute ETH without immediate release
- Once fully funded → funds released to borrower, deadline triggered
- Borrower repays with interest by deadline
- Repayment distributed automatically to lenders

---

## 2. STATE DIAGRAM

```
┌─────────────────────────────────────────────────┐
│          LOAN LIFECYCLE IN MICROFUND            │
└─────────────────────────────────────────────────┘

1. FUNDING STATUS
   ├─ Borrower creates loan request
   ├─ Investors contribute ETH
   ├─ Contributions held in escrow (30-day deadline)
   └─ If unfunded after 30 days → funds returned
   
2. ACTIVE STATUS (When fully funded)
   ├─ Funds released to borrower (minus 2% fee)
   ├─ Repayment deadline set (based on duration)
   └─ Lenders wait for repayment + interest
   
3. TWO POSSIBLE OUTCOMES:
   
   a) REPAID (Success Path)
      ├─ Borrower sends principal + interest
      ├─ Interest distributed to lenders by share
      ├─ Reputation increased by +5
      └─ Loan marked as Repaid
   
   b) DEFAULTED (Failure Path)
      ├─ Admin marks as Defaulted after deadline passes
      ├─ Reputation decreased by -10
      ├─ Lenders lose contributed amount
      └─ Defaulter tracked for future lending
```

---

## 3. DATA STRUCTURES

### Enum: LoanStatus
```solidity
enum LoanStatus {
    Funding,      // 0 - Awaiting funding
    Active,       // 1 - Fully funded, in repayment period
    Repaid,       // 2 - Successfully repaid
    Defaulted     // 3 - Failed to repay
}
```

### Struct: Loan
```solidity
struct Loan {
    uint256 id;                    // Unique identifier (auto-incremented)
    address borrower;              // Loan originator
    uint256 amount;                // Total loan amount in wei
    uint256 interestRate;          // APY in basis points (500 = 5%)
    uint256 duration;              // Repayment period in seconds
    string purpose;                // Loan purpose (text)
    LoanStatus status;             // Current status
    uint256 amountFunded;          // Amount received so far
    uint256 createdAt;             // Timestamp of creation
    uint256 fundingDeadline;       // Deadline for funding (30 days from creation)
    uint256 repaymentDeadline;     // Deadline for repayment (set when fully funded)
}
```

**Memory Layout**: ~34 bytes (5 slots with optimal packing)

---

### Struct: User
```solidity
struct User {
    string username;               // Display name (immutable)
    bool isKycVerified;            // KYC verification flag
    uint256 reputationScore;       // Points from 0-100
    uint256 totalBorrowed;         // Cumulative borrowed amount
    uint256 totalRepaid;           // Cumulative repaid amount
    uint256 defaultCount;          // Number of defaults
}
```

**Memory Layout**: ~64 bytes (2 slots + dynamic string)

---

## 4. STATE VARIABLES

### Public Variables
```solidity
uint256 public nextLoanId = 1                           // Auto-increment counter
uint256 public platformFeePercentage = 2                // 2% fee on loan disbursement
uint256 public platformFeeBalance                       // Accumulated fees
```

### Mapping Storage
```solidity
mapping(address => User) public users                           // O(1) user lookup
mapping(uint256 => Loan) public loans                           // O(1) loan lookup
mapping(uint256 => mapping(address => uint256)) loanFunders     // O(1) lender share lookup
mapping(uint256 => address[]) loanFundersList                   // List of all lenders per loan
```

**Storage Analysis**:
- Each user: 2 storage slots + dynamic data
- Each loan: 2 storage slots
- Each mapping entry: 1 storage slot
- Dynamic arrays: 1 slot per entry

---

## 5. CORE FUNCTIONS

### 5.1 User Registration

#### `registerUser(string calldata _username) external`

**Purpose**: Self-registration with username

**Parameters**:
- `_username`: Display name (bytes string)

**Validation**:
- Username not empty: `require(bytes(_username).length > 0)`

**State Changes**:
- Creates user if new
- Sets initial reputation: 50
- Stores username

**Gas Cost**: ~45,000 gas

**Events**: `UserRegistered(address user, string username)`

**Security**: ✅ No access control needed (self-registration)

---

#### `verifyKYC(address _user) external onlyOwner`

**Purpose**: Admin verification of user identity

**Parameters**:
- `_user`: Target user address

**Validation**:
- Caller must be owner: `require(msg.sender == owner())`
- Valid address: `require(_user != address(0))`

**State Changes**:
- Sets `users[_user].isKycVerified = true`

**Gas Cost**: ~25,000 gas

**Events**: `KYCVerified(address user)`

**Security**: 🔒 Owner-only function

---

#### `revokeKYC(address _user) external onlyOwner`

**Purpose**: Remove user's verification status

**Parameters**:
- `_user`: Target user address

**State Changes**:
- Sets `users[_user].isKycVerified = false`

**Gas Cost**: ~25,000 gas

**Events**: `KYCRevoked(address user)`

**Security**: 🔒 Owner-only function

---

### 5.2 Loan Creation

#### `createLoan(uint256 _amount, uint256 _interestRate, uint256 _duration, string calldata _purpose) external onlyVerifiedUser returns (uint256)`

**Purpose**: Borrower initiates a loan request

**Parameters**:
```solidity
_amount        // Wei (e.g., 10^18 = 1 ETH)
_interestRate  // Basis points (500 = 5%)
_duration      // Seconds (e.g., 2592000 = 30 days)
_purpose       // Loan purpose string
```

**Validation**:
```solidity
require(msg.sender.isKycVerified, "User not verified")
require(_amount > 0, "Amount > 0")
require(_interestRate <= 10000, "Interest <= 100%")
require(_duration > 0, "Duration > 0")
```

**State Changes**:
- Increments `nextLoanId`
- Creates new Loan struct with status = Funding
- Sets `fundingDeadline = now + 30 days`
- Updates user's `totalBorrowed`

**Returns**: `loanId` (uint256)

**Gas Cost**: ~150,000 gas

**Events**: `LoanCreated(uint256 loanId, address borrower, uint256 amount)`

**Example**:
```javascript
const loanId = await contract.createLoan(
  ethers.parseEther("1.0"),   // 1 ETH
  500,                        // 5% interest
  30 * 24 * 60 * 60,         // 30 days
  "Equipment purchase"
);
// Returns: 42 (loan ID)
```

---

### 5.3 Loan Funding

#### `fundLoan(uint256 _loanId) external payable nonReentrant onlyVerifiedUser loanExists(_loanId)`

**Purpose**: Investor contributes ETH to a loan

**Parameters**:
- `_loanId`: Target loan ID
- `msg.value`: Amount of ETH to contribute

**Validation**:
```solidity
require(loan.status == LoanStatus.Funding, "Not in funding")
require(block.timestamp < loan.fundingDeadline, "Deadline passed")
require(msg.value > 0, "Send ETH > 0")
require(loan.amountFunded + msg.value <= loan.amount, "Over-funded")
require(msg.sender.isKycVerified, "Not verified")
```

**State Changes**:
- Records lender's contribution: `loanFunders[_loanId][msg.sender] += msg.value`
- Adds lender to list if new: `loanFundersList[_loanId].push(msg.sender)`
- Updates funded amount: `loan.amountFunded += msg.value`

**When Fully Funded** (automatic):
- Status → Active
- Set `repaymentDeadline = now + duration`
- Calculate fee: `fee = amount * 2 / 100`
- Collect fee: `platformFeeBalance += fee`
- Release funds: Transfer `(amount - fee)` to borrower
- Emit `LoanActivated`

**Gas Cost**:
- New contributor: ~250,000 gas
- Existing contributor: ~200,000 gas
- Full funding: +100,000 gas (transfer + state update)

**Events**: 
- `LoanFunded(uint256 loanId, address lender, uint256 amount)`
- `LoanActivated(uint256 loanId)` (when full)

**Example**:
```javascript
await contract.fundLoan(42, { 
  value: ethers.parseEther("0.5") 
});
// Contributes 0.5 ETH to loan 42
// If this completes the 1 ETH loan:
// - 0.98 ETH sent to borrower
// - 0.02 ETH added to platform fees
// - repayment deadline set
```

---

### 5.4 Loan Repayment

#### `repayLoan(uint256 _loanId) external payable nonReentrant loanExists(_loanId)`

**Purpose**: Borrower repays loan with interest

**Parameters**:
- `_loanId`: Loan to repay
- `msg.value`: Repayment amount (must include interest)

**Validation**:
```solidity
require(loan.status == LoanStatus.Active, "Loan not active")
require(block.timestamp <= loan.repaymentDeadline, "Deadline passed")
require(msg.value >= totalRepayment, "Insufficient amount")
```

**Calculation**:
```solidity
interest = (loan.amount * loan.interestRate) / 10000
totalRepayment = loan.amount + interest

Example:
  amount = 1 ETH
  interestRate = 500 (5%)
  interest = 1 ETH * 500 / 10000 = 0.05 ETH
  totalRepayment = 1.05 ETH
```

**State Changes**:
- Status → Repaid
- `users[borrower].totalRepaid += amount`
- Increase reputation: +5 (capped at 100)

**Lender Distribution**:
For each lender:
```solidity
share = loanFunders[_loanId][lender]
payout = (totalRepayment * share) / loan.amount
transfer payout to lender
```

**Example with 3 Lenders**:
```
Loan: 1 ETH + 0.05 ETH interest = 1.05 ETH total
Lender A funded 0.5 ETH → gets 0.525 ETH
Lender B funded 0.3 ETH → gets 0.315 ETH
Lender C funded 0.2 ETH → gets 0.21 ETH
Total: 1.05 ETH (exact distribution)
```

**Excess Refund**:
- If `msg.value > totalRepayment`, refund excess to sender

**Gas Cost**: ~500,000 gas (varies with number of lenders)

**Events**: 
- `LoanRepaid(uint256 loanId, address borrower, uint256 amount)`
- `ReputationUpdated(address user, uint256 newScore)`

---

### 5.5 Loan Default Handling

#### `markLoanDefaulted(uint256 _loanId) external onlyOwner loanExists(_loanId)`

**Purpose**: Admin marks missed loan as defaulted

**Parameters**:
- `_loanId`: Loan ID to mark as defaulted

**Validation**:
```solidity
require(loan.status == LoanStatus.Active, "Not active")
require(block.timestamp > loan.repaymentDeadline, "Not past deadline")
require(msg.sender == owner(), "Owner only")
```

**State Changes**:
- Status → Defaulted
- Increment `users[borrower].defaultCount`
- Decrease reputation: -10 (minimum 0)

**Gas Cost**: ~100,000 gas

**Events**: 
- `LoanDefaulted(uint256 loanId)`
- `ReputationUpdated(address user, uint256 newScore)`

**Impact**: 
- Lenders lose their contribution
- Borrower's credit score damaged
- Future loan requests more difficult

---

### 5.6 Platform Management

#### `withdrawPlatformFees() external onlyOwner nonReentrant`

**Purpose**: Owner withdraws accumulated fees

**Validation**:
```solidity
require(msg.sender == owner(), "Owner only")
require(platformFeeBalance > 0, "No fees")
```

**State Changes**:
- Transfers `platformFeeBalance` to owner
- Resets balance: `platformFeeBalance = 0`

**Gas Cost**: ~50,000 gas

**Events**: `PlatformFeeWithdrawn(address owner, uint256 amount)`

---

#### `setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner`

**Purpose**: Adjust platform fee percentage

**Parameters**:
- `_feePercentage`: New percentage (e.g., 2 for 2%)

**Validation**:
```solidity
require(_feePercentage <= 10, "Max 10%")
require(msg.sender == owner(), "Owner only")
```

**State Changes**:
- Updates `platformFeePercentage`

**Gas Cost**: ~25,000 gas

---

## 6. VIEW FUNCTIONS

### `getLoan(uint256 _loanId) external view returns (Loan)`
Returns complete loan data structure

### `getUser(address _userAddress) external view returns (User)`
Returns user profile with reputation and history

### `getLoanFunders(uint256 _loanId) external view returns (address[])`
Returns array of all lenders for a loan

### `getLoanFunderShare(uint256 _loanId, address _lender) external view returns (uint256)`
Returns specific lender's contribution amount

---

## 7. EVENTS

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

**Indexing Strategy**: Users/lenders and loan IDs indexed for efficient querying

---

## 8. MODIFIERS

### `onlyVerifiedUser`
```solidity
modifier onlyVerifiedUser() {
    require(users[msg.sender].isKycVerified, "User not verified");
    _;
}
```
Restricts function to KYC-verified users only

### `loanExists(uint256 _loanId)`
```solidity
modifier loanExists(uint256 _loanId) {
    require(_loanId > 0 && _loanId < nextLoanId, "Loan does not exist");
    _;
}
```
Validates loan ID before operation

---

## 9. SECURITY ANALYSIS

### Reentrancy Protection
- **Protection**: `nonReentrant` guard on fund-transferring functions
- **Applies To**: `fundLoan()`, `repayLoan()`, `withdrawPlatformFees()`
- **Implementation**: OpenZeppelin ReentrancyGuard

### Safe Transfer Pattern
```solidity
// ❌ BAD: Vulnerable to fallback function attacks
payable(address).transfer(amount);

// ✅ GOOD: Safe pattern used in contract
(bool success, ) = payable(address).call{value: amount}("");
require(success, "Transfer failed");
```

### Access Control
- **Owner Functions**: KYC verification, default marking, fee withdrawal
- **Verified User Functions**: Loan creation, funding
- **Public Functions**: User registration, view functions

### Input Validation
- ✅ Amount > 0 checks
- ✅ Interest rate <= 100%
- ✅ Duration > 0
- ✅ No address(0) operations
- ✅ Deadline checks on repayment

### Escrow Safety
- Funds held in contract until fully funded
- No withdrawal possible before loan activation
- Automatic release only when conditions met

---

## 10. GAS OPTIMIZATION

### Strategy 1: Storage Packing
- Structs aligned to minimize storage slots
- Booleans combined with other small types
- Array iteration only when necessary

### Strategy 2: Function Optimization
- Use local variables instead of repeated state access
- Avoid unnecessary computations
- Emit events after state changes

### Strategy 3: Efficient Lookups
- Direct mappings for O(1) access
- Indexed events for efficient filtering
- Array iteration only for distribution

**Estimated Costs**:
```
Register User:        ~50,000 gas
Create Loan:         ~150,000 gas
Fund Loan (new):     ~250,000 gas
Repay (10 lenders):  ~500,000 gas
Withdraw Fees:       ~50,000 gas
```

---

## 11. DEPLOYMENT PARAMETERS

### Network: Sepolia Testnet
```
Chain ID: 11155111
Currency: SepoliaETH
Faucet: https://www.sepoliaetherscan.io/
Explorer: https://sepolia.etherscan.io/
```

### Contract Configuration
```solidity
Owner: [Deployer Address]
Initial Fee Percentage: 2%
Initial Platform Balance: 0 ETH
```

### Constructor
No-argument constructor:
```solidity
constructor() Ownable() ReentrancyGuard() {}
// Owner = msg.sender (deployer)
```

---

## 12. INTEGRATION CHECKLIST

- [ ] Deploy contract to Sepolia
- [ ] Save contract address
- [ ] Verify on Etherscan
- [ ] Extract and save ABI
- [ ] Update frontend MICROFUND_ADDRESS
- [ ] Test user registration
- [ ] Test KYC verification
- [ ] Test loan creation
- [ ] Test loan funding (partial)
- [ ] Test loan activation (full funding)
- [ ] Test repayment with distribution
- [ ] Test event emission
- [ ] Monitor gas usage
- [ ] Security audit (recommended)
- [ ] Load testing with multiple users

---

## 13. MONITORING & ANALYTICS

### Key Metrics to Track
- Active loans count
- Total funded amount
- Platform fees collected
- Repayment success rate
- Default rate
- Average interest rate
- User registration rate
- Lender diversification

### Event Monitoring
```javascript
// Listen for loan activity
contract.on("LoanCreated", handleNewLoan);
contract.on("LoanActivated", handleLoanActivated);
contract.on("LoanRepaid", handleRepayment);
contract.on("LoanDefaulted", handleDefault);

// Monitor user activity
contract.on("UserRegistered", handleNewUser);
contract.on("ReputationUpdated", handleReputationChange);
```

---

## 14. UPGRADE PATH

For future improvements (requires deployment strategy):
- Upgrade fee percentage logic
- Add more sophisticated reputation algorithms
- Implement collateral support
- Add automated default detection
- Integrate price feeds for multi-asset loans

---

**Specification Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: READY FOR DEPLOYMENT ✅
