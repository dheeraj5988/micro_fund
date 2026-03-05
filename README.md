# 🏦 MicroFund - P2P Microfinance Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Sepolia](https://img.shields.io/badge/Ethereum-Sepolia-627EEA?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **A transparent, blockchain-powered peer-to-peer microfinance ecosystem that bridges traditional lending with Web3 technology.**

**SRMIST Major Project** | Under the Guidance of **Dr. K. Priyadarsini**, Associate Professor

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Smart Contract](#-smart-contract)
- [Demo Walkthrough](#-demo-walkthrough)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**MicroFund** is a hybrid Web2.5 platform that revolutionizes microfinance by combining:

- **Blockchain Transparency**: All financial transactions recorded on Ethereum Sepolia
- **Privacy-First KYC**: Sensitive identity data stored off-chain in compliance with data protection regulations
- **Reputation-Based Trust**: Dynamic scoring system that rewards good borrowers with better rates
- **Crowdfunding Model**: Multiple lenders can fund a single loan, distributing risk

### Why MicroFund?

Traditional microfinance platforms suffer from:
- ❌ Opaque transaction records
- ❌ High intermediary fees (20-30%)
- ❌ Limited borrower trust signals
- ❌ Slow cross-border transfers

**MicroFund solves these problems through:**
- ✅ Immutable on-chain loan records
- ✅ Low transaction fees on Ethereum Sepolia testnet
- ✅ Built-in reputation system
- ✅ Instant blockchain settlements

---

## ✨ Key Features

### 🔐 Wallet-Based Authentication
- Seamless MetaMask integration
- Automatic network switching to Polygon Sepolia
- Real-time balance tracking

### 📝 Hybrid KYC System
- **Off-Chain Storage**: Aadhar and personal data stored in local database
- **On-Chain Verification**: Green tick status reflected in smart contract
- **Admin Portal**: Manual verification workflow for compliance

### ⭐ Reputation Scoring
- **Starting Score**: 500 points
- **Incremental Growth**: +50 per successfully repaid loan
- **Future Integration**: Score-based interest rate discounts

### 💰 Smart Loan Management
- **Crowdfunding**: Multiple lenders fund one loan
- **Overfunding Protection**: Excess contributions automatically refunded
- **Proportional Repayment**: Lenders receive returns based on contribution percentage

### 🎨 Modern UI/UX
- Responsive design (mobile-first)
- Real-time transaction status updates
- Interactive loan discovery interface

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MicroFund Platform                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
│   Frontend     │  │  Smart       │  │   Off-Chain    │
│   (Next.js)    │◄─┤  Contract    │  │   Database     │
│                │  │  (Solidity)  │  │   (JSON/SQL)   │
└────────────────┘  └──────────────┘  └────────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                   ┌────────▼─────────┐
                   │ Ethereum Sepolia │
                   │ Testnet          │
                   └──────────────────┘
```

### Data Flow

1. **User Registration**:
   ```
   User → Frontend → API Route → users.json (Off-Chain)
   ```

2. **Admin Verification**:
   ```
   Admin Portal → PATCH /api/kyc/verify → Update users.json → UI Reflects ✅
   ```

3. **Loan Creation**:
   ```
   Borrower → Smart Contract → On-Chain Record + Emit Event
   ```

4. **Loan Funding**:
   ```
   Lender → fundLoan() → ETH Transfer → Update Funding Status
   ```

5. **Repayment Distribution**:
   ```
   Borrower → repayLoan() → Proportional Split → All Lenders Receive ETH
   ```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Hooks (useState, useEffect)
- **Icons**: Lucide React

### Blockchain
- **Network**: Polygon Sepolia Testnet
- **Smart Contract**: Solidity ^0.8.20
- **Interaction**: Ethers.js v6
- **Wallet**: MetaMask

### Backend
- **API Routes**: Next.js API Routes
- **Database**: Local JSON Storage (Development)
- **Future**: Prisma + PostgreSQL (Production)

### DevOps
- **Version Control**: Git + GitHub
- **Package Manager**: npm/yarn
- **Deployment**: Vercel (Planned)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0 or higher
- **MetaMask**: Browser extension installed
- **Ethereum Sepolia ETH**: Get testnet tokens from public Sepolia faucets (for example via Alchemy, Infura, or sepoliafaucet.com)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/dheeraj5988/micro_fund.git
   cd micro_fund
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Setup Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressOnSepolia
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

4. **Initialize Data Directory**
   ```bash
   mkdir data
   touch data/users.json data/loans.json data/admin.json
   ```

5. **Add Sample Data** (Optional)
   
   Copy this into `data/users.json`:
   ```json
   {
     "users": [
       {
         "walletAddress": "0x1234567890123456789012345678901234567890",
         "firstName": "Dheeraj",
         "lastName": "Sharma",
         "aadharNumber": "1234-5678-9012",
         "isVerified": true,
         "reputationScore": 550,
         "registeredAt": "2024-01-05T10:00:00Z"
       }
     ]
   }
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```

7. **Open Application**
   ```
   Navigate to http://localhost:3000
   ```

### MetaMask Configuration

1. Add Ethereum Sepolia Network:
   - **Network Name**: Ethereum Sepolia
   - **RPC URL**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - **Chain ID**: `11155111`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://sepolia.etherscan.io/`

2. Get Testnet Tokens:
   - Use a public Sepolia faucet (Alchemy, Infura, or similar)
   - Enter your wallet address
   - Receive free testnet ETH

---

## 📁 Project Structure

```
micro_fund/
├── app/
│   ├── layout.tsx              # Root layout with persistent footer
│   ├── page.tsx                # Landing page
│   ├── register/
│   │   └── page.tsx            # KYC registration form
│   ├── loans/
│   │   └── page.tsx            # Loan discovery interface
│   └── admin/
│       └── page.tsx            # Admin verification dashboard
├── components/
│   ├── Navbar.tsx              # Header with wallet connect
│   ├── Footer.tsx              # Team credits footer
│   ├── WalletButton.tsx        # MetaMask connection component
│   ├── LoanCard.tsx            # Individual loan display
│   ├── ReputationBadge.tsx     # Score indicator
│   └── KYCForm.tsx             # Registration form
├── hooks/
│   └── useWallet.ts            # Custom wallet connection hook
├── lib/
│   ├── contract.ts             # Smart contract interaction logic
│   └── utils.ts                # Helper functions
├── data/                       # Local JSON database
│   ├── users.json              # KYC records
│   ├── loans.json              # Loan metadata
│   └── admin.json              # Admin credentials
├── contracts/
│   └── MicroLend.sol           # Solidity smart contract
├── public/
│   └── assets/                 # Images and icons
├── styles/
│   └── globals.css             # Global styles + Tailwind
├── .env.local                  # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📜 Smart Contract

### MicroLend.sol Overview

**Location**: `/contracts/MicroLend.sol`

**Core Functions**:

```solidity
// Create a new loan request
function createLoan(
    uint256 _amount,
    uint256 _interestRate,
    uint256 _duration,
    string memory _purpose
) external

// Fund an existing loan
function fundLoan(uint256 _loanId) external payable

// Repay loan with interest
function repayLoan(uint256 _loanId) external payable

// View loan details
function getLoanById(uint256 _loanId) external view returns (Loan memory)
```

**Key Features**:
- ✅ Multi-lender crowdfunding support
- ✅ Overfunding protection (automatic refunds)
- ✅ Proportional interest distribution
- ✅ Loan state machine (PENDING → FUNDED → REPAID/DEFAULTED)

### Deployment

```bash
# Compile contract
npx hardhat compile

# Deploy to Polygon Sepolia
npx hardhat run scripts/deploy.ts --network polygonSepolia

# Verify on Polygonscan
npx hardhat verify --network polygonSepolia DEPLOYED_CONTRACT_ADDRESS
```

---

## 🎬 Demo Walkthrough

### 50% MVP Features

#### 1️⃣ **Connect Wallet**
- Click "Connect Wallet" in navbar
- Approve MetaMask connection
- See address and balance displayed

#### 2️⃣ **Register as Borrower**
- Navigate to `/register`
- Fill KYC form:
  - First Name: Dheeraj
  - Last Name: Sharma
  - Aadhar: 1234-5678-9012
- Submit → Data saved to `users.json`

#### 3️⃣ **Admin Verification**
- Go to `/admin`
- Enter password: `admin@microfund2024`
- See pending KYC request
- Click "Approve" → Green tick ✅ activated

#### 4️⃣ **Browse Loans**
- Visit `/loans`
- See verified borrowers with ✅
- Check reputation scores (500-600 range)
- View funding progress bars

#### 5️⃣ **Smart Contract Data**
- Each loan shows real-time funding status
- Pulled from contract view functions
- Example: "0.2 / 0.5 ETH Funded (40%)"

---

## 🗺️ Roadmap

### Phase 1: Foundation (Current - 50% Complete)
- [x] Wallet authentication
- [x] KYC registration system
- [x] Admin verification portal
- [x] Loan discovery interface
- [x] Basic smart contract integration
- [x] Reputation scoring framework

### Phase 2: Core Features (Next 3 Months)
- [ ] Complete smart contract deployment
- [ ] Loan creation workflow
- [ ] Loan funding mechanism
- [ ] Repayment tracking
- [ ] Database migration (JSON → PostgreSQL)
- [ ] Email notifications

### Phase 3: Advanced Features (Months 4-6)
- [ ] Multi-signature wallet support
- [ ] Collateral management system
- [ ] Credit score algorithm (v2)
- [ ] Dispute resolution mechanism
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

### Phase 4: Production (Months 7-9)
- [ ] Security audit
- [ ] Mainnet deployment (Polygon PoS)
- [ ] Legal compliance framework
- [ ] Partnership integrations
- [ ] Marketing campaign
- [ ] User onboarding program

---

## 👥 Team

### Project Lead & Developer
**Dheeraj Sharma**  
📧 ds5988@srmist.edu.in  
🔗 [GitHub](https://github.com/dheeraj5988) | [LinkedIn]([https://www.linkedin.com/in/dheeraj-sharma-97251120b/])  
*Registration No: RA2211027010017*

### Collaborators

**Srijita Seth**  
📧 ss1234@srmist.edu.in  
*Registration No: RA2211027010036*  
*Contributions*: Frontend Development, UI/UX Design

**Piyush Mishra**  
📧 pm5678@srmist.edu.in  
*Registration No: RA2211027010038*  
*Contributions*: Smart Contract Testing, Documentation

### Faculty Guide

**Dr. K. Priyadarsini**  
Associate Professor  
Department of Computer Science and Engineering  
SRM Institute of Science and Technology  
📧 priyadak@srmist.edu.in

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Issues
1. Check existing [Issues](https://github.com/dheeraj5988/micro_fund/issues)
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Submitting Pull Requests
1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit changes:
   ```bash
   git commit -m "Add: Your feature description"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request with detailed description

### Code Style Guidelines
- Use TypeScript for all new files
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for API changes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Dheeraj Sharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Acknowledgments

- **SRM Institute of Science and Technology** for providing the opportunity to work on this major project
- **Dr. K. Priyadarsini** for guidance and mentorship throughout development
- **Polygon Team** for excellent developer documentation and testnet resources
- **Ethers.js Community** for robust Web3 libraries
- **Vercel** for hosting and deployment infrastructure

---

## 📞 Contact & Support

### Project Repository
🔗 https://github.com/dheeraj5988/micro_fund

### Report Issues
🐛 [GitHub Issues](https://github.com/dheeraj5988/micro_fund/issues)

### Email Support
📧 ds5988@srmist.edu.in

### Documentation
📚 [Wiki](https://github.com/dheeraj5988/micro_fund/wiki)

---

## ⚠️ Disclaimer

**This is an academic project developed for educational purposes as part of the SRMIST Major Project curriculum.**

- ⚠️ **DO NOT use real Aadhar numbers or personal information**
- ⚠️ **This platform is deployed on testnet only**
- ⚠️ **Not intended for production use without proper security audits**
- ⚠️ **All transactions use test tokens with no real-world value**

For production deployment, consult legal and cybersecurity professionals.

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=dheeraj5988/micro_fund&type=Date)](https://star-history.com/#dheeraj5988/micro_fund&Date)

---

<div align="center">

**Built with ❤️ by Team MicroFund**

*Empowering financial inclusion through blockchain technology*

[🌐 Website](https://microfund.vercel.app) • [📖 Docs](https://github.com/dheeraj5988/micro_fund/wiki) • [💬 Discord](https://discord.gg/microfund)

</div>
