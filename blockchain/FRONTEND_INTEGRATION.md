# Frontend Integration Guide

This document explains how to integrate the MicroFund smart contract with the frontend application.

## Prerequisites

- Deployed MicroFund contract address
- Contract ABI (located in `abi/MicroFund.json`)
- User with test ETH/MATIC
- Web3 wallet (MetaMask, WalletConnect, etc.)

## Setup Steps

### 1. Save Contract Address

After deployment, add the contract address to frontend environment variables:

```env
# .env.local or .env
NEXT_PUBLIC_MICROFUND_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_MICROFUND_CHAIN_ID=11155111  # Sepolia
# or
NEXT_PUBLIC_MICROFUND_CHAIN_ID=80002     # Polygon Amoy
```

### 2. Export Contract ABI

Generate the ABI for frontend use:

```bash
cd blockchain
npm run compile  # If not already compiled
npx ts-node scripts/generateABI.ts
```

This creates `blockchain/abi/MicroFund.json`

### 3. Copy ABI to Frontend

```bash
cp blockchain/abi/MicroFund.json ../public/abi/
# or
cp blockchain/abi/MicroFund.ts ../lib/
```

## Contract Interaction Examples

### Initialize Web3 Connection

```typescript
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MICROFUND_CONTRACT_ADDRESS!;
const CONTRACT_ABI = require('@/public/abi/MicroFund.json');

export async function getContract() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { contract, provider, signer };
}
```

### User Registration (Admin)

```typescript
async function registerUser(userAddress: string, username: string) {
  const { contract } = await getContract();
  
  const tx = await contract.registerUser(userAddress, username);
  const receipt = await tx.wait();
  
  return receipt;
}

async function verifyKYC(userAddress: string) {
  const { contract } = await getContract();
  
  const tx = await contract.verifyKYC(userAddress);
  const receipt = await tx.wait();
  
  return receipt;
}
```

### Get User Information

```typescript
async function getUserInfo(userAddress: string) {
  const { contract } = await getContract();
  
  const user = await contract.getUser(userAddress);
  
  return {
    username: user.username,
    isKycVerified: user.isKycVerified,
    reputationScore: user.reputationScore.toString(),
    totalBorrowed: ethers.formatEther(user.totalBorrowed),
    totalRepaid: ethers.formatEther(user.totalRepaid),
    defaultCount: user.defaultCount.toNumber(),
  };
}
```

### Create a Loan

```typescript
async function createLoan(
  amount: string,        // in ETH
  interestRate: number,  // e.g., 5 for 5%
  durationDays: number,
  purpose: string
) {
  const { contract } = await getContract();
  
  const amountWei = ethers.parseEther(amount);
  const durationSeconds = durationDays * 24 * 60 * 60;
  const interestRateBasisPoints = interestRate * 100; // Convert to basis points
  
  const tx = await contract.createLoan(
    amountWei,
    interestRateBasisPoints,
    durationSeconds,
    purpose
  );
  
  const receipt = await tx.wait();
  return receipt;
}
```

### Fund a Loan

```typescript
async function fundLoan(loanId: number, amount: string) {
  const { contract } = await getContract();
  
  const amountWei = ethers.parseEther(amount);
  
  const tx = await contract.fundLoan(loanId, {
    value: amountWei,
  });
  
  const receipt = await tx.wait();
  return receipt;
}
```

### Repay a Loan

```typescript
async function repayLoan(loanId: number, repaymentAmount: string) {
  const { contract } = await getContract();
  
  const amountWei = ethers.parseEther(repaymentAmount);
  
  const tx = await contract.repayLoan(loanId, {
    value: amountWei,
  });
  
  const receipt = await tx.wait();
  return receipt;
}
```

### Get Loan Details

```typescript
async function getLoanDetails(loanId: number) {
  const { contract } = await getContract();
  
  const loan = await contract.getLoan(loanId);
  
  const statusMap = ['Funding', 'Active', 'Repaid', 'Defaulted'];
  
  return {
    id: loan.id.toString(),
    borrower: loan.borrower,
    amount: ethers.formatEther(loan.amount),
    interestRate: (loan.interestRate / 100).toString() + '%',
    duration: loan.duration.toString() + ' seconds',
    purpose: loan.purpose,
    status: statusMap[loan.status],
    amountFunded: ethers.formatEther(loan.amountFunded),
    createdAt: new Date(Number(loan.createdAt) * 1000),
    fundingDeadline: new Date(Number(loan.fundingDeadline) * 1000),
  };
}
```

### Listen to Events

```typescript
async function listenToLoanEvents() {
  const { contract } = await getContract();
  
  // Listen to loan creation
  contract.on('LoanCreated', (loanId, borrower, amount, interestRate, duration) => {
    console.log('New loan created:', {
      loanId: loanId.toString(),
      borrower,
      amount: ethers.formatEther(amount),
      interestRate: interestRate.toString(),
      duration: duration.toString(),
    });
  });
  
  // Listen to loan funding
  contract.on('LoanFunded', (loanId, lender, amount) => {
    console.log('Loan funded:', {
      loanId: loanId.toString(),
      lender,
      amount: ethers.formatEther(amount),
    });
  });
  
  // Listen to reputation updates
  contract.on('ReputationUpdated', (user, newScore) => {
    console.log('Reputation updated:', {
      user,
      newScore: newScore.toString(),
    });
  });
}
```

## React Hooks Example

```typescript
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export function useMicroFund() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        
        const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MICROFUND_CONTRACT_ADDRESS!;
        const CONTRACT_ABI = require('@/public/abi/MicroFund.json');
        
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        
        setContract(contract);
        setSigner(signer);
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Failed to initialize contract:', error);
      }
    };

    init();
  }, []);

  return { contract, signer, account };
}
```

## Testing the Integration

1. **Connect Wallet**: Test wallet connection and account selection
2. **Verify User**: Register and verify a test user
3. **Create Loan**: Create a test loan with proper parameters
4. **Fund Loan**: Fund the loan from another account
5. **Repay Loan**: Repay the loan and verify funds distribution
6. **Check Reputation**: Verify reputation score updates

## Common Issues

### "User not verified"
- Make sure user has been registered and KYC verified by admin
- Only verified users can create loans

### "Insufficient funds"
- Ensure account has enough ETH/MATIC for gas + transaction
- Get test tokens from faucet

### "Network mismatch"
- Verify MetaMask is connected to correct testnet
- Check `NEXT_PUBLIC_MICROFUND_CHAIN_ID` matches network

### "Contract not found"
- Verify contract address is correct
- Check contract is deployed on the network you're connecting to

## Best Practices

1. **Always handle errors** in contract calls
2. **Show loading states** during transactions
3. **Verify user is connected** before contract interaction
4. **Check network** matches expected chain
5. **Use ethers v6** for type safety
6. **Implement event listeners** for real-time updates
7. **Cache contract instance** to avoid recreating
8. **Validate inputs** before sending to contract

## Deployment Addresses

Add these to your environment after deploying to testnets:

```env
# Sepolia Testnet
NEXT_PUBLIC_MICROFUND_SEPOLIA_ADDRESS=0x...

# Polygon Amoy Testnet
NEXT_PUBLIC_MICROFUND_POLYGON_ADDRESS=0x...
```

---

For more details, see the main `README.md` and `DEPLOYMENT_GUIDE.md`.
