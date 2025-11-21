# 🏦 S-Bank - Decentralized Savings Platform

> **Empowering Communities Through Blockchain-Based Savings**

A comprehensive decentralized savings platform built on Sui blockchain, featuring group rotating savings (Susu), personal piggy banks, reputation tracking, and NFT rewards. Built for the Sui Hackathon.

[![Built on Sui](https://img.shields.io/badge/Built%20on-Sui-4DA2FF?style=for-the-badge&logo=sui&logoColor=white)](https://sui.io/)
[![Powered by Walrus](https://img.shields.io/badge/Powered%20by-Walrus-00D4AA?style=for-the-badge)](https://walrus.site/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)

---

## 🎯 Hackathon Submission

### Problem Statement
Traditional savings methods exclude billions of people worldwide due to:
- Lack of access to formal banking systems
- High minimum balance requirements
- Limited financial literacy support
- No incentive mechanisms for consistent saving
- Absence of community-based savings solutions

### Our Solution
S-Bank leverages Sui blockchain and Walrus storage to create a decentralized, accessible, and incentivized savings platform that:
- ✅ Enables community-based rotating savings (Susu/ROSCA)
- ✅ Provides personal savings accounts (Piggy Banks) with no minimum balance
- ✅ Tracks and rewards good savings behavior with reputation scores
- ✅ Issues NFT achievements for milestones
- ✅ Operates transparently on-chain with verifiable transactions
- ✅ Stores NFT assets on decentralized Walrus storage

---

## ✨ Key Features

### 🔄 Group Susu (Rotating Savings & Credit Association)
Traditional community savings reimagined on blockchain:
- **Create Groups**: Set contribution amount, frequency, and participant limit
- **Join Groups**: Discover and join existing savings groups
- **Contribute**: Make regular contributions tracked on-chain
- **Receive Payouts**: Automated round distribution to members
- **Complete Cycles**: Transparent cycle completion with reputation rewards

### 🐷 Piggy Bank (Personal Savings)
Digital piggy banks with goals and tracking:
- **Create Banks**: Set savings goals and target amounts
- **Deposit Anytime**: Add funds whenever you want
- **Track Progress**: Real-time balance and goal tracking
- **Break When Ready**: Withdraw funds when goal is reached
- **Multiple Banks**: Create unlimited piggy banks for different goals

### ⭐ Reputation System
Gamified savings behavior tracking:
- **Reputation Profiles**: On-chain identity for savings behavior
- **Point System**: Earn points for contributions and milestones
  - +10 points for on-time contributions
  - +5 points for late contributions
  - +100 points for cycle completion
- **Milestone Tracking**: Track cycles completed and contribution history
- **Encrypted Data**: Privacy-preserving contribution history using Seal

### 🏆 NFT Rewards
Achievement NFTs stored on Walrus:
- **Cycle Completion** 🏆 - Complete your first savings cycle
- **5 Cycles Milestone** ⭐ - Complete 5 savings cycles
- **10 Cycles Milestone** ⚡ - Complete 10 savings cycles
- **Perfect Attendance** 🎯 - Make 10+ on-time contributions
- **Decentralized Storage**: All NFT images and metadata on Walrus
- **Shareable Profiles**: Public profile pages with NFT galleries

### 👨‍💼 Admin Dashboard
Platform management and oversight:
- **Mint NFTs**: Award achievement NFTs to deserving users
- **Platform Stats**: Real-time metrics and analytics
- **User Management**: View and manage platform users
- **Access Control**: Secure admin capabilities via AdminCap

---

## 🏗️ Technical Architecture

### Blockchain Layer (Sui)
- **Smart Contracts**: Written in Move language
- **Modules**:
  - `group_susu` - Rotating savings group logic
  - `reputation` - User reputation tracking
  - `nft_rewards` - Achievement NFT minting
  - `admin` - Platform administration
- **Objects**: Owned and shared objects for efficient state management
- **Events**: Comprehensive event emission for indexing and history

### Storage Layer (Walrus)
- **NFT Images**: Decentralized image storage
- **Metadata**: JSON metadata for NFT attributes
- **HTTP API**: Direct integration with Walrus aggregator/publisher
- **Epochs**: Configurable storage duration

### Frontend Layer
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **TailwindCSS**: Responsive design system
- **React Query**: Optimized data fetching and caching
- **Sui dApp Kit**: Wallet integration and blockchain interaction

---

## 🚀 Live Demo

### Testnet Deployment
- **Network**: Sui Testnet
- **Package ID**: `0x2ff43a0f54a1f023ae03ae3afd3eefebb7dcd2ac684889ef0349ea52d1213ce1`
- **Explorer**: [View on Suiscan](https://suiscan.xyz/testnet/object/0x2ff43a0f54a1f023ae03ae3afd3eefebb7dcd2ac684889ef0349ea52d1213ce1)

### Try It Out
1. Install [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil)
2. Get testnet SUI from [faucet](https://discord.com/channels/916379725201563759/971488439931392130)
3. Visit our [demo site](#) (add your deployment URL)
4. Connect wallet and start saving!

---

## 📊 System Architecture

For detailed architecture diagrams and technical documentation, see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

### High-Level Overview
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│ Sui Blockchain│────▶│   Walrus    │
│   (React)   │     │  (Move Smart  │     │  (Storage)  │
│             │◀────│   Contracts)  │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
      │                     │                     │
      │                     │                     │
      ▼                     ▼                     ▼
  User Actions      State Changes         NFT Assets
```

---

## 🛠️ Technology Stack

### Blockchain
- **Sui Blockchain** - High-performance Layer 1
- **Move Language** - Safe and expressive smart contracts
- **@mysten/sui** (v1.45.0) - Sui TypeScript SDK
- **@mysten/dapp-kit** (v0.19.9) - Wallet integration

### Storage
- **Walrus** - Decentralized blob storage
- **HTTP API** - Direct Walrus integration
- **@mysten/walrus** (v0.8.4) - Walrus SDK

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data management
- **React Router** - Navigation
- **Lucide Icons** - Icon library

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Strict Mode** - Enhanced type checking

---

## 🚀 Quick Start

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
sui >= 1.0.0
```

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/s_bank.git
cd s_bank

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Deploy Smart Contracts
```bash
cd move/counter
sui move build
sui client publish --gas-budget 100000000
```

### Build for Production
```bash
npm run build
npm run preview  # Test production build
```

---

## 📖 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[System Architecture](./SYSTEM_ARCHITECTURE.md)** - Technical deep dive with diagrams
- **[Deployment Guide](./DEPLOYMENT_CHECKLIST.md)** - Complete deployment instructions
- **[Walrus Integration](./docs/WARUS_SDK.md)** - Walrus storage guide

---

## 🎮 Usage Examples

### Create a Savings Group
```typescript
// User creates a group with custom parameters
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::group_susu::create_group`,
  arguments: [
    tx.pure.string("Monthly Savings"),
    tx.pure.u64(1000000000), // 1 SUI per contribution
    tx.pure.u64(2592000000), // 30 days frequency
    tx.pure.u64(10), // Max 10 participants
    tx.object(platformConfig),
    tx.object(clock),
  ],
});
```

### Make a Contribution
```typescript
// User contributes to their group
const tx = new Transaction();
const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
tx.moveCall({
  target: `${packageId}::group_susu::contribute`,
  arguments: [
    tx.object(groupId),
    coin,
    tx.object(clock),
  ],
});
```

### Mint Achievement NFT
```typescript
// Admin mints NFT for user achievement
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::nft_rewards::mint_nft`,
  arguments: [
    tx.object(adminCap),
    tx.object(nftCollection),
    tx.pure.address(recipient),
    tx.pure.u8(achievementType),
    tx.pure.string(imageUrl), // Walrus blob ID
    tx.pure.string(metadataUrl), // Walrus blob ID
    tx.object(clock),
  ],
});
```

---

## 🎯 Hackathon Highlights

### Innovation
- **First** decentralized ROSCA implementation on Sui
- **Novel** reputation system with encrypted contribution history
- **Seamless** Walrus integration for NFT storage
- **Gamified** savings with achievement NFTs

### Technical Excellence
- **Type-safe** end-to-end with TypeScript and Move
- **Optimized** query caching with React Query
- **Network-aware** configuration for multi-network support
- **Comprehensive** error handling and loading states
- **Responsive** design for mobile and desktop

### User Experience
- **Intuitive** interface for complex blockchain operations
- **Real-time** updates with optimistic UI
- **Shareable** profile pages with public NFT galleries
- **Transparent** on-chain transactions with explorer links

### Code Quality
- **Well-documented** with inline comments
- **Modular** architecture with reusable components
- **Tested** manually across all features
- **Production-ready** with build optimization

---

## 📈 Impact & Use Cases

### Financial Inclusion
- Enable savings for unbanked populations
- Provide transparent group savings mechanisms
- Remove barriers to entry (no minimum balance)

### Community Building
- Foster trust through transparent transactions
- Enable peer-to-peer savings groups
- Create accountability through reputation

### Behavioral Economics
- Incentivize consistent saving habits
- Reward financial discipline with NFTs
- Gamify the savings experience

### Real-World Applications
- **Diaspora Communities**: Cross-border savings groups
- **Small Businesses**: Employee savings programs
- **Student Groups**: Collaborative savings for goals
- **Rural Communities**: Traditional Susu digitized

---

## 🔐 Security

### Smart Contract Security
- ✅ Access control with AdminCap
- ✅ Authorization checks in all functions
- ✅ Input validation and error handling
- ✅ Proper object ownership model
- ✅ Event emission for transparency

### Frontend Security
- ✅ No private key handling
- ✅ Wallet integration via official SDK
- ✅ Input sanitization
- ✅ XSS protection
- ✅ Secure transaction signing

---

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Group Susu implementation
- [x] Piggy Bank functionality
- [x] Reputation system
- [x] NFT rewards
- [x] Walrus integration
- [x] Admin dashboard

### Phase 2: Enhancement (Q1 2026)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Social features
- [ ] Multi-language support

### Phase 3: Scale (Q2 2026)
- [ ] Custom indexer
- [ ] GraphQL API
- [ ] Mainnet deployment
- [ ] Security audit
- [ ] Partnership integrations

### Phase 4: Expansion (Q3 2026)
- [ ] Cross-chain bridges
- [ ] DeFi integrations
- [ ] Lending features
- [ ] Insurance products
- [ ] DAO governance

---

## 👥 Team

Built with ❤️ for the Sui Hackathon

- **Smart Contracts**: Move language experts
- **Frontend**: React/TypeScript developers
- **Design**: UX/UI specialists
- **Integration**: Sui & Walrus integration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Sui Foundation** - For the amazing blockchain platform
- **Mysten Labs** - For comprehensive developer tools
- **Walrus Team** - For decentralized storage solution
- **Sui Community** - For support and feedback

---

## 📞 Contact & Links

- **GitHub**: [github.com/yourusername/s_bank](https://github.com/yourusername/s_bank)
- **Demo**: [Add your deployment URL]
- **Documentation**: [Full docs](./docs/)
- **Twitter**: [@yourhandle]
- **Discord**: [Your Discord]

---

## 🌟 Star Us!

If you find S-Bank useful, please consider giving us a star ⭐ on GitHub!

---

<div align="center">

**Built for Sui Hackathon 2025**

Made with 💙 using Sui & Walrus

[Demo](#) • [Docs](./docs/) • [Architecture](./SYSTEM_ARCHITECTURE.md)

</div>
