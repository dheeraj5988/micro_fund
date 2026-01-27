# MicroFund Smart Contracts

This directory contains the Solidity smart contracts for the MicroFund decentralized lending platform.

## Project Structure

```
blockchain/
├── contracts/
│   └── MicroFund.sol       # Main smart contract
├── scripts/
│   └── deploy.ts           # Deployment script
├── test/
│   └── MicroFund.test.ts   # Test suite
├── hardhat.config.ts       # Hardhat configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies
└── .env.example            # Environment variables template
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd blockchain
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

You'll need:
- **PRIVATE_KEY**: Your wallet's private key (from MetaMask or similar)
- **SEPOLIA_RPC_URL**: RPC endpoint for Sepolia testnet (get from [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/))
- **POLYGON_AMOY_RPC_URL**: RPC endpoint for Polygon Amoy testnet
- **ETHERSCAN_API_KEY**: For contract verification on Etherscan
- **POLYGONSCAN_API_KEY**: For contract verification on Polygonscan

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm run test
```

## Deployment

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

### Deploy to Polygon Amoy Testnet

```bash
npm run deploy:polygon
```

### Deploy to Local Hardhat Network

```bash
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.ts --network localhost
```

## Contract Functions

### Admin Functions (Owner Only)

- **registerUser(address, username)**: Register a new user
- **verifyKYC(address)**: Verify KYC for a user
- **revokeKYC(address)**: Revoke KYC verification
- **withdrawPlatformFees()**: Withdraw accumulated platform fees

### Core Functions (KYC Verified Users)

- **createLoan(amount, interestRate, duration, purpose)**: Create a new loan request
- **fundLoan(loanId)**: Fund an existing loan (payable)
- **repayLoan(loanId)**: Repay a loan (payable)
- **markLoanDefaulted(loanId)**: Mark a loan as defaulted after deadline

### View Functions

- **getLoan(loanId)**: Get loan details
- **getUser(address)**: Get user information
- **getLoanFunders(loanId)**: Get array of lenders for a loan

## Key Features

- **KYC Verification**: Only verified users can create loans
- **Reputation System**: Users earn/lose reputation based on loan performance
  - +5 points for successful repayment
  - -10 points for default
  - Default score: 50, Max: 100
- **Peer-to-Peer Lending**: Direct lender-to-borrower funding
- **Interest Rates**: Configurable interest rates per loan (in basis points)
- **Platform Fees**: 2% fee on all funded amounts
- **Proportional Repayment**: Lenders receive repayment proportional to their investment

## Gas Optimization

The contract includes:
- ReentrancyGuard for security
- Optimized storage usage
- Batch operations where possible

## Security Considerations

- The contract uses OpenZeppelin's battle-tested libraries
- Reentrancy protection on critical functions
- Input validation on all external functions
- Only verified users can participate

## License

MIT
