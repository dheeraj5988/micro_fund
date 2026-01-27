# MicroFund Smart Contract Deployment Guide

## Overview
The MicroFund smart contract is now ready to be deployed on Sepolia Testnet (Ethereum). This guide walks you through the deployment process and integration with your frontend.

## Prerequisites
- Private key with testnet ETH (Sepolia)
- RPC endpoint for Sepolia
- Environment variables configured in Vercel

## Environment Variables Required

Set these in your Vercel project settings:

```
PRIVATE_KEY=your_wallet_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Contract Features

### Core Functionalities:
1. **User Registration & KYC Verification**
   - Self-registration with username
   - Admin KYC verification
   - Reputation scoring system

2. **Loan Management**
   - Create loans with specified amount, interest rate, and duration
   - Fund loans with escrow protection
   - Repay loans with automatic interest calculation
   - Default handling with reputation penalties

3. **Investor Protection**
   - Only verified users can participate
   - Platform fee collection (2% by default)
   - Lender payout distribution based on contribution
   - Non-reentrant guards on critical functions

4. **Platform Administration**
   - Fee management and withdrawal
   - KYC verification control
   - Loan default marking
   - Adjustable platform fee percentage

## Contract Structure

### Key Events:
- `UserRegistered`: Emitted when user registers
- `KYCVerified/KYCRevoked`: Emitted on KYC status changes
- `LoanCreated`: Emitted when loan is created
- `LoanFunded`: Emitted when loan receives funding
- `LoanActivated`: Emitted when loan is fully funded
- `LoanRepaid`: Emitted when loan is repaid with interest
- `LoanDefaulted`: Emitted when loan defaults
- `ReputationUpdated`: Emitted on reputation changes
- `PlatformFeeWithdrawn`: Emitted on fee withdrawal

### Key Functions:

#### User Functions
```solidity
registerUser(string _username) - Register with username
```

#### Loan Functions
```solidity
createLoan(uint256 _amount, uint256 _interestRate, uint256 _duration, string _purpose)
fundLoan(uint256 _loanId) - Fund a loan (payable)
repayLoan(uint256 _loanId) - Repay loan with interest (payable)
```

#### View Functions
```solidity
getLoan(uint256 _loanId) - Get loan details
getUser(address _userAddress) - Get user info
getLoanFunders(uint256 _loanId) - Get all funders
getLoanFunderShare(uint256 _loanId, address _lender) - Get funder's share
```

#### Admin Functions
```solidity
verifyKYC(address _user) - Verify user KYC
revokeKYC(address _user) - Revoke KYC
markLoanDefaulted(uint256 _loanId) - Mark loan as defaulted
withdrawPlatformFees() - Withdraw collected fees
setPlatformFeePercentage(uint256 _feePercentage) - Set fee %
```

## Deployment Steps

### 1. Get Test ETH
- Visit [Sepolia Faucet](https://www.sepoliaetherscan.io/)
- Get free Sepolia ETH for testing

### 2. Run Deployment
From the blockchain directory:

```bash
npm run deploy:sepolia
```

This will:
- Compile the contract
- Deploy to Sepolia testnet
- Verify on Etherscan (if API key provided)
- Display contract address

### 3. Save Contract Address
After successful deployment, you'll see output like:

```
MicroFund Address: 0x1234567890123456789012345678901234567890
```

**Save this address** - you'll need it for frontend integration.

## Contract Address on Sepolia

Once deployed, your contract will be available at:
`https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`

## Frontend Integration

Update `/lib/contract.ts` with your deployed contract address:

```typescript
export const MICROFUND_CONTRACT_ADDRESS = "0x..."; // Your deployed address
```

## Testing on Testnet

### 1. Register User
```javascript
await contract.registerUser("john_doe");
```

### 2. Admin Verify KYC (by owner)
```javascript
await contract.verifyKYC(userAddress);
```

### 3. Create Loan
```javascript
await contract.createLoan(
  ethers.parseEther("1.0"),  // 1 ETH
  500,                        // 5% interest (500/10000)
  30 * 24 * 60 * 60,          // 30 days
  "Business expansion"
);
```

### 4. Fund Loan
```javascript
await contract.fundLoan(loanId, { value: ethers.parseEther("1.0") });
```

### 5. Repay Loan
```javascript
const interest = (loanAmount * interestRate) / 10000;
const totalRepayment = loanAmount + interest;
await contract.repayLoan(loanId, { value: totalRepayment });
```

## Security Features Implemented

1. **ReentrancyGuard**: Protects against reentrancy attacks
2. **Ownable**: Restricts admin functions
3. **onlyVerifiedUser Modifier**: KYC requirement
4. **Escrow System**: Funds only released when fully funded
5. **Safe Transfer Pattern**: Uses `call` instead of `transfer`
6. **Input Validation**: Comprehensive require statements

## Monitoring

Check your contract activity at:
- **Sepolia Etherscan**: https://sepolia.etherscan.io/address/YOUR_ADDRESS
- **Transaction Logs**: View all interactions with your contract
- **Holder Count**: Track number of active users

## Troubleshooting

### Deployment Fails
- Ensure PRIVATE_KEY is valid and has Sepolia ETH
- Check SEPOLIA_RPC_URL is correct
- Verify environment variables are set

### Verification Fails
- Wait 30 seconds after deployment before verification
- Ensure constructor arguments match deployment
- Check Etherscan API key is valid

### Low on Gas?
- Get more Sepolia ETH from the faucet
- Reduce gas price in hardhat.config if needed

## Next Steps

1. ✅ Deploy contract
2. ✅ Update frontend with contract address
3. ✅ Test all functions on testnet
4. ✅ Conduct security audit (recommended)
5. ✅ Deploy to mainnet (when ready)

## Support

For issues or questions:
- Check Sepolia Etherscan for transaction details
- Review contract events for debugging
- Verify all parameters before transactions
