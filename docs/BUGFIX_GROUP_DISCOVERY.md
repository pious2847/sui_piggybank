# Bug Fix: Group Discovery Issue

## Problem

After creating a new group, it wasn't appearing on the Explore page even though the transaction was successful.

**Example Transaction:** https://suiscan.xyz/devnet/tx/5f4eKZ44hKLaoA6KBmpkHj9CtpNbM65Qh3ZvNm4WJWn9

## Root Cause

The `useAllGroups` hook was querying for `GroupCreatedEvent` events to discover groups:

```typescript
const response = await suiClient.queryEvents({
  query: {
    MoveEventType: `${DEVNET_COUNTER_PACKAGE_ID}::group_susu::GroupCreatedEvent`,
  },
  // ...
});
```

However, the smart contract's `create_group_susu` function **did not emit this event**. It only created and shared the GroupSusu object without emitting any discovery event.

## Solution

### 1. Added GroupCreatedEvent to Smart Contract

Added a new event struct in `move/counter/sources/group_susu.move`:

```move
/// Event emitted when a new group is created
/// Used for discovering and listing groups
public struct GroupCreatedEvent has copy, drop {
    /// ID of the newly created group
    group_id: ID,
    /// Name of the group
    name: String,
    /// Address of the group creator
    creator: address,
    /// Contribution amount per round
    contribution_amount: u64,
    /// Contribution frequency in milliseconds
    contribution_frequency_ms: u64,
    /// Maximum number of participants
    max_participants: u64,
    /// Timestamp when group was created
    timestamp: u64,
}
```

### 2. Emit Event in create_group_susu Function

Modified the `create_group_susu` function to emit the event:

```move
// Emit group created event for discovery
event::emit(GroupCreatedEvent {
    group_id: object::id(&group_susu),
    name,
    creator,
    contribution_amount,
    contribution_frequency_ms,
    max_participants,
    timestamp: created_at,
});

// Share the object so multiple participants can interact with it
transfer::share_object(group_susu);
```

### 3. Upgraded Smart Contract

Performed a package upgrade on Sui Devnet:

- **Original Package ID (v1):** `0x82c9dfda9ac3821f1b652388cc8d5651738956a2255bece3c8817050124c12d1`
- **Upgraded Package ID (v2):** `0x9b1528e6f84c7feef7e61c2db616f533bee68b37b28977254007142b2e0fcf38`
- **Upgrade Transaction:** `37ae1bPASzM6kKbfYH6NJycDgCDexdjLCmm6evY47qh4`

### 4. Updated Frontend Constants

Updated `src/constants.ts` with the new package ID:

```typescript
export const DEVNET_COUNTER_PACKAGE_ID = "0x9b1528e6f84c7feef7e61c2db616f533bee68b37b28977254007142b2e0fcf38";
```

## Result

✅ New groups now emit `GroupCreatedEvent` when created  
✅ The Explore page can discover and list all created groups  
✅ Frontend queries work correctly with the event-based discovery system  
✅ No breaking changes to existing functionality

## Testing

To verify the fix:

1. Create a new group using the "Create Group" page
2. Wait a few seconds for the transaction to complete
3. Navigate to the Explore page
4. The newly created group should appear in the list

## Notes

- Groups created with the old contract (v1) will not appear because they don't have the event
- All new groups created with v2 will be discoverable
- The upgrade maintains backward compatibility with existing shared objects
- The UpgradeCap remains with the deployer for future upgrades

## Alternative Approaches Considered

1. **Query shared objects directly** - Not feasible because Sui doesn't provide a direct way to query all shared objects of a specific type without an indexer
2. **Use other events (ContributionMadeEvent)** - Would only show groups that have contributions, not newly created empty groups
3. **Maintain an off-chain index** - Adds complexity and centralization

The event-based approach is the most efficient and decentralized solution.
