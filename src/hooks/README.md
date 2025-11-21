# Blockchain Data Hooks

This directory contains TanStack Query hooks for fetching and managing blockchain data from the SuiVault platform.

## Overview

All hooks are configured with optimal caching strategies to reduce redundant network calls and improve application performance. They include:
- Automatic retry with exponential backoff
- Background refetching when data becomes stale
- Refetch on window focus and network reconnect
- Proper cache invalidation after transactions

## Available Hooks

### Group Susu Hooks

#### `useGroupSusu(groupId)`
Fetches detailed information about a specific GroupSusu object.

```typescript
import { useGroupSusu } from './hooks';

function GroupDetails({ groupId }) {
  const { data: group, isLoading, error } = useGroupSusu(groupId);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading group</div>;
  
  return (
    <div>
      <h2>{group.name}</h2>
      <p>Contribution: {group.contributionAmount} MIST</p>
      <p>Participants: {group.participantCount}/{group.maxParticipants}</p>
    </div>
  );
}
```

#### `useGroupParticipants(groupId)`
Fetches detailed participant information for a specific group.

```typescript
const { data: participants } = useGroupParticipants(groupId);
```

#### `useIsGroupParticipant(groupId, userAddress)`
Checks if a user is a participant in a specific group.

```typescript
const { isParticipant, isCreator, userPosition } = useIsGroupParticipant(groupId, userAddress);
```

#### `useAllGroups(filters, cursor, limit)`
Fetches all active GroupSusu objects with pagination and filtering.

```typescript
const { data, isLoading } = useAllGroups(
  { 
    minContribution: 1_000_000_000, // 1 SUI
    maxContribution: 10_000_000_000, // 10 SUI
    hasAvailableSlots: true,
    searchQuery: "savings"
  },
  null, // cursor for pagination
  20 // limit
);

// Access results
const groups = data?.groups || [];
const hasMore = data?.hasNextPage;
const nextCursor = data?.nextCursor;
```

#### `useFeaturedGroups(limit)`
Fetches featured groups with available slots.

```typescript
const { data: featuredGroups } = useFeaturedGroups(6);
```

#### `useSearchGroups(searchQuery, limit)`
Searches groups by name.

```typescript
const { data } = useSearchGroups("monthly", 20);
```

#### `useUserGroups(address)`
Fetches all groups a user is participating in.

```typescript
const { data: userGroups } = useUserGroups(currentAddress);
```

### Reputation Hooks

#### `useReputationProfile(address)`
Fetches a user's reputation profile.

```typescript
const { data: profile } = useReputationProfile(userAddress);

// Access reputation data
const score = profile?.reputationScore;
const cyclesCompleted = profile?.cyclesCompleted;
```

#### `useReputationEvents(address)`
Fetches reputation events for a user (history of earned points).

```typescript
const { data: events } = useReputationEvents(userAddress);

// Events include: contribution, cycle_complete, milestone
events?.forEach(event => {
  console.log(`Earned ${event.pointsEarned} points for ${getEventTypeString(event.eventType)}`);
});
```

### NFT Hooks

#### `useUserNFTs(address)`
Fetches all NFT rewards owned by a user.

```typescript
const { data: nfts } = useUserNFTs(userAddress);

// NFTs are sorted by earned date (most recent first)
nfts?.forEach(nft => {
  console.log(`${nft.name}: ${nft.description}`);
});
```

#### `useNFTMintEvents(address)`
Fetches NFT minting events for a user.

```typescript
const { data: mintEvents } = useNFTMintEvents(userAddress);
```

### Platform Stats Hooks

#### `usePlatformStats()`
Fetches platform-wide statistics for the admin dashboard.

```typescript
const { data: stats } = usePlatformStats();

// Access platform metrics
const totalUsers = stats?.totalUsers;
const activeGroups = stats?.activeGroups;
const completedCycles = stats?.completedCycles;
const totalNFTsMinted = stats?.totalNFTsMinted;
```

## Cache Invalidation

After successful transactions, use the `useCacheInvalidation` hook to update the UI with the latest blockchain state.

```typescript
import { useCacheInvalidation } from './hooks';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

function JoinGroupButton({ groupId, userAddress }) {
  const { invalidateAfterJoinGroup } = useCacheInvalidation();
  const { mutate: executeTransaction } = useSignAndExecuteTransaction();
  
  const handleJoinGroup = () => {
    executeTransaction(
      { transaction: txb },
      {
        onSuccess: async () => {
          // Invalidate relevant queries to refetch fresh data
          await invalidateAfterJoinGroup(userAddress, groupId);
          toast.success("Successfully joined group!");
        },
      }
    );
  };
  
  return <button onClick={handleJoinGroup}>Join Group</button>;
}
```

### Available Invalidation Functions

- `invalidateAfterJoinGroup(userAddress, groupId)` - After joining a group
- `invalidateAfterContribution(userAddress, groupId)` - After making a contribution
- `invalidateAfterDistribution(groupId, recipientAddress)` - After round distribution
- `invalidateAfterCycleComplete(groupId, participantAddresses)` - After cycle completion
- `invalidateAfterNFTMint(recipientAddress)` - After NFT minting
- `invalidateAfterGroupCreate(creatorAddress)` - After creating a group
- `invalidateAfterReputationCreate(userAddress)` - After creating reputation profile
- `invalidateAll()` - Invalidate all queries (use sparingly)

## Query Configuration

All hooks use optimized caching strategies defined in `src/queryConfig.ts`:

- **Group Susu queries**: 15s stale time (data changes with contributions)
- **Reputation queries**: 15s stale time (updates with contributions and cycles)
- **NFT queries**: 30s stale time (NFTs don't change after minting)
- **Platform stats**: 30s stale time (aggregate data changes slowly)
- **All groups**: 30s stale time (list doesn't change frequently)

All queries include:
- 3 retry attempts with exponential backoff
- 10-minute garbage collection time
- Refetch on window focus and network reconnect
- Background refetching when stale

## Best Practices

1. **Always enable queries conditionally**: Use the `enabled` option to prevent queries when data isn't available
   ```typescript
   const { data } = useGroupSusu(groupId, { enabled: !!groupId });
   ```

2. **Handle loading and error states**: Always check `isLoading` and `error` before rendering data
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Invalidate cache after transactions**: Always invalidate relevant queries after successful transactions
   ```typescript
   onSuccess: async () => {
     await invalidateAfterContribution(userAddress, groupId);
   }
   ```

4. **Use pagination for large lists**: Use the cursor-based pagination for `useAllGroups`
   ```typescript
   const [cursor, setCursor] = useState(null);
   const { data } = useAllGroups(filters, cursor, 20);
   ```

5. **Combine hooks for complex queries**: Use multiple hooks together for comprehensive data
   ```typescript
   const { data: group } = useGroupSusu(groupId);
   const { data: participants } = useGroupParticipants(groupId);
   const { isParticipant } = useIsGroupParticipant(groupId, userAddress);
   ```

## TypeScript Support

All hooks are fully typed with TypeScript interfaces. Import types as needed:

```typescript
import type { 
  GroupSusu, 
  ParticipantInfo, 
  ReputationProfile, 
  NFTData,
  PlatformStats 
} from './hooks';
```
