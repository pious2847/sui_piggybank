# Implementation: User Groups Hook

## What Was Implemented

Replaced the TODO/mock data in `useUserGroups.ts` with actual blockchain integration to fetch groups where a user is a participant.

## Previous Implementation

The hook was returning hardcoded mock data:

```typescript
// Mock data for development
const mockGroups: GroupSusuMembership[] = [
  {
    id: "0xgroup1",
    name: "Monthly Savings Circle",
    // ... hardcoded values
  },
  // ...
];

return mockGroups;
```

## New Implementation

Now queries the blockchain to find actual groups where the user is a participant:

### How It Works

1. **Query All Groups**
   - Fetches all `GroupCreatedEvent` events to discover groups
   - Extracts group IDs from the events

2. **Fetch Group Details**
   - For each group ID, fetches the full GroupSusu object
   - Checks if the user's address is in the participants list

3. **Filter User's Groups**
   - Only returns groups where the user is a participant
   - Calculates the user's position in the payout rotation

4. **Return Structured Data**
   - Maps blockchain data to the `GroupSusuMembership` interface
   - Includes all relevant group information

### Key Features

- ✅ **Real-time Data**: Fetches actual group data from the blockchain
- ✅ **User Filtering**: Only shows groups the user has joined
- ✅ **Position Tracking**: Calculates user's position in the payout queue
- ✅ **Error Handling**: Gracefully handles errors and returns empty array
- ✅ **Caching**: Uses TanStack Query for efficient caching and refetching

## Code Structure

```typescript
export function useUserGroups(address: string | undefined) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: getUserGroupsQueryKey(address || ""),
    queryFn: async () => {
      if (!address) return [];

      // 1. Query for all GroupCreatedEvent events
      const response = await suiClient.queryEvents({
        query: {
          MoveEventType: `${DEVNET_COUNTER_PACKAGE_ID}::group_susu::GroupCreatedEvent`,
        },
        limit: 50,
        order: "descending",
      });

      // 2. Extract group IDs
      const groupIds = response.data
        .map((event) => event.parsedJson?.group_id)
        .filter(Boolean);

      // 3. Fetch and filter groups
      const groupPromises = groupIds.map(async (groupId) => {
        const object = await suiClient.getObject({
          id: groupId,
          options: { showContent: true, showType: true },
        });

        // Check if user is a participant
        const participants = fields.participants || [];
        if (!participants.includes(address)) {
          return null; // User not in this group
        }

        // Calculate user's position
        const roundRecipients = fields.round_recipients || [];
        const userPosition = roundRecipients.indexOf(address);

        return {
          id: object.data.objectId,
          name: fields.name,
          // ... map all fields
          userPosition,
        };
      });

      // 4. Return filtered groups
      return (await Promise.all(groupPromises)).filter(Boolean);
    },
    enabled: !!address,
    ...groupSusuQueryConfig,
  });
}
```

## Data Returned

Each group membership includes:

```typescript
interface GroupSusuMembership {
  id: string;                    // Group object ID
  name: string;                  // Group name
  creator: string;               // Creator's address
  contributionAmount: number;    // Amount per contribution (MIST)
  contributionFrequency: number; // Time between contributions (ms)
  maxParticipants: number;       // Maximum group size
  participantCount: number;      // Current number of participants
  balance: number;               // Current pool balance (MIST)
  currentRound: number;          // Current payout round
  totalRounds: number;           // Total rounds in cycle
  cycleComplete: boolean;        // Whether cycle is complete
  createdAt: number;             // Creation timestamp (ms)
  userPosition: number;          // User's position in payout queue
}
```

## Usage in Components

This hook is used in:

1. **Dashboard** - Shows user's active group memberships
2. **Profile Page** - Displays group participation history
3. **Group Management** - Lists groups where user is a member

Example usage:

```typescript
function MyGroupsComponent() {
  const currentAccount = useCurrentAccount();
  const { data: userGroups, isLoading } = useUserGroups(currentAccount?.address);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      {userGroups?.map(group => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
```

## Performance Considerations

- **Caching**: TanStack Query caches results to minimize blockchain queries
- **Stale Time**: Configured in `groupSusuQueryConfig` for optimal refresh
- **Pagination**: Currently fetches up to 50 groups (can be increased if needed)
- **Parallel Fetching**: Uses `Promise.all` to fetch group details concurrently

## Future Improvements

1. **Indexer Integration**: Use a Sui indexer for more efficient queries
2. **Pagination**: Add cursor-based pagination for users in many groups
3. **Real-time Updates**: Subscribe to events for live updates
4. **Filtering**: Add options to filter by active/completed cycles

## Testing

To verify the implementation:

1. Join one or more groups
2. Navigate to the Dashboard
3. Your groups should appear in the "My Groups" section
4. Check that the participant count and your position are correct
5. Verify that only groups you've joined are shown

## Files Modified

- `src/hooks/useUserGroups.ts` - Replaced mock data with blockchain integration
