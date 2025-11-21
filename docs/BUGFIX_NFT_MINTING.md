# Bug Fix: NFT Minting Functionality

## Problem

The NFT minting form existed but had critical bugs that prevented it from working:
1. Incorrectly querying for NFTCollection (trying to get owned objects instead of using the shared object ID)
2. The form was visible but would fail when trying to mint

## Root Cause

### Issue 1: Wrong NFTCollection Query
The code was trying to query for NFTCollection as an owned object:
```typescript
const { data: collections } = await suiClient.getOwnedObjects({
  owner: DEVNET_COUNTER_PACKAGE_ID,  // ❌ Wrong! Package ID is not an owner
  filter: {
    StructType: `${DEVNET_COUNTER_PACKAGE_ID}::nft_rewards::NFTCollection`,
  },
});
```

**Problem:** 
- NFTCollection is a **shared object**, not an owned object
- Package IDs cannot own objects
- This query would always return empty results

### Issue 2: Unused Import
The code imported `useSuiClient` but it's not needed since we have the NFT_COLLECTION_ID constant.

## Solution

### Fixed NFTCollection Reference
Instead of querying, use the constant that was already deployed:

```typescript
// Use the NFT_COLLECTION_ID constant (shared object)
tx.moveCall({
  target: `${DEVNET_COUNTER_PACKAGE_ID}::nft_rewards::mint_reward`,
  arguments: [
    tx.object(adminCapId),
    tx.object(NFT_COLLECTION_ID),  // ✅ Use the constant!
    tx.pure.address(selectedUser),
    tx.pure.u8(achievementType),
    tx.pure.string(imageBlobId),
    tx.pure.string(metadataBlobId),
    tx.pure.u64(earnedAt),
  ],
});
```

### Removed Unnecessary Code
- Removed `useSuiClient` import
- Removed the entire NFTCollection query section
- Simplified the flow

## How NFT Minting Works Now

### 1. User Selection
- Admin navigates to **🎨 NFT Rewards** tab
- Views list of eligible users (from PendingRewards component)
- Clicks on a user to select them

### 2. Achievement Selection
- Dropdown shows available achievements:
  - Cycle Completion Champion (Type 1)
  - 5 Cycles Milestone (Type 2)
  - 10 Cycles Milestone (Type 3)
  - Perfect Attendance (Type 4)

### 3. Image Upload
- Admin uploads NFT artwork
- Image preview shown
- Can remove and re-upload

### 4. Walrus Upload Process
```
1. Upload image to Walrus → Get imageBlobId
2. Create metadata JSON with:
   - name
   - description
   - image URL (Walrus aggregator + blobId)
   - attributes (achievement type, date)
3. Upload metadata to Walrus → Get metadataBlobId
```

### 5. Mint Transaction
```
Call: nft_rewards::mint_reward
Args:
  - AdminCap (for authorization)
  - NFTCollection (shared object)
  - recipient address
  - achievement_type (1-4)
  - image_url (Walrus blob ID)
  - metadata_url (Walrus blob ID)
  - earned_at (timestamp)
```

### 6. NFT Creation
The smart contract:
- Validates admin authorization
- Gets reward template for achievement type
- Creates NFTReward object with:
  - Template name and description
  - Walrus blob IDs
  - Achievement type
  - Timestamp
  - Recipient address
- Emits NFTMintedEvent
- Transfers NFT to recipient
- Increments total_minted counter

## NFT Structure

```move
public struct NFTReward has key, store {
    id: UID,
    name: String,              // From template
    description: String,       // From template
    image_url: String,         // Walrus blob ID
    metadata_url: String,      // Walrus blob ID
    achievement_type: u8,      // 1-4
    earned_at: u64,           // Timestamp
    recipient: address,        // Who earned it
}
```

## Walrus Integration

### Testnet URLs
- **Publisher:** `https://publisher.walrus-testnet.walrus.space`
- **Aggregator:** `https://aggregator.walrus-testnet.walrus.space`

### Upload Process
```typescript
// Upload to Walrus
const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/store`, {
  method: "PUT",
  body: data,  // File or JSON blob
});

// Get blob ID from response
const blobId = result.newlyCreated?.blobObject?.blobId 
            || result.alreadyCertified?.blobId;

// Access via aggregator
const url = `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`;
```

## UI Flow

### Before Fix
1. Select user ✅
2. Select achievement ✅
3. Upload image ✅
4. Click "Mint NFT Reward" ❌
5. **Error:** "NFT collection not found"

### After Fix
1. Select user ✅
2. Select achievement ✅
3. Upload image ✅
4. Click "Mint NFT Reward" ✅
5. Upload image to Walrus ✅
6. Upload metadata to Walrus ✅
7. Mint NFT transaction ✅
8. Success! NFT sent to user ✅

## Testing the Fix

### Prerequisites
- Admin wallet connected
- AdminCap owned by connected wallet
- Navigate to Admin Dashboard → 🎨 NFT Rewards tab

### Steps to Test
1. **Select a User**
   - Click on a user from the "Pending Rewards" list
   - User address should appear in the mint form

2. **Choose Achievement**
   - Select from dropdown (e.g., "Cycle Completion Champion")

3. **Upload Image**
   - Click "Choose File" or drag & drop
   - Image preview should appear
   - Recommended: 512x512 or 1024x1024 PNG/JPG

4. **Mint NFT**
   - Click "Mint NFT Reward" button
   - Watch status messages:
     - "Uploading image to Walrus..."
     - "Image uploaded: abc12345..."
     - "Uploading metadata to Walrus..."
     - "Metadata uploaded: def67890..."
     - "Minting NFT..."
   - Approve transaction in wallet
   - Success message appears
   - Form resets after 3 seconds

5. **Verify**
   - Check user's wallet for the new NFT
   - NFT should have:
     - Correct name (from template)
     - Uploaded image
     - Achievement attributes
     - Earned date

## Constants Used

```typescript
// From src/constants.ts
export const DEVNET_COUNTER_PACKAGE_ID = "0x9b1528e6f84c7feef7e61c2db616f533bee68b37b28977254007142b2e0fcf38";
export const NFT_COLLECTION_ID = "0xa1e48c562b8d36d342dd0ecc7724ed0aa16c850123c941b8513cdecebb6405e8";
```

## Achievement Types

| Type | Name | Description |
|------|------|-------------|
| 1 | Cycle Completion Champion | Completed a full group susu cycle |
| 2 | 5 Cycles Milestone | Completed 5 group susu cycles |
| 3 | 10 Cycles Milestone | Completed 10 group susu cycles |
| 4 | Perfect Attendance | Made all contributions on time |

## Error Handling

The form now handles:
- ✅ Missing user selection
- ✅ Missing achievement selection
- ✅ Missing image upload
- ✅ Walrus upload failures
- ✅ Transaction failures
- ✅ Invalid blob IDs

Error messages are displayed in red boxes with clear descriptions.

## Files Modified

- `src/components/admin/MintNFTForm.tsx` - Fixed NFTCollection query and transaction

## Summary

The NFT minting functionality now works correctly! Admins can:
- ✅ Select eligible users
- ✅ Choose achievement types
- ✅ Upload custom artwork
- ✅ Mint NFTs with Walrus-stored assets
- ✅ Distribute rewards to users

The fix was simple but critical: use the NFT_COLLECTION_ID constant instead of trying to query for it.
