# Smart Contract Deployment Information

## Deployment Details

**Network:** Sui Devnet  
**Deployment Date:** November 14, 2025  
**Deployer Address:** `0xda31b8127cd23f42be99f904cc61f69c5e0693138b2f5cc25eef4a8f94493b87`  
**Transaction Digest:** `G9zDUDYt4dn1yLZTBnurnX8VViMfqytdRAqEdcHUKmoM`

## Package Information

**Current Package ID (v2):** `0x9b1528e6f84c7feef7e61c2db616f533bee68b37b28977254007142b2e0fcf38`  
**Original Package ID (v1):** `0x82c9dfda9ac3821f1b652388cc8d5651738956a2255bece3c8817050124c12d1`

**Upgrade Transaction:** `37ae1bPASzM6kKbfYH6NJycDgCDexdjLCmm6evY47qh4`  
**Upgrade Date:** November 14, 2025

**Modules:**
- `counter::counter` - Individual PiggyBank functionality
- `counter::group_susu` - Group savings pool management (✨ Updated with GroupCreatedEvent)
- `counter::reputation` - User reputation tracking
- `counter::nft_rewards` - NFT minting and distribution
- `counter::admin` - Admin capability management

### Upgrade Changes (v1 → v2)

**Added:**
- `GroupCreatedEvent` - Event emitted when a new group is created, enabling group discovery on the Explore page

## Important Object IDs

### Admin Objects
- **AdminCap:** `0xa93f85202b2de6a1a232bd3ff3af8801bb030bb65e7cbe8f9ba4aaebfa204aec`
  - Owner: `0xda31b8127cd23f42be99f904cc61f69c5e0693138b2f5cc25eef4a8f94493b87`
  - Type: Owned object
  - Purpose: Grants permission to mint NFT rewards

### Shared Objects
- **PlatformConfig:** `0x8a83abf7f99b90ecdb912d2648c1563de4f829a7e38736784fc02b74dfc4cdf1`
  - Type: Shared object
  - Purpose: Platform-wide configuration settings

- **NFTCollection:** `0xa1e48c562b8d36d342dd0ecc7724ed0aa16c850123c941b8513cdecebb6405e8`
  - Type: Shared object
  - Purpose: NFT collection for achievement rewards

### Other Objects
- **UpgradeCap:** `0xe6637ca1e9281ae4910b5f5dfdf3c4548954a936f944096487bb72062eec223a`
  - Owner: `0xda31b8127cd23f42be99f904cc61f69c5e0693138b2f5cc25eef4a8f94493b87`
  - Purpose: Allows package upgrades

## Frontend Integration

The following constants have been updated in `src/constants.ts`:

```typescript
export const DEVNET_COUNTER_PACKAGE_ID = "0x9b1528e6f84c7feef7e61c2db616f533bee68b37b28977254007142b2e0fcf38"; // v2 (upgraded)
export const ADMIN_CAP_ID = "0xa93f85202b2de6a1a232bd3ff3af8801bb030bb65e7cbe8f9ba4aaebfa204aec";
export const PLATFORM_CONFIG_ID = "0x8a83abf7f99b90ecdb912d2648c1563de4f829a7e38736784fc02b74dfc4cdf1";
export const NFT_COLLECTION_ID = "0xa1e48c562b8d36d342dd0ecc7724ed0aa16c850123c941b8513cdecebb6405e8";
```

## Pages Updated with Smart Contract Integration

The following pages have been updated to use blockchain data instead of mock data:

1. **ExplorePage** (`src/pages/ExplorePage.tsx`)
   - Now uses `useAllGroups` hook to fetch real group data
   - Displays actual groups from the blockchain
   - Filters and search work with real data
   - Added "Create Group" button for easy access

2. **GroupDetailsPage** (`src/pages/GroupDetailsPage.tsx`)
   - Uses `useGroupSusu` and `useGroupParticipants` hooks
   - Shows real-time group information
   - Displays actual participant data

3. **GroupManagementPage** (`src/pages/GroupManagementPage.tsx`)
   - Fetches live group data from blockchain
   - Shows real participant contribution status
   - Calculates actual deadlines and rounds

4. **CreateGroupPage** (`src/pages/CreateGroupPage.tsx`) - NEW
   - Dedicated page for creating new groups
   - Uses `CreateGroupForm` component with smart contract integration
   - Accessible via `/create-group` route
   - Includes helpful information about how group susu works

## Verification

To verify the deployment:

```bash
# View package details
sui client object 0x82c9dfda9ac3821f1b652388cc8d5651738956a2255bece3c8817050124c12d1

# View AdminCap
sui client object 0xa93f85202b2de6a1a232bd3ff3af8801bb030bb65e7cbe8f9ba4aaebfa204aec

# View PlatformConfig
sui client object 0x8a83abf7f99b90ecdb912d2648c1563de4f829a7e38736784fc02b74dfc4cdf1

# View NFTCollection
sui client object 0xa1e48c562b8d36d342dd0ecc7724ed0aa16c850123c941b8513cdecebb6405e8
```

## Explorer Links

- **Package:** https://suiscan.xyz/devnet/object/0x82c9dfda9ac3821f1b652388cc8d5651738956a2255bece3c8817050124c12d1
- **Transaction:** https://suiscan.xyz/devnet/tx/G9zDUDYt4dn1yLZTBnurnX8VViMfqytdRAqEdcHUKmoM

## Next Steps

1. ✅ Smart contracts deployed to Sui devnet
2. ✅ Frontend constants updated with deployed addresses
3. ✅ Mock data replaced with blockchain integration in key pages
4. ⏳ Test all frontend functionality with deployed contracts
5. ⏳ Create test groups and verify end-to-end flows
6. ⏳ Deploy to testnet/mainnet when ready

## Notes

- The AdminCap is currently owned by the deployer address
- All modules compiled successfully with only minor warnings about duplicate aliases
- The frontend is configured to use TanStack Query for efficient data fetching
- Hooks are properly implemented for all smart contract interactions
