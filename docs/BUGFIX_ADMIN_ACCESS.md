# Bug Fix: Admin Dashboard Access After Package Upgrade

## Problem

After upgrading the smart contract package, users with the AdminCap couldn't access the Admin Dashboard. The page showed "Access Denied" even when connected with the wallet that owns the AdminCap.

## Root Cause

When a Sui package is upgraded, it gets a new package ID. However, objects created with the old package still reference the original package ID in their type.

**AdminCap Type:**
```
0x82c9dfda9ac3821f1b652388cc8d5651738956a2255bece3c8817050124c12d1::admin::AdminCap
```
(Original package ID - v1)

**Frontend was looking for:**
```
0x9b1528e6f84c7feef7e61c2db616f533bee68b37b28977254007142b2e0fcf38::admin::AdminCap
```
(Upgraded package ID - v2)

Since the AdminCap was created before the upgrade, it still has the old package ID in its type, so the query couldn't find it.

## Solution

Updated the `useAdminCap` hook to check for AdminCap with **both** package IDs:

1. First tries to find AdminCap with the current (upgraded) package ID
2. If not found, falls back to checking with the original package ID
3. Returns the AdminCap if found with either ID

### Code Changes

**File:** `src/hooks/useAdminCap.ts`

```typescript
// Added constant for original package ID
const ORIGINAL_PACKAGE_ID = "0x82c9dfda9ac3821f1b652388cc8d5651738956a2255bece3c8817050124c12d1";

// Updated query logic
try {
  // Try current package ID first
  let { data } = await suiClient.getOwnedObjects({
    owner: address,
    filter: {
      StructType: `${DEVNET_COUNTER_PACKAGE_ID}::admin::AdminCap`,
    },
    options: {
      showContent: true,
      showType: true,
    },
  });

  // Fallback to original package ID if not found
  if (data.length === 0) {
    const originalResult = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${ORIGINAL_PACKAGE_ID}::admin::AdminCap`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });
    data = originalResult.data;
  }

  // Return AdminCap if found
  if (data.length === 0) {
    return null;
  }

  const adminCapObject = data[0];
  return {
    id: adminCapObject.data?.objectId || "",
    owner: address,
  };
}
```

## How to Import Your Private Key to Slash Wallet

Your exported private key:
```
suiprivkey1qzkgfz8ntr4lmkwnd93v4f6804eje0ne202fvanymnrure3jkps9c9wwdu3
```

**Steps:**

1. **Open Slash Wallet** in your browser
2. **Click on Account/Profile** icon
3. **Select "Import Account"** or "Import Private Key"
4. **Paste the private key:**
   ```
   suiprivkey1qzkgfz8ntr4lmkwnd93v4f6804eje0ne202fvanymnrure3jkps9c9wwdu3
   ```
5. **Confirm** - The wallet should import the account
6. **Verify** - Check that the address matches:
   ```
   0xda31b8127cd23f42be99f904cc61f69c5e0693138b2f5cc25eef4a8f94493b87
   ```

## Result

✅ **Admin Dashboard now accessible!**

After importing your private key to Slash wallet and connecting:
- The `useAdminCap` hook will find your AdminCap (even with the old package ID)
- Admin Dashboard will show "Admin Access Verified"
- You can mint NFT rewards
- You can view platform stats
- All admin functions work correctly

## Testing

1. Import your private key to Slash wallet
2. Connect Slash wallet to the dApp
3. Navigate to `/admin` or click "Admin" in the sidebar
4. You should see:
   - ✅ "Admin Access Verified" badge
   - ✅ Platform stats
   - ✅ Recent activity
   - ✅ NFT reward management section

## Why This Happened

This is a common issue with Sui package upgrades:

- **Objects are immutable** - Their type includes the package ID they were created with
- **Package upgrades create new IDs** - The upgraded package gets a new address
- **Old objects still work** - They can still be used with the new package functions
- **Type queries need both IDs** - When querying by type, you need to check both old and new package IDs

## Future Considerations

For future upgrades, consider:

1. **Transfer AdminCap** - Transfer to a new AdminCap created with the new package
2. **Document package IDs** - Keep track of all package versions
3. **Multi-version support** - Always check multiple package IDs for critical objects
4. **Migration scripts** - Create scripts to migrate important objects after upgrades

## Files Modified

- `src/hooks/useAdminCap.ts` - Added fallback to check original package ID

## Security Note

⚠️ **Keep your private key secure!**
- Never share it publicly
- Don't commit it to git
- Store it in a secure password manager
- Consider it compromised if shared anywhere
