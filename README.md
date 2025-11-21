# SuiVault - Decentralized Savings & Group Susu Platform

A comprehensive decentralized savings platform built on Sui blockchain, featuring individual piggy banks, group savings (Susu), reputation system, NFT rewards, and Walrus decentralized storage integration.

## 🌟 Features

### 1. **Piggy Bank Savings**
- Create personal savings vaults with customizable goals
- Time-locked withdrawals for disciplined saving
- Track progress with real-time updates
- Break piggy bank only when goals are met

### 2. **Group Susu (ROSCA)**
- Create or join rotating savings and credit associations
- Automated round-robin payout distribution
- Transparent contribution tracking
- Cycle completion rewards

### 3. **Reputation System**
- Earn reputation points for timely contributions
- Track participation history
- Milestone achievements (5 cycles, 10 cycles, perfect attendance)
- Privacy-preserving encrypted user data using Seal protocol

### 4. **NFT Rewards**
- Achievement-based NFT minting
- Walrus-powered decentralized storage for NFT metadata and images
- Multiple reward tiers:
  - Cycle Completion Champion
  - 5 Cycles Milestone
  - 10 Cycles Milestone
  - Perfect Attendance
- Admin dashboard for reward management

### 5. **Admin Dashboard**
- Platform configuration management
- NFT reward minting interface
- User activity monitoring
- Admin capability transfer

### 6. **Walrus Integration**
- Decentralized storage for NFT images and metadata
- Direct file uploads to Walrus testnet
- Automatic blob certification and retrieval
- React hooks for seamless integration

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Radix UI + TailwindCSS
- **Blockchain**: Sui Move smart contracts
- **Wallet Integration**: @mysten/dapp-kit v0.19.9
- **Storage**: Walrus decentralized storage
- **State Management**: TanStack Query (React Query)
- **Package Manager**: pnpm

## 📦 Smart Contract Modules

The platform consists of 5 interconnected Move modules:

1. **admin.move** - Platform administration and configuration
2. **group_susu.move** - Group savings with Seal encryption
3. **reputation.move** - User reputation and achievement tracking
4. **nft_rewards.move** - NFT minting and reward distribution
5. **counter.move** - Individual piggy bank functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Sui CLI installed ([installation guide](https://docs.sui.io/build/install))
- A Sui wallet (Sui Wallet, Suiet, or Ethos)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd suivault
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up Sui CLI for devnet**
```bash
sui client new-env --alias devnet --rpc https://fullnode.devnet.sui.io:443
sui client switch --env devnet
```

4. **Create a new address (if needed)**
```bash
sui client new-address secp256k1
sui client switch --address 0xYOUR_ADDRESS...
```

5. **Get devnet SUI tokens**
Visit the [Sui Devnet Faucet](https://faucet.sui.io) to get test tokens

### Deploying Smart Contracts

1. **Navigate to the Move package**
```bash
cd move/counter
```

2. **Build the package**
```bash
sui move build
```

3. **Publish to devnet**
```bash
sui client publish --gas-budget 100000000
```

4. **Update constants**
After publishing, update `src/constants.ts` with the deployed object IDs:

```typescript
export const DEVNET_COUNTER_PACKAGE_ID = "<YOUR_PACKAGE_ID>";
export const ADMIN_CAP_ID = "<YOUR_ADMIN_CAP_ID>";
export const PLATFORM_CONFIG_ID = "<YOUR_PLATFORM_CONFIG_ID>";
export const NFT_COLLECTION_ID = "<YOUR_NFT_COLLECTION_ID>";
```

You'll find these IDs in the publish transaction output:
- **Package ID**: Look for "packageId" in the transaction
- **AdminCap**: Object of type `AdminCap`
- **PlatformConfig**: Shared object of type `PlatformConfig`
- **NFTCollection**: Shared object of type `NFTCollection`

### Running the Application

1. **Start the development server**
```bash
pnpm dev
```

2. **Open your browser**
Navigate to `http://localhost:5173`

3. **Connect your wallet**
Click "Connect Wallet" and select your Sui wallet

4. **Start using the platform!**
- Create a piggy bank for personal savings
- Join or create a group Susu
- Earn reputation points and NFT rewards

## 📖 Usage Guide

### Creating a Piggy Bank

1. Navigate to the Dashboard
2. Click "Create New Piggy Bank"
3. Set your savings goal (in SUI)
4. Choose an unlock date
5. Make deposits to reach your goal
6. Break the bank when both conditions are met

### Joining a Group Susu

1. Go to the Explore page
2. Browse available groups
3. Click on a group to view details
4. Click "Join Group" if slots are available
5. Make regular contributions according to the schedule
6. Receive your payout when it's your turn

### Earning NFT Rewards

NFT rewards are automatically eligible when you:
- Complete your first group cycle (Cycle Completion Champion)
- Complete 5 cycles (5 Cycles Milestone)
- Complete 10 cycles (10 Cycles Milestone)
- Make 10+ on-time contributions with no late payments (Perfect Attendance)

Admins can mint and distribute NFTs through the Admin Dashboard.

### Admin Functions

If you have the AdminCap, you can:
- Mint NFT rewards for eligible users
- Update platform configuration
- Monitor platform statistics
- Transfer admin rights to another address

## 🏗️ Architecture

### Smart Contract Integration

The frontend integrates with Move smart contracts through:

**Transaction Builders** (`src/utils/transactions.ts`):
- Type-safe transaction construction
- All smart contract functions wrapped
- Automatic gas handling

**React Hooks** (`src/hooks/`):
- `useGroupSusu` - Fetch group data
- `useWalrus` - Walrus storage operations
- `useAdminCap` - Admin capability verification
- `useUserGroups` - User's group memberships

**Event Listening**:
- ContributionMadeEvent - Track contributions
- CycleCompletedEvent - Trigger rewards
- NFTMintedEvent - Track NFT ownership
- MilestoneReachedEvent - Achievement tracking

### Walrus Integration

The platform uses Walrus for decentralized storage:

**Upload Flow**:
1. User uploads image/metadata
2. Frontend encodes and uploads to Walrus publisher
3. Receives blob ID
4. Stores blob ID in smart contract
5. Retrieves content via Walrus aggregator

**Key Files**:
- `src/utils/walrus.ts` - Core Walrus service
- `src/hooks/useWalrus.ts` - React hooks for uploads/fetches
- `src/components/admin/MintNFTForm.tsx` - NFT minting with Walrus

### State Management

- **TanStack Query** for blockchain data caching
- **React Context** for wallet connection
- **Local State** for UI interactions

## 🔐 Security Features

1. **Time-locked Withdrawals** - Enforced at smart contract level
2. **Admin Capability** - Role-based access control
3. **Seal Encryption** - Privacy-preserving contribution data
4. **Transaction Signing** - All operations require wallet approval
5. **Input Validation** - Both frontend and smart contract validation

## 🧪 Testing

```bash
# Run Move tests
cd move/counter
sui move test

# Run frontend tests (if configured)
pnpm test
```

## 📁 Project Structure

```
suivault/
├── move/counter/              # Smart contracts
│   ├── sources/
│   │   ├── admin.move        # Admin module
│   │   ├── group_susu.move   # Group savings
│   │   ├── reputation.move   # Reputation system
│   │   ├── nft_rewards.move  # NFT rewards
│   │   └── counter.move      # Piggy banks
│   └── Move.toml
├── src/
│   ├── components/           # React components
│   │   ├── admin/           # Admin dashboard
│   │   ├── dashboard/       # User dashboard
│   │   ├── group/           # Group management
│   │   ├── nft/             # NFT display
│   │   └── ui/              # Reusable UI
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── utils/               # Utilities
│   │   ├── transactions.ts  # Transaction builders
│   │   └── walrus.ts        # Walrus integration
│   ├── constants.ts         # Contract addresses
│   └── main.tsx
├── docs/                    # Documentation
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_NETWORK=devnet
VITE_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
VITE_WALRUS_PUBLISHER=https://publisher.walrus-01.tududes.com
```

### Network Configuration

Update `src/constants.ts` for different networks:

```typescript
// For testnet
export const TESTNET_COUNTER_PACKAGE_ID = "0x...";

// For mainnet
export const MAINNET_COUNTER_PACKAGE_ID = "0x...";
```

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Issues**
- Ensure your wallet extension is installed and unlocked
- Try refreshing the page
- Check that you're on the correct network (devnet)

**Transaction Failures**
- Verify you have sufficient SUI for gas fees
- Check that object IDs in constants.ts are correct
- Ensure you're using the right network

**Walrus Upload Failures**
- File size limit is ~5MB
- Check CORS settings for URL uploads
- Verify Walrus endpoints are accessible

**NFT Not Displaying**
- Wait a few seconds for Walrus blob certification
- Check that blob IDs are correctly stored
- Verify Walrus aggregator URL is correct

## 📚 Additional Resources

- [Sui Documentation](https://docs.sui.io)
- [Sui Move Book](https://move-book.com)
- [Walrus Documentation](https://docs.walrus.site)
- [dApp Kit Documentation](https://sdk.mystenlabs.com/dapp-kit)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [@mysten/create-dapp](https://www.npmjs.com/package/@mysten/create-dapp)
- Powered by [Sui blockchain](https://sui.io)
- Storage by [Walrus](https://walrus.site)
- UI components from [Radix UI](https://www.radix-ui.com)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the smart contract comments in `/move/counter/sources`

---

**Built with ❤️ on Sui**
