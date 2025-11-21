# S-Bank Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Sui Wallet browser extension
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd s_bank

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` and connect your Sui wallet!

---

## 🎯 Key Features Overview

### 1. Group Susu (Rotating Savings)
**What**: Community-based rotating savings groups where members contribute regularly and take turns receiving payouts.

**How to use**:
1. Go to "Explore" page
2. Click "Create Group" or join an existing group
3. Make contributions when it's time
4. Receive payout when it's your turn

### 2. Piggy Bank (Personal Savings)
**What**: Personal savings accounts with goals and automatic tracking.

**How to use**:
1. Go to "Piggy Banks" page
2. Click "Create Piggy Bank"
3. Set your savings goal
4. Deposit funds anytime
5. Break piggy bank when goal is reached

### 3. Reputation System
**What**: Track your savings behavior and earn reputation points.

**How to use**:
1. Go to "Profile" page
2. Click "Create Reputation Profile"
3. Earn points by:
   - Making on-time contributions (+10 points)
   - Completing cycles (+100 points)
   - Reaching milestones

### 4. NFT Rewards
**What**: Earn achievement NFTs for reaching milestones.

**Achievement types**:
- 🏆 Cycle Completion - Complete your first cycle
- ⭐ 5 Cycles Milestone - Complete 5 cycles
- ⚡ 10 Cycles Milestone - Complete 10 cycles
- 🎯 Perfect Attendance - 10+ on-time contributions

---

## 🛠️ Development Guide

### Project Structure
```
s_bank/
├── move/counter/          # Smart contracts
│   └── sources/
│       ├── admin.move
│       ├── group_susu.move
│       ├── nft_rewards.move
│       └── reputation.move
├── src/
│   ├── components/        # React components
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   ├── services/         # External services
│   └── utils/            # Utility functions
└── docs/                 # Documentation
```

### Key Files
- `src/constants.ts` - Environment configuration
- `src/networkConfig.ts` - Network setup
- `src/queryConfig.ts` - React Query configuration
- `.env` - Environment variables

### Common Tasks

#### Add a New Hook
```typescript
// src/hooks/useMyFeature.ts
import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";

export function useMyFeature() {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: ["myFeature", counterPackageId],
    queryFn: async () => {
      // Your logic here
    },
  });
}
```

#### Add a New Transaction
```typescript
// In your component
const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
const counterPackageId = useNetworkVariable("counterPackageId");

const handleTransaction = async () => {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${counterPackageId}::module::function`,
    arguments: [/* your args */],
  });

  await signAndExecuteTransaction({ transaction: tx });
};
```

#### Invalidate Cache After Transaction
```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// After successful transaction
queryClient.invalidateQueries({
  queryKey: ["myFeature", counterPackageId],
});
```

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```env
# Walrus
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space

# Package IDs
VITE_TESTNET_COUNTER_PACKAGE_ID=your_package_id

# Object IDs
VITE_ADMIN_CAP_ID=your_admin_cap_id
VITE_PLATFORM_CONFIG_ID=your_platform_config_id
VITE_NFT_COLLECTION_ID=your_nft_collection_id
```

### Deploy Smart Contracts
```bash
cd move/counter
sui move build
sui client publish --gas-budget 100000000
```

Copy the package ID and object IDs to your `.env` file.

---

## 📖 API Reference

### Key Hooks

#### Data Fetching
- `useAllGroups()` - Fetch all groups
- `useUserGroups(address)` - Fetch user's groups
- `useGroupSusu(groupId)` - Fetch group details
- `useReputationProfile(address)` - Fetch reputation
- `useUserNFTs(address)` - Fetch user's NFTs
- `usePlatformStats()` - Fetch platform stats

#### Transactions
- `useCreateReputationProfile()` - Create profile
- Custom transaction builders in components

### Network Configuration
```typescript
import { useNetworkVariable } from "./networkConfig";

// In your component
const counterPackageId = useNetworkVariable("counterPackageId");
```

### Query Configuration
```typescript
import { 
  getReputationProfileQueryKey,
  getInvalidateKeysAfterJoinGroup 
} from "./queryConfig";

// Use predefined query keys
const queryKey = getReputationProfileQueryKey(address, packageId);

// Use invalidation helpers
const keysToInvalidate = getInvalidateKeysAfterJoinGroup(
  userAddress, 
  groupId, 
  packageId
);
```

---

## 🧪 Testing

### Manual Testing
```bash
# Start dev server
npm run dev

# In another terminal, build contracts
cd move/counter
sui move build
```

### Test Checklist
- [ ] Connect wallet
- [ ] Create a group
- [ ] Join a group
- [ ] Make a contribution
- [ ] Create piggy bank
- [ ] Deposit to piggy bank
- [ ] Create reputation profile
- [ ] View NFT gallery

---

## 🐛 Troubleshooting

### Common Issues

#### "Package object does not exist"
**Solution**: Update package ID in `.env` with your deployed package ID.

#### "Insufficient gas"
**Solution**: Ensure you have enough SUI in your wallet for gas fees.

#### "Object not found"
**Solution**: Verify object IDs in `.env` match your deployed objects.

#### NFTs not displaying
**Solution**: 
1. Check Walrus aggregator URL is correct
2. Verify NFT was minted successfully
3. Check browser console for errors

#### Build errors
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Additional Resources

### Documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Full deployment guide
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) - Technical architecture
- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Deployment status
- [docs/WARUS_SDK.md](./docs/WARUS_SDK.md) - Walrus integration

### External Links
- [Sui Documentation](https://docs.sui.io/)
- [Move Language](https://move-language.github.io/move/)
- [Walrus Documentation](https://docs.walrus.site/)
- [React Query](https://tanstack.com/query/latest)

---

## 💡 Tips & Best Practices

### Development
1. Always use `useNetworkVariable` for package IDs
2. Invalidate queries after transactions
3. Use proper error handling
4. Add loading states
5. Test on testnet before mainnet

### Smart Contracts
1. Always validate inputs
2. Check authorization
3. Emit events for important actions
4. Use proper error codes
5. Test thoroughly

### Performance
1. Use React Query caching
2. Implement proper stale times
3. Avoid unnecessary re-renders
4. Use code splitting for large components
5. Optimize images and assets

---

## 🎓 Learning Path

### Beginner
1. Understand Sui blockchain basics
2. Learn Move language fundamentals
3. Explore the codebase
4. Run the app locally
5. Make small changes

### Intermediate
1. Create custom hooks
2. Add new features
3. Modify smart contracts
4. Deploy to testnet
5. Integrate new services

### Advanced
1. Optimize performance
2. Implement indexer
3. Add advanced features
4. Security audit
5. Deploy to mainnet

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use TypeScript strict mode
- Follow existing patterns
- Add comments for complex logic
- Write descriptive commit messages
- Update documentation

---

## 📞 Support

### Need Help?
- Check documentation first
- Review existing code examples
- Test on testnet
- Ask in community channels

### Found a Bug?
1. Check if it's already reported
2. Provide reproduction steps
3. Include error messages
4. Share environment details

---

**Happy Building! 🚀**

For detailed information, see the full documentation in the `docs/` folder.
