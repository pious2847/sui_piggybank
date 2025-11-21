# S-Bank System Architecture

## Overview
S-Bank is a decentralized savings platform built on Sui blockchain, featuring group rotating savings (Susu), personal piggy banks, reputation tracking, and NFT rewards.

## Technology Stack

### Blockchain
- **Sui Blockchain**: Layer 1 blockchain for smart contracts
- **Move Language**: Smart contract programming language
- **Sui SDK**: `@mysten/sui` v1.45.0
- **Dapp Kit**: `@mysten/dapp-kit` v0.19.9

### Storage
- **Walrus**: Decentralized storage for NFT images and metadata
- **HTTP API**: Direct API calls to Walrus aggregator/publisher

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling framework
- **React Router**: Client-side routing
- **React Query**: Data fetching and caching

### State Management
- **TanStack Query (React Query)**: Server state management
- **React Hooks**: Local state management

## Smart Contract Architecture

### Module Structure
```
counter::
├── admin           - Admin capabilities and platform management
├── counter         - Legacy counter module
├── group_susu      - Rotating savings groups
├── nft_rewards     - Achievement NFT system
└── reputation      - User reputation tracking
```

### Key Data Structures

#### GroupSusu
```move
public struct GroupSusu has key, store {
    id: UID,
    name: String,
    creator: address,
    contribution_amount: u64,
    contribution_frequency_ms: u64,
    max_participants: u64,
    participants: vector<address>,
    participant_count: u64,
    balance: u64,
    current_round: u64,
    total_rounds: u64,
    round_recipients: vector<address>,
    cycle_complete: bool,
    created_at: u64,
}
```

#### ReputationProfile
```move
public struct ReputationProfile has key, store {
    id: UID,
    owner: address,
    reputation_score: u64,
    cycles_completed: u64,
    total_contributions: u64,
    on_time_contributions: u64,
    late_contributions: u64,
    created_at: u64,
    encrypted_data: vector<u8>,
}
```

#### NFTReward
```move
public struct NFTReward has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: String,        // Walrus blob ID
    metadata_url: String,     // Walrus blob ID
    achievement_type: u8,
    earned_at: u64,
    recipient: address,
}
```

## Frontend Architecture

### Directory Structure
```
src/
├── components/
│   ├── admin/          - Admin dashboard components
│   ├── dashboard/      - Dashboard widgets
│   ├── group/          - Group susu components
│   ├── layout/         - Layout components (Header, Sidebar, Footer)
│   ├── nft/            - NFT display components
│   ├── profile/        - Profile components
│   ├── reputation/     - Reputation display components
│   ├── transactions/   - Transaction components
│   └── ui/             - Reusable UI components
├── hooks/              - Custom React hooks
├── pages/              - Page components
├── services/           - External services (Walrus)
├── utils/              - Utility functions
├── constants.ts        - Environment constants
├── networkConfig.ts    - Network configuration
└── queryConfig.ts      - React Query configuration
```

### Key Hooks

#### Data Fetching Hooks
- `useAllGroups()` - Fetch all available groups
- `useUserGroups()` - Fetch user's joined groups
- `useGroupSusu()` - Fetch specific group details
- `useReputationProfile()` - Fetch user reputation
- `useUserNFTs()` - Fetch user's NFT collection
- `usePlatformStats()` - Fetch platform statistics
- `useAdminCap()` - Check admin capabilities

#### Transaction Hooks
- `useCreateReputationProfile()` - Create reputation profile
- Custom transaction builders in components

### Network Configuration
```typescript
{
  devnet: {
    url: getFullnodeUrl("devnet"),
    variables: { counterPackageId: DEVNET_COUNTER_PACKAGE_ID }
  },
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: { counterPackageId: TESTNET_COUNTER_PACKAGE_ID }
  },
  mainnet: {
    url: getFullnodeUrl("mainnet"),
    variables: { counterPackageId: MAINNET_COUNTER_PACKAGE_ID }
  }
}
```

## Data Flow

### 1. Group Susu Flow
```
User → Create Group → GroupCreatedEvent → Blockchain
                    ↓
              GroupSusu Object Created
                    ↓
User → Join Group → Update participants
                    ↓
User → Contribute → ContributionMadeEvent → Update Reputation
                    ↓
Admin → Distribute Round → RoundDistributedEvent
                    ↓
All Rounds Complete → CycleCompletedEvent → Award Reputation Bonus
```

### 2. Reputation Flow
```
User → Create Profile → ReputationProfile Object
                    ↓
User → Make Contribution → ReputationEvent (contribution)
                    ↓
              Award Points (10 on-time, 5 late)
                    ↓
Complete Cycle → ReputationEvent (cycle_complete)
                    ↓
              Award Bonus (100 points)
                    ↓
Reach Milestone → MilestoneReachedEvent → Eligible for NFT
```

### 3. NFT Reward Flow
```
User → Reach Milestone → MilestoneReachedEvent
                    ↓
Admin → Mint NFT → Upload Image to Walrus
                    ↓
              Upload Metadata to Walrus
                    ↓
              Create NFTReward Object
                    ↓
              NFTMintedEvent
                    ↓
User → View NFT Gallery → Fetch from Walrus
```

### 4. Piggy Bank Flow
```
User → Create Piggy Bank → PiggyBank Object
                    ↓
User → Deposit → Update balance
                    ↓
User → Break → Transfer balance to user
                    ↓
              PiggyBank destroyed
```

## Caching Strategy

### Query Configuration
```typescript
// Owned objects (60s stale time)
- User's piggy banks
- User's groups
- User's NFTs

// Object details (15s stale time)
- Group details
- Reputation profile
- Piggy bank balance

// Platform stats (30s stale time)
- Total users
- Active groups
- NFTs minted
```

### Cache Invalidation
```typescript
// After joining group
- Group details
- User groups
- All groups list

// After contribution
- Group details
- Reputation profile
- Reputation events

// After NFT mint
- User NFTs
- Platform stats
```

## Security Model

### Smart Contract Security
1. **Access Control**: AdminCap for privileged operations
2. **Authorization**: Sender verification in all functions
3. **Ownership**: Objects owned by users, not shared
4. **Validation**: Input validation and error handling

### Frontend Security
1. **Wallet Integration**: No private key handling
2. **Transaction Signing**: User approval required
3. **Input Validation**: Client-side validation
4. **Error Handling**: Graceful error recovery

## Walrus Integration

### Storage Architecture
```
NFT Image → Upload to Walrus Publisher
         ↓
    Blob ID returned
         ↓
Store Blob ID in NFTReward.image_url
         ↓
Retrieve via Walrus Aggregator
         ↓
Display: https://aggregator.../v1/{blob_id}
```

### API Endpoints
- **Publisher**: `https://publisher.walrus-testnet.walrus.space`
- **Aggregator**: `https://aggregator.walrus-testnet.walrus.space`

### Storage Configuration
- **Epochs**: 5 (configurable)
- **Format**: Binary blob storage
- **Retrieval**: HTTP GET via aggregator

## Event System

### Event Types
1. **GroupCreatedEvent** - New group created
2. **ContributionMadeEvent** - User made contribution
3. **RoundDistributedEvent** - Round payout distributed
4. **CycleCompletedEvent** - Full cycle completed
5. **ReputationEvent** - Reputation change
6. **MilestoneReachedEvent** - User reached milestone
7. **NFTMintedEvent** - NFT reward minted

### Event Listeners
- Frontend queries events for history
- Events trigger cache invalidation
- Events used for platform statistics

## Performance Optimizations

### Frontend
1. **Code Splitting**: Route-based lazy loading
2. **Query Caching**: React Query with optimized stale times
3. **Memoization**: React.memo for expensive components
4. **Debouncing**: Search and filter inputs
5. **Pagination**: Limit query results

### Blockchain
1. **Batch Operations**: Group multiple calls when possible
2. **Event Queries**: Use events instead of object scanning
3. **Shared Objects**: Minimize shared object usage
4. **Gas Optimization**: Efficient Move code

## Scalability Considerations

### Current Limitations
1. **Event Queries**: Limited to 50 events per query
2. **Object Scanning**: No indexer for complex queries
3. **Pagination**: Basic cursor-based pagination

### Future Improvements
1. **Indexer**: Implement custom indexer for complex queries
2. **GraphQL API**: Add GraphQL layer for flexible queries
3. **Caching Layer**: Redis for frequently accessed data
4. **CDN**: Serve static assets via CDN
5. **Load Balancing**: Multiple RPC endpoints

## Deployment Architecture

### Testnet
```
Frontend (Vite Dev Server)
    ↓
Sui Testnet RPC
    ↓
Smart Contracts (Testnet)
    ↓
Walrus Testnet
```

### Production (Future)
```
Frontend (Vercel/Netlify)
    ↓
CDN (Cloudflare)
    ↓
Sui Mainnet RPC (Load Balanced)
    ↓
Smart Contracts (Mainnet)
    ↓
Walrus Mainnet
    ↓
Indexer (Custom)
    ↓
Database (PostgreSQL)
```

## Monitoring & Observability

### Metrics to Track
1. **Transaction Success Rate**
2. **Average Gas Costs**
3. **Query Response Times**
4. **Cache Hit Rates**
5. **User Engagement**
6. **Error Rates**

### Logging
- Frontend: Console errors (production: Sentry)
- Smart Contracts: Event emissions
- Transactions: On-chain history

## Testing Strategy

### Smart Contracts
- Unit tests with Move test framework
- Integration tests with Sui CLI
- Manual testing on testnet

### Frontend
- Component testing (future)
- Integration testing (future)
- Manual E2E testing
- Cross-browser testing

---

**Version**: 1.0.0
**Last Updated**: November 21, 2025
