# Feature: Contribute Button on Group Management Page

## What Was Added

Added a **Contribute Button** to the Group Management page, allowing users to make their required contributions directly from the management interface.

## Changes Made

### 1. Updated GroupManagementPage (`src/pages/GroupManagementPage.tsx`)

**Added:**
- Import for `ContributeButton` component
- New "Make Contribution" card in the sidebar
- Shows required contribution amount
- Displays contribution frequency
- Includes helpful tip about reputation points

**Location:**
The contribute section appears in the right sidebar, below the "Your Position" card, and only shows when:
- User is a participant in the group
- The cycle is not complete

### 2. Fixed contributeTx Function (`src/utils/transactions.ts`)

**Issue:**
The function was missing the `public_key` parameter required by the smart contract.

**Fix:**
Added an empty public key vector as a parameter:
```typescript
const emptyPublicKey: number[] = [];

tx.moveCall({
  target: `${packageId}::group_susu::contribute`,
  arguments: [
    tx.object(groupId),
    coin,
    tx.pure.vector("u8", emptyPublicKey), // Added public key
    tx.object(SUI_CLOCK_OBJECT_ID),
  ],
});
```

**Note:** The public key is currently empty. In production, this would be the user's actual public key for Seal encryption of contribution data.

## UI Features

### Contribute Card Shows:

1. **Required Amount**
   - Displays the exact contribution amount in SUI
   - Shows contribution frequency (e.g., "Due every 30 days")

2. **Helpful Tip**
   - Reminds users that on-time contributions earn reputation points

3. **Contribute Button**
   - Large, prominent button with the exact amount
   - Shows "Contributing..." state during transaction
   - Disabled when wallet not connected or transaction pending

### Transaction Flow

When user clicks "Contribute":

1. **Transaction Creation**
   - Splits the exact contribution amount from gas coins
   - Calls `group_susu::contribute` with all required parameters

2. **Confirmation Modal**
   - Shows transaction status (pending/success/error)
   - Displays transaction digest on success
   - Allows retry on error

3. **On Success**
   - Invalidates and refetches group data
   - Updates participant contribution status
   - Updates user's reputation profile
   - Shows success message with reputation points earned

4. **Cache Invalidation**
   - `groupSusu` - Refreshes group details
   - `groupParticipants` - Updates participant list
   - `reputationProfile` - Updates user's reputation
   - `userGroups` - Refreshes user's group memberships

## Smart Contract Integration

The contribute function in the smart contract:

```move
public fun contribute(
    group: &mut GroupSusu,
    payment: Coin<SUI>,
    public_key: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
)
```

**What it does:**
- Verifies user is a participant
- Validates contribution amount matches required amount
- Adds contribution to group balance
- Updates last contribution time
- Determines if contribution is on-time
- Encrypts contribution details (if public key provided)
- Emits `ContributionMadeEvent` for reputation tracking

## User Experience

### Before
- No way to contribute from the management page
- Users had to navigate elsewhere or use external tools

### After
- ✅ One-click contribution directly from management page
- ✅ Clear display of required amount and frequency
- ✅ Visual feedback during transaction
- ✅ Automatic data refresh after contribution
- ✅ Reputation points earned automatically

## Visual Design

The contribute card features:
- 💰 Money bag emoji for visual identification
- Emerald green color scheme for the amount
- Blue info box with reputation tip
- Large, gradient button (emerald to teal)
- Consistent with the app's glassmorphism design

## Testing

To test the feature:

1. Navigate to a group you're a member of
2. Go to the Group Management page
3. Look for the "Make Contribution" card in the right sidebar
4. Click the "Contribute X SUI" button
5. Approve the transaction in your wallet
6. Wait for confirmation
7. Verify:
   - Your contribution status updates
   - Pool balance increases
   - Your contribution count increases
   - Reputation points are awarded (check profile)

## Future Enhancements

1. **Contribution History** - Show past contributions with timestamps
2. **Auto-contribute** - Set up automatic contributions
3. **Contribution Reminders** - Notifications before deadline
4. **Batch Contributions** - Pay multiple rounds at once
5. **Seal Encryption** - Implement actual public key encryption for privacy

## Files Modified

- `src/pages/GroupManagementPage.tsx` - Added contribute button and card
- `src/utils/transactions.ts` - Fixed contributeTx to include public_key parameter
- `src/components/group/ContributeButton.tsx` - Already existed, no changes needed
