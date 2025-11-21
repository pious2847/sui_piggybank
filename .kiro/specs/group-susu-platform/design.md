# Design Document: Group Susu Platform

## Overview

The Group Susu Platform expands SuiVault from individual piggy banks to a comprehensive rotating savings and credit association (ROSCA) system. The platform enables users to create and participate in group savings pools, earn reputation through consistent participation, receive NFT rewards for achievements, and discover opportunities through an enhanced frontend experience.

The system leverages Sui blockchain's object model, Walrus for decentralized storage, and Seal for privacy-preserving encryption. An admin-controlled reward system ensures fair distribution of achievement NFTs.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Application                     │
│  (React + Sui dApp Kit + Walrus Client + Seal SDK)         │
├──────────────┬──────────────┬──────────────┬───────────────┤
│  Dashboard   │  Explore     │  Profile     │  Admin Panel  │
└──────────────┴──────────────┴──────────────┴───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Sui Blockchain Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  PiggyBank   │  │  GroupSusu   │  │  Reputation     │  │
│  │   Module     │  │    Module    │  │    Module       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  NFT Reward  │  │  Admin Cap   │  │  Seal Encrypted │  │
│  │   Module     │  │    Module    │  │     Data        │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Walrus Storage Layer                      │
│         (NFT Metadata, Images, Achievement Data)            │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

The smart contract will be organized into the following Move modules:

1. **counter::counter** (existing) - Individual PiggyBank functionality
2. **counter::group_susu** - Group savings pool management
3. **counter::reputation** - User reputation tracking
4. **counter::nft_rewards** - NFT minting and distribution
5. **counter::admin** - Admin capability management

## Components and Interfaces

### 1. Group Susu Module

#### Data Structures

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
    balance: Balance<SUI>,
    current_round: u64,
    total_rounds: u64,
    round_recipients: vector<address>,
    last_contribution_time: Table<address, u64>,
    cycle_complete: bool,
    created_at: u64,
}

public struct ParticipantInfo has store {
    address: address,
    contributions_made: u64,
    has_received_payout: bool,
    join_timestamp: u64,
}
```

#### Key Functions

- `create_group_susu()` - Initialize a new group savings pool
- `join_group()` - Add a participant to an existing group
- `contribute()` - Make a contribution to the group pool
- `distribute_round()` - Transfer pooled funds to the round recipient
- `complete_cycle()` - Mark a cycle as complete when all participants have received payouts
- `get_group_info()` - Query group details and status

#### Business Logic

**Contribution Flow:**
1. Participant calls `contribute()` with the exact contribution amount
2. System verifies participant is a member and contribution is timely
3. Funds are added to the group balance
4. Contribution timestamp is recorded
5. When all participants have contributed for the round, `distribute_round()` is triggered

**Distribution Flow:**
1. System identifies the current round recipient from the rotation
2. Pooled funds (contribution_amount * participant_count) are transferred
3. Round counter increments
4. If all participants have received funds once, cycle is marked complete
5. Reputation and NFT reward events are emitted

### 2. Reputation Module

#### Data Structures

```move
public struct ReputationProfile has key {
    id: UID,
    owner: address,
    reputation_score: u64,
    cycles_completed: u64,
    total_contributions: u64,
    on_time_contributions: u64,
    late_contributions: u64,
    created_at: u64,
    encrypted_data: vector<u8>, // Seal-encrypted sensitive info
}

public struct ReputationEvent has copy, drop {
    user: address,
    points_earned: u64,
    event_type: u8, // 1=contribution, 2=cycle_complete, 3=milestone
    timestamp: u64,
}
```

#### Key Functions

- `create_reputation_profile()` - Initialize user reputation profile
- `award_contribution_points()` - Grant points for timely contributions
- `award_cycle_completion_bonus()` - Grant bonus for completing a cycle
- `get_reputation_score()` - Query user's current reputation
- `update_encrypted_data()` - Update Seal-encrypted user data

#### Reputation Scoring

- **Timely Contribution:** +10 points
- **Late Contribution:** +5 points
- **Cycle Completion:** +100 points
- **Milestone Achievements:** +50 to +500 points (based on milestone)

### 3. NFT Rewards Module

#### Data Structures

```move
public struct NFTReward has key, store {
    id: UID,
    name: String,
    description: String,
    image_url: String, // Walrus blob ID
    metadata_url: String, // Walrus blob ID for full metadata
    achievement_type: u8,
    earned_at: u64,
    recipient: address,
}

public struct NFTCollection has key {
    id: UID,
    admin: address,
    total_minted: u64,
    reward_types: Table<u8, RewardTemplate>,
}

public struct RewardTemplate has store {
    name: String,
    description: String,
    base_image_url: String,
    achievement_type: u8,
}
```

#### Key Functions

- `init_nft_collection()` - Initialize NFT collection with admin cap
- `mint_reward()` - Mint NFT reward (admin-only)
- `transfer_reward()` - Transfer NFT to recipient
- `get_user_nfts()` - Query all NFTs owned by a user

#### Walrus Integration

**Metadata Storage:**
```json
{
  "name": "Cycle Completion Champion",
  "description": "Completed 5 group susu cycles",
  "image": "walrus://blob_id_12345",
  "attributes": [
    {"trait_type": "Achievement", "value": "Cycle Completion"},
    {"trait_type": "Cycles", "value": "5"},
    {"trait_type": "Earned Date", "value": "2025-11-13"}
  ]
}
```

**Storage Process:**
1. Generate NFT metadata JSON
2. Upload metadata to Walrus using Walrus SDK
3. Receive blob ID from Walrus
4. Store blob ID in NFT object on-chain
5. Frontend retrieves metadata from Walrus using blob ID

### 4. Admin Module

#### Data Structures

```move
public struct AdminCap has key, store {
    id: UID,
}

public struct PlatformConfig has key {
    id: UID,
    admin: address,
    nft_minting_enabled: bool,
    min_reputation_for_rewards: u64,
}
```

#### Key Functions

- `init()` - Create and transfer AdminCap to deployer
- `mint_nft_reward()` - Mint NFT (requires AdminCap)
- `update_platform_config()` - Modify platform settings (requires AdminCap)
- `transfer_admin_cap()` - Transfer admin rights (requires AdminCap)

### 5. Seal Encryption Integration

#### Encrypted Data Fields

**ReputationProfile:**
- User's full contribution history with amounts
- Personal financial patterns
- Identity verification data (if applicable)

**GroupSusu:**
- Individual participant contribution amounts (aggregate remains public)
- Participant personal notes or preferences

#### Encryption Process

```move
// Pseudo-code for Seal integration
public fun encrypt_user_data(data: vector<u8>, public_key: vector<u8>): vector<u8> {
    // Use Seal encryption library
    seal::encrypt(data, public_key)
}

public fun decrypt_user_data(
    encrypted_data: vector<u8>,
    private_key: vector<u8>,
    ctx: &TxContext
): vector<u8> {
    // Verify caller has permission
    // Use Seal decryption library
    seal::decrypt(encrypted_data, private_key)
}
```

## Data Models

### Object Relationships

```
User (address)
    │
    ├─── owns ──> PiggyBank (1:many)
    │
    ├─── owns ──> ReputationProfile (1:1)
    │
    ├─── participates in ──> GroupSusu (many:many)
    │
    └─── owns ──> NFTReward (1:many)

GroupSusu
    │
    ├─── has ──> Participants (many)
    │
    └─── triggers ──> NFTReward minting (on cycle complete)

AdminCap
    │
    └─── authorizes ──> NFT minting
```

### State Transitions

**GroupSusu Lifecycle:**
```
Created → Accepting Participants → Active (Contributions) → 
Round Complete → Next Round → ... → Cycle Complete → Archived
```

**Reputation Profile Lifecycle:**
```
Created → Accumulating Points → Milestone Reached → 
NFT Eligible → NFT Awarded → Continue Accumulating
```

## Error Handling

### Smart Contract Errors

```move
const E_NOT_PARTICIPANT: u64 = 1;
const E_GROUP_FULL: u64 = 2;
const E_INVALID_CONTRIBUTION_AMOUNT: u64 = 3;
const E_ROUND_NOT_COMPLETE: u64 = 4;
const E_CYCLE_ALREADY_COMPLETE: u64 = 5;
const E_UNAUTHORIZED: u64 = 6;
const E_INSUFFICIENT_REPUTATION: u64 = 7;
const E_NFT_MINTING_DISABLED: u64 = 8;
const E_INVALID_ADMIN_CAP: u64 = 9;
const E_DECRYPTION_FAILED: u64 = 10;
```

### Frontend Error Handling

- **Transaction Failures:** Display user-friendly error messages with retry options
- **Walrus Connection Issues:** Fallback to cached data or placeholder images
- **Seal Decryption Failures:** Prompt user to verify credentials
- **Network Issues:** Implement retry logic with exponential backoff

## Testing Strategy

### Unit Tests

1. **Group Susu Module:**
   - Test group creation with various parameters
   - Test participant joining (success and failure cases)
   - Test contribution validation
   - Test round distribution logic
   - Test cycle completion detection

2. **Reputation Module:**
   - Test profile creation
   - Test point awarding for different events
   - Test reputation score calculations
   - Test encrypted data storage and retrieval

3. **NFT Rewards Module:**
   - Test NFT minting with admin cap
   - Test unauthorized minting attempts
   - Test NFT transfer to recipients
   - Test Walrus blob ID storage

4. **Admin Module:**
   - Test admin cap creation and transfer
   - Test admin-only function access control
   - Test platform configuration updates

### Integration Tests

1. **End-to-End Group Susu Flow:**
   - Create group → Join participants → Make contributions → 
     Distribute rounds → Complete cycle → Award NFTs

2. **Reputation and Rewards Flow:**
   - Create profile → Earn points → Reach milestone → 
     Trigger NFT eligibility → Admin mints NFT → User receives NFT

3. **Walrus Integration:**
   - Upload metadata to Walrus
   - Store blob ID on-chain
   - Retrieve and display metadata in frontend

4. **Seal Encryption:**
   - Encrypt sensitive data
   - Store encrypted data on-chain
   - Decrypt data with proper credentials
   - Verify unauthorized decryption fails

### Frontend Tests

1. **Component Tests:**
   - Test Explore page filtering and search
   - Test Dashboard data display
   - Test Profile page NFT rendering
   - Test Admin panel functionality

2. **Integration Tests:**
   - Test wallet connection and transaction signing
   - Test Walrus data fetching
   - Test real-time updates from blockchain events

## Frontend Architecture

### Technology Stack

- **Framework:** React 18+ with TypeScript
- **Sui Integration:** @mysten/dapp-kit, @mysten/sui.js
- **Walrus Client:** @walrus/sdk (or HTTP API)
- **Seal SDK:** @sui/seal (if available, or custom implementation)
- **UI Components:** Radix UI, Tailwind CSS
- **State Management:** TanStack Query for blockchain data
- **Routing:** React Router
- **Charts:** Recharts for analytics

### Page Structure

```
/
├── / (Dashboard)
├── /explore (Group Discovery)
├── /group/:id (Group Details & Management)
├── /profile (User Profile & Reputation)
├── /profile/:address (Public Profile View)
├── /piggy-banks (Individual Savings)
├── /admin (Admin Dashboard)
└── /rewards (NFT Collection Gallery)
```

### Component Hierarchy

```
App
├── Layout
│   ├── Header (Wallet Connect, Navigation)
│   ├── Sidebar (Quick Actions)
│   └── Footer
├── Dashboard
│   ├── StatsOverview
│   ├── PiggyBankList
│   ├── GroupSusuList
│   └── RecentActivity
├── ExplorePage
│   ├── SearchBar
│   ├── FilterPanel
│   └── GroupGrid
│       └── GroupCard
├── GroupDetailsPage
│   ├── GroupInfo
│   ├── ParticipantList
│   ├── ContributionSchedule
│   └── ContributeButton
├── ProfilePage
│   ├── ReputationScore
│   ├── ReputationHistory
│   ├── NFTGallery
│   │   └── NFTCard (with Walrus image)
│   └── AchievementBadges
└── AdminDashboard
    ├── PlatformStats
    ├── PendingRewards
    └── MintNFTForm
```

### State Management

**Blockchain Data (TanStack Query):**
- User's piggy banks
- User's group susu memberships
- User's reputation profile
- User's NFT rewards
- All active groups (for explore page)
- Platform statistics (for admin)

**Local State:**
- UI preferences (theme, filters)
- Form inputs
- Modal visibility
- Loading states

### Walrus Integration in Frontend

```typescript
// Fetch NFT metadata from Walrus
async function fetchNFTMetadata(blobId: string) {
  const walrusClient = new WalrusClient(WALRUS_AGGREGATOR_URL);
  const metadata = await walrusClient.read(blobId);
  return JSON.parse(metadata);
}

// Display NFT with Walrus image
function NFTCard({ nft }: { nft: NFTReward }) {
  const { data: metadata } = useQuery({
    queryKey: ['nft-metadata', nft.metadata_url],
    queryFn: () => fetchNFTMetadata(nft.metadata_url)
  });

  return (
    <div>
      <img src={`${WALRUS_AGGREGATOR_URL}/v1/${nft.image_url}`} />
      <h3>{metadata?.name}</h3>
      <p>{metadata?.description}</p>
    </div>
  );
}
```

### Seal Integration in Frontend

```typescript
// Decrypt user's sensitive data
async function decryptUserData(
  encryptedData: Uint8Array,
  userPrivateKey: Uint8Array
) {
  const sealClient = new SealClient();
  const decrypted = await sealClient.decrypt(encryptedData, userPrivateKey);
  return decrypted;
}

// Display encrypted contribution history
function ContributionHistory({ userId }: { userId: string }) {
  const { data: profile } = useReputationProfile(userId);
  const [decryptedData, setDecryptedData] = useState(null);

  const handleDecrypt = async () => {
    const privateKey = await getUserPrivateKey(); // From wallet or secure storage
    const data = await decryptUserData(profile.encrypted_data, privateKey);
    setDecryptedData(data);
  };

  return (
    <div>
      {!decryptedData ? (
        <button onClick={handleDecrypt}>Decrypt History</button>
      ) : (
        <ContributionList data={decryptedData} />
      )}
    </div>
  );
}
```

## Design Decisions and Rationales

### 1. Object Ownership Model

**Decision:** GroupSusu objects are shared objects, not owned by a single user.

**Rationale:** Multiple participants need to interact with the same group object. Using shared objects allows concurrent access while Sui's consensus ensures consistency.

### 2. Reputation as Owned Object

**Decision:** ReputationProfile is an owned object, not a shared object.

**Rationale:** Only the user and admin need to modify reputation. Owned objects are more efficient and reduce consensus overhead.

### 3. Admin-Controlled NFT Minting

**Decision:** NFT minting requires AdminCap, not automatic on cycle completion.

**Rationale:** Provides quality control, prevents spam, allows for manual verification of achievements, and enables curated reward distribution.

### 4. Walrus for NFT Storage

**Decision:** Store NFT metadata and images on Walrus instead of on-chain.

**Rationale:** Reduces on-chain storage costs, enables rich media (images, videos), leverages decentralized storage, and maintains data availability.

### 5. Seal for Selective Encryption

**Decision:** Encrypt only sensitive personal data, not all group data.

**Rationale:** Balances privacy with transparency. Group aggregate data remains public for trust, while individual financial details are protected.

### 6. Round-Robin Distribution

**Decision:** Use deterministic round-robin for payout order.

**Rationale:** Fair, predictable, and transparent. Users know when they'll receive funds. Prevents gaming or favoritism.

### 7. Frontend State Management

**Decision:** Use TanStack Query for blockchain data, not Redux or Context.

**Rationale:** TanStack Query is optimized for async data fetching, provides caching, and handles loading/error states elegantly.

## Security Considerations

1. **Access Control:** AdminCap ensures only authorized addresses can mint NFTs
2. **Contribution Validation:** Strict checks on contribution amounts and timing
3. **Reentrancy Protection:** Sui's object model prevents reentrancy attacks
4. **Encryption:** Seal protects sensitive user data from unauthorized access
5. **Input Validation:** All user inputs are validated before processing
6. **Rate Limiting:** Frontend implements rate limiting for API calls
7. **Wallet Security:** Users maintain custody of their private keys

## Performance Considerations

1. **Batch Operations:** Group multiple reputation updates in single transaction when possible
2. **Lazy Loading:** Frontend loads NFT metadata on-demand, not all at once
3. **Caching:** Walrus data is cached in frontend to reduce network calls
4. **Indexing:** Use Sui indexer for efficient querying of groups and users
5. **Pagination:** Explore page implements pagination for large group lists

## Future Enhancements

1. **Dispute Resolution:** Mechanism for handling missed contributions
2. **Dynamic Interest:** Groups can earn yield on pooled funds
3. **Cross-Chain:** Bridge to other blockchains for wider participation
4. **Social Features:** Chat, comments, and group discussions
5. **Advanced Analytics:** Predictive models for user behavior
6. **Mobile App:** Native iOS and Android applications
7. **Governance:** DAO for platform decisions and parameter updates
