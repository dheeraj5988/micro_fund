# MicroFund Architecture & System Design

## 🏛️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MicroFund Platform                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      Frontend (Next.js)                       │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │   │
│  │  │   User     │  │ Loan Creation│  │   Dashboard &      │  │   │
│  │  │ Dashboard  │  │   & Funding  │  │   Management       │  │   │
│  │  └─────┬──────┘  └──────┬───────┘  └────────┬───────────┘  │   │
│  │        │                │                    │               │   │
│  │        └────────────────┼────────────────────┘               │   │
│  │                         │                                    │   │
│  │         Ethers.js / Web3 Integration                        │   │
│  │                         │                                    │   │
│  └─────────────────────────┼────────────────────────────────────┘   │
│                            │                                         │
│  ┌─────────────────────────┼────────────────────────────────────┐   │
│  │                   Blockchain Layer                            │   │
│  │                         │                                    │   │
│  │  ┌──────────────────────▼──────────────────────────────┐   │   │
│  │  │        Ethereum Sepolia Testnet (11155111)          │   │   │
│  │  │                                                       │   │   │
│  │  │  ┌─────────────────────────────────────────────┐    │   │   │
│  │  │  │     MicroFund Smart Contract                │    │   │   │
│  │  │  │                                              │    │   │   │
│  │  │  │  • User Management (register, verify KYC)  │    │   │   │
│  │  │  │  • Loan Lifecycle (create, fund, repay)    │    │   │   │
│  │  │  │  • Escrow System (secure fund holding)      │    │   │   │
│  │  │  │  • Reputation Tracking (0-100 points)       │    │   │   │
│  │  │  │  • Platform Fee Management (2% default)     │    │   │   │
│  │  │  │  • Event Emission (10 event types)          │    │   │   │
│  │  │  │                                              │    │   │   │
│  │  │  └─────────────────────────────────────────────┘    │   │   │
│  │  │                                                       │   │   │
│  │  │  Storage:                                           │   │   │
│  │  │  ├─ users[address] → User profiles                 │   │   │
│  │  │  ├─ loans[uint256] → Loan data                     │   │   │
│  │  │  ├─ loanFunders[id][addr] → Investment tracking   │   │   │
│  │  │  └─ loanFundersList[id][] → Lender lists          │   │   │
│  │  │                                                       │   │   │
│  │  └───────────────────────────────────────────────────────┘   │   │
│  │                                                            │   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flow Diagram

### Borrower Journey

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ 1. Connect Wallet    │
│    (MetaMask, etc.)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ 2. Register & Get KYC    │
│    • Set username        │
│    • Admin verification  │
│    • Reputation = 50     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 3. Create Loan           │
│    • Amount              │
│    • Interest Rate       │
│    • Duration            │
│    • Purpose             │
│    Status: FUNDING       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 4. Wait for Investors    │
│    • Funding deadline:   │
│      30 days             │
│    • Monitor progress    │
└──────┬───────────────────┘
       │
       ├─── If NOT funded ────► Funds returned to investors
       │
       └─── If FULLY funded ──┐
                              │
                              ▼
                    ┌──────────────────────┐
                    │ 5. Receive Funds     │
                    │    • 98% (2% fee)    │
                    │    Status: ACTIVE    │
                    │    Repayment date    │
                    │      deadline set    │
                    └──────┬───────────────┘
                           │
                           ▼
                    ┌──────────────────────┐
                    │ 6. Repay Loan        │
                    │    • Principal +     │
                    │      Interest        │
                    │    Status: REPAID    │
                    │    Reputation: +5    │
                    └──────┬───────────────┘
                           │
                           ├─── Success ──► Loan Complete ✅
                           │
                           └─── Late ──────► Default ❌
                                            Reputation: -10
```

### Lender/Investor Journey

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ 1. Connect Wallet    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 2. Register & Verify │
│    (Same as above)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────┐
│ 3. Browse Loans          │
│    • Filter by rate      │
│    • View borrower info  │
│    • Check progress      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 4. Fund Loan             │
│    • Choose amount       │
│    • Send ETH (payable)  │
│    • Funds in escrow     │
└──────┬───────────────────┘
       │
       ├─── If 100% funded ──────────┐
       │                              │
       └─── If not yet 100% funded ──┤
                                      │
                                      ▼
                        ┌──────────────────────┐
                        │ 5. Wait for Repay    │
                        │    • Loan ACTIVE     │
                        │    • Lender list     │
                        │      recorded        │
                        └──────┬───────────────┘
                               │
                               ▼
                        ┌──────────────────────┐
                        │ 6. Receive Payout    │
                        │    • Share of        │
                        │      principal       │
                        │    • Share of        │
                        │      interest        │
                        │    • 5% ROI example  │
                        └──────┬───────────────┘
                               │
                               ├─── Success ──► Profit 💰
                               │
                               └─── Default ──► Loss ❌
```

---

## 📊 Data Flow Diagram

### Loan Funding Flow

```
Investor A (0.6 ETH)                Investor B (0.4 ETH)
        │                                   │
        ▼                                   ▼
    fundLoan(1)                        fundLoan(1)
        │                                   │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │ Escrow (Smart Contract)       │
        │ Total: 1.0 ETH                │
        │                               │
        │ loanFunders[1][A] = 0.6 ETH   │
        │ loanFunders[1][B] = 0.4 ETH   │
        │                               │
        │ loanFundersList[1][0] = A     │
        │ loanFundersList[1][1] = B     │
        └───────────────┬───────────────┘
                        │
                  [100% Funded!]
                        │
                        ▼
        ┌───────────────────────────────┐
        │ Automatic Distribution:       │
        │                               │
        │ Fee = 1.0 * 2% = 0.02 ETH     │
        │ Release = 1.0 - 0.02 = 0.98   │
        │                               │
        │ ├─ 0.02 ETH → platformFees    │
        │ └─ 0.98 ETH → Borrower        │
        └───────────────────────────────┘
```

### Loan Repayment Flow

```
Borrower
    │
    │ repayLoan(1)
    │ Value: 1.05 ETH (1.0 + 5% interest)
    │
    ▼
┌─────────────────────────────────┐
│ Contract receives 1.05 ETH       │
│                                 │
│ Calculation:                    │
│ Interest = 1.0 * 500 / 10000    │
│          = 0.05 ETH             │
│ Total = 1.0 + 0.05 = 1.05 ETH   │
└────────────────┬────────────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Distribution Phase    │
     │                       │
     │ For each lender:      │
     │ payout = total *      │
     │          share/amount │
     └───────────┬───────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
    ┌────────┐       ┌────────┐
    │Investor│       │Investor│
    │   A    │       │   B    │
    │(60%)   │       │(40%)   │
    │        │       │        │
    │ Gets:  │       │ Gets:  │
    │ 0.63   │       │ 0.42   │
    │ ETH    │       │ ETH    │
    └────────┘       └────────┘
```

---

## 🎯 Smart Contract Function Call Graph

```
┌──────────────────────────────────────────────────────────────┐
│                    MicroFund Contract                        │
└──────────────────────────────────────────────────────────────┘

                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┌────────────────┐  ┌─────────────┐  ┌──────────────┐
    │  User Mgmt     │  │ Loan Cycle  │  │ Admin Funcs  │
    ├────────────────┤  ├─────────────┤  ├──────────────┤
    │registerUser()  │  │createLoan() │  │verifyKYC()   │
    │getUser()       │  │fundLoan()   │  │withdrawFees()│
    │verifyKYC()     │  │repayLoan()  │  │setFeePercent│
    │revokeKYC()     │  │markDefault()│  └──────────────┘
    └────────────────┘  └─────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  View Functions      │
                    ├──────────────────────┤
                    │getLoan()             │
                    │getLoanFunders()      │
                    │getLoanFunderShare()  │
                    └──────────────────────┘
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────────────────────┐
│              MicroFund Security Architecture            │
└────────────────────────────────────────────────────────┘

Layer 1: Access Control
├─ onlyOwner (Ownable)
│  ├─ verifyKYC()
│  ├─ revokeKYC()
│  ├─ markLoanDefaulted()
│  ├─ withdrawPlatformFees()
│  └─ setPlatformFeePercentage()
│
├─ onlyVerifiedUser
│  ├─ createLoan()
│  └─ fundLoan()
│
└─ loanExists()
   └─ repayLoan()

Layer 2: Reentrancy Protection
├─ nonReentrant on:
│  ├─ fundLoan()
│  ├─ repayLoan()
│  └─ withdrawPlatformFees()
└─ Uses: OpenZeppelin ReentrancyGuard

Layer 3: Safe Transfers
├─ Pattern: call{value:...}("")
├─ Replaces: unsafe transfer()
└─ Includes: Success checks

Layer 4: Escrow System
├─ Funds held until fully funded
├─ No early withdrawal possible
├─ Automatic release on activation
└─ State validation on every operation

Layer 5: Input Validation
├─ Amount > 0
├─ Interest <= 100%
├─ Duration > 0
├─ Address != 0x0
└─ Status checks
```

---

## 💾 Storage Layout

```
┌──────────────────────────────────────────────────────────────┐
│                    Smart Contract Storage                    │
└──────────────────────────────────────────────────────────────┘

Slot 0-1: Owner (Ownable)
Slot 2-3: ReentrancyGuard state

Slot 4: nextLoanId (uint256)
Slot 5: platformFeePercentage (uint256)
Slot 6: platformFeeBalance (uint256)

Mappings (keccak256(key, slot)):
├─ users[address] → User struct (2 slots each)
├─ loans[uint256] → Loan struct (2 slots each)
├─ loanFunders[uint256][address] → uint256
├─ loanFundersList[uint256] → address[]
│
Events (indexed):
├─ UserRegistered (address indexed user)
├─ KYCVerified (address indexed user)
├─ LoanCreated (uint256 indexed loanId)
├─ LoanFunded (uint256 indexed loanId, address indexed lender)
├─ LoanRepaid (uint256 indexed loanId)
└─ ... (more events)
```

---

## 🌐 Contract Interaction Matrix

### Who Can Call What?

```
                  registerUser  createLoan  fundLoan  repayLoan  verifyKYC
┌────────────────┬──────────────┬───────────┬─────────┬──────────┬──────────┐
│ Unverified User│      ✅      │     ❌    │   ❌    │    ✅    │    ❌    │
├────────────────┼──────────────┼───────────┼─────────┼──────────┼──────────┤
│ Verified User  │      ✅      │     ✅    │   ✅    │    ✅    │    ❌    │
├────────────────┼──────────────┼───────────┼─────────┼──────────┼──────────┤
│ Contract Owner │      ✅      │     ✅    │   ✅    │    ✅    │    ✅    │
├────────────────┼──────────────┼───────────┼─────────┼──────────┼──────────┤
│ Any Address    │      ✅*     │     ✅    │   ✅    │    ✅    │    ❌    │
│ (repayment)    │              │           │         │   **     │          │
└────────────────┴──────────────┴───────────┴─────────┴──────────┴──────────┘

* registerUser: Self-registration only
** repayLoan: Any address can repay on behalf of borrower
```

---

## 📈 State Transition Diagram

### Loan Status Transitions

```
                        ┌─────────────────────┐
                        │   FUNDING (0)       │
                        │  Default Status     │
                        └────────┬────────────┘
                                 │
                    ┌────────────┴─────────────┐
                    │                         │
         [After 30 days]           [100% Funded]
         [No funding]               [Auto-trigger]
                    │                         │
                    ▼                         ▼
         ┌──────────────────┐   ┌─────────────────────┐
         │  Unfunded        │   │   ACTIVE (1)        │
         │  (return funds)  │   │ Accepting repayment │
         └──────────────────┘   └─────────┬───────────┘
                                          │
                         ┌────────────────┴────────────────┐
                         │                                 │
                  [Repay + Interest]            [Miss deadline]
                  [Before deadline]             [Admin marks]
                         │                                 │
                         ▼                                 ▼
                   ┌──────────────┐         ┌──────────────────────┐
                   │ REPAID (2)   │         │  DEFAULTED (3)       │
                   │  ✅ Success  │         │  ❌ Failure          │
                   │  Lenders get │         │  Lenders lose funds  │
                   │  their share │         │  Borrower penalized  │
                   └──────────────┘         └──────────────────────┘
```

---

## 🎓 Reputation System Flow

```
User Registration
       │
       ├─ Initial Score: 50
       │
       ▼
User Action
       │
       ├─ Create Loan
       │  ├─ No change to reputation
       │  │
       │  ├─ Loan Successful (Repaid)
       │  │  └─ Reputation: +5 (max 100)
       │  │
       │  └─ Loan Defaulted
       │     └─ Reputation: -10 (min 0)
       │
       ├─ Fund Loan
       │  ├─ No direct reputation change
       │  ├─ Indirect: More reputation = trust
       │  │
       │  └─ Profit from interest
       │     └─ Encourages investment
       │
       └─ Benefits of High Reputation
          ├─ Easier loan approval
          ├─ Better interest rates
          ├─ Higher loan limits
          └─ Lender confidence
```

---

## 🔄 Event Emission Flow

```
User Action
    │
    ├─ User Registration
    │  └─ emit UserRegistered(address, string)
    │
    ├─ KYC Verification
    │  ├─ emit KYCVerified(address)
    │  └─ emit KYCRevoked(address)
    │
    ├─ Loan Creation
    │  └─ emit LoanCreated(loanId, borrower, amount)
    │
    ├─ Loan Funding
    │  ├─ emit LoanFunded(loanId, lender, amount)
    │  └─ [If 100% funded]
    │     └─ emit LoanActivated(loanId)
    │
    ├─ Loan Repayment
    │  ├─ emit LoanRepaid(loanId, borrower, amount)
    │  └─ emit ReputationUpdated(borrower, newScore)
    │
    ├─ Loan Default
    │  ├─ emit LoanDefaulted(loanId)
    │  └─ emit ReputationUpdated(borrower, newScore)
    │
    └─ Fee Withdrawal
       └─ emit PlatformFeeWithdrawn(owner, amount)

Events Captured By
    ├─ Frontend (Web3 listener)
    ├─ Indexing Service (TheGraph)
    ├─ Analytics Platform
    └─ Monitoring Dashboard
```

---

## 📊 Typical Loan Timeline

```
Day 0: Loan Created
├─ Funding Period Starts
├─ Status: FUNDING
└─ Deadline: Day 30

Days 1-29: Funding Phase
├─ Investors contribute
├─ Progress tracked
└─ Auto-activation when 100%

[At 100% Funded - any day]
├─ Status → ACTIVE
├─ Funds released to borrower
├─ Repayment deadline = now + duration
└─ Interest accrues

Repayment Period (0 - duration days)
├─ Borrower awaits funds usage
├─ Interest continues to accrue
└─ Ready to repay

Day N: Repayment Due
├─ Status: ACTIVE
└─ Must repay by this date

[If Repaid On Time]
├─ Borrower sends principal + interest
├─ Distributed to lenders by share
├─ Status → REPAID
├─ Reputation +5
└─ Event: LoanRepaid

[If Not Repaid]
├─ Admin marks as defaulted (after deadline)
├─ Status → DEFAULTED
├─ Reputation -10
├─ Lenders lose invested amount
└─ Event: LoanDefaulted

Final: Loan Lifecycle Complete
└─ Recorded on blockchain forever
```

---

## 🎯 Contract Interaction Sequence

### Complete Loan Cycle Sequence Diagram

```
User A (Borrower)    User B (Lender)    Contract    Admin
       │                  │                 │         │
       │ registerUser()    │                 │         │
       ├─────────────────────────────────────>│         │
       │                  │                 │         │
       │ [await verification]         ┌──────>│ verifyKYC
       │                  │           │       │     ↓
       │                  │           │       │<─────┘
       │                  │           │       │
       │ createLoan()     │           │       │
       ├─────────────────────────────────────>│
       │<─────────────────────────────────────┤ return loanId=1
       │                  │ fundLoan()│       │
       │                  ├──────────────────>│
       │                  │           │ [100%]│
       │                  │           │ funded│
       │<──────────────────────────── emit LoanActivated
       │<─ receive 0.98 ETH
       │                  │           │       │
       │ repayLoan()      │           │       │
       ├─────────────────────────────────────>│
       │                  │<────────────────── distribute payout
       │                  │ receive 0.525 ETH │
       │ [reputation+5]   │           │       │
       │                  │           │       │
       └──────────────────┴─────────────────────
```

---

**MicroFund Architecture Diagram v1.0**  
**Complete System Design and Data Flow**  
Status: ✅ Ready for Implementation
