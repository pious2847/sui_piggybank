# Walrus SDK Integration Status

## Current Situation

### Package Version Incompatibility

The Walrus SDK integration is currently **blocked by package version incompatibilities**:

| Package | Current Version | Required Version | Status |
|---------|----------------|------------------|--------|
| `@mysten/sui` | 1.37.4 | 1.45.0+ | ❌ Incompatible |
| `@mysten/dapp-kit` | 0.17.5 | 0.18.0+ | ❌ Incompatible |
| `@mysten/walrus` | 0.8.4 | 0.8.4 | ✅ Installed |

### What Works ✅

**Reading from Walrus** works perfectly using the HTTP aggregator API:

```typescript
// Fetch text data
const data = await fetchFromWalrus(blobId);

// Fetch JSON
const json = await fetchJSONFromWalrus(blobId);

// Fetch binary (images)
const blob = await fetchBlobFromWalrus(blobId);

// Direct URL for <img> tags
const url = getWalrusUrl(blobId);
```

**Example:**
```typescript
// This works!
const imageUrl = getWalrusUrl('abc123...');
<img src={imageUrl} alt="NFT" />
```

### What Doesn't Work ❌

**Writing to Walrus** requires the full SDK integration which needs:

1. `@mysten/sui` v1.45.0+ for the `$extend()` method
2. `@mysten/dapp-kit` v0.18.0+ for compatible wallet hooks
3. Proper Walrus SDK initialization with WASM bindings

**Current Error:**
```typescript
await uploadToWalrus(data);
// ❌ Throws: SDK_VERSION_INCOMPATIBLE
// "Walrus uploads require upgrading @mysten/sui to v1.45.0+"
```

## Why Can't We Upgrade?

Upgrading `@mysten/sui` and `@mysten/dapp-kit` to the required versions would:

1. **Break existing code** - The entire app uses v1.37.4 APIs
2. **Require extensive refactoring** - Wallet hooks, transaction building, etc.
3. **Risk introducing bugs** - All blockchain interactions would need testing
4. **Time-consuming** - Would need to update hundreds of lines of code

## Solutions & Workarounds

### Option 1: Use Walrus CLI (Recommended for Development)

The Walrus CLI can upload files directly:

```bash
# Install Walrus CLI
curl -fsSL https://walrus.site/install.sh | sh

# Upload a file
walrus store myfile.jpg --epochs 5

# Returns blob ID: abc123...
```

**Pros:**
- ✅ Works immediately
- ✅ No code changes needed
- ✅ Perfect for testing NFT minting

**Cons:**
- ❌ Manual process
- ❌ Not integrated into UI

### Option 2: Backend Upload Service

Create a simple backend service that handles Walrus uploads:

```typescript
// Backend (Node.js with proper SDK version)
app.post('/api/walrus/upload', async (req, res) => {
  const { data, epochs } = req.body;
  const blobId = await walrusClient.upload(data, epochs);
  res.json({ blobId });
});

// Frontend
const response = await fetch('/api/walrus/upload', {
  method: 'POST',
  body: JSON.stringify({ data, epochs: 5 }),
});
const { blobId } = await response.json();
```

**Pros:**
- ✅ Integrated into UI
- ✅ No frontend package upgrades needed
- ✅ Can add rate limiting, validation, etc.

**Cons:**
- ❌ Requires backend infrastructure
- ❌ Additional complexity

### Option 3: Use Walrus Publisher HTTP API (If Available)

Some Walrus publishers expose HTTP endpoints for uploads:

```typescript
const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/store', {
  method: 'PUT',
  body: fileData,
});
```

**Status:** Currently returns 404 - endpoint may not be publicly available or requires authentication.

### Option 4: Upgrade Packages (Future)

When ready to upgrade the entire app:

```bash
npm install @mysten/sui@latest @mysten/dapp-kit@latest
```

Then update all code to use new APIs.

**Timeline:** Major refactoring effort, recommended for a dedicated sprint.

## Current Implementation

### File Structure

```
src/
├── utils/
│   └── walrus.ts          # Walrus utility functions
├── hooks/
│   └── useWalrus.ts       # React hooks for Walrus
└── lib/
    └── walrusClient.ts    # Client initialization (simplified)
```

### Available Functions

#### Reading (✅ Works)

```typescript
import { 
  fetchFromWalrus,
  fetchJSONFromWalrus,
  fetchBlobFromWalrus,
  getWalrusUrl 
} from './utils/walrus';

// Fetch text
const text = await fetchFromWalrus(blobId);

// Fetch and parse JSON
const metadata = await fetchJSONFromWalrus(blobId);

// Fetch binary data
const imageBlob = await fetchBlobFromWalrus(blobId);

// Get direct URL
const url = getWalrusUrl(blobId);
```

#### Writing (❌ Blocked)

```typescript
import { uploadToWalrus } from './utils/walrus';

try {
  const blobId = await uploadToWalrus(data);
} catch (error) {
  // Error: SDK_VERSION_INCOMPATIBLE
  console.error(error.message);
  // "Walrus uploads require upgrading @mysten/sui to v1.45.0+"
}
```

### React Hooks

```typescript
import { 
  useWalrusData,
  useWalrusJSON,
  useWalrusBlob,
  useWalrusUrl 
} from './hooks/useWalrus';

// Fetch with React Query
const { data, isLoading } = useWalrusJSON(metadataBlobId);

// Get URL
const imageUrl = useWalrusUrl(imageBlobId);
```

## Recommended Workflow for NFT Minting

### Current Best Practice

1. **Upload images using Walrus CLI:**
   ```bash
   walrus store nft-image.png --epochs 5
   # Returns: abc123...
   ```

2. **Create metadata JSON locally:**
   ```json
   {
     "name": "Achievement NFT",
     "description": "Awarded for completing 5 cycles",
     "image": "https://aggregator.walrus-testnet.walrus.space/v1/abc123...",
     "attributes": [...]
   }
   ```

3. **Upload metadata using Walrus CLI:**
   ```bash
   walrus store metadata.json --epochs 5
   # Returns: def456...
   ```

4. **Mint NFT with blob IDs:**
   ```typescript
   const imageBlobId = 'abc123...';  // From step 1
   const metadataBlobId = 'def456...';  // From step 3
   
   tx.moveCall({
     target: `${PACKAGE_ID}::nft_rewards::mint_reward`,
     arguments: [
       tx.object(adminCapId),
       tx.object(NFT_COLLECTION_ID),
       tx.pure.address(recipient),
       tx.pure.u8(achievementType),
       tx.pure.string(imageBlobId),
       tx.pure.string(metadataBlobId),
       tx.pure.u64(Date.now()),
     ],
   });
   ```

### Testing NFT Display

Once minted, the NFT metadata and image can be fetched:

```typescript
// Fetch metadata
const metadata = await fetchJSONFromWalrus(metadataBlobId);

// Display image
<img src={getWalrusUrl(imageBlobId)} alt={metadata.name} />
```

## Future Roadmap

### Phase 1: Current (Manual Uploads)
- ✅ Reading from Walrus works
- ✅ NFT minting with pre-uploaded blobs works
- ⏳ Manual CLI uploads for testing

### Phase 2: Backend Service (Short-term)
- 🎯 Create upload API endpoint
- 🎯 Integrate with frontend forms
- 🎯 Add file validation and processing

### Phase 3: Full SDK Integration (Long-term)
- 📅 Upgrade @mysten packages
- 📅 Refactor all blockchain code
- 📅 Full wallet-integrated uploads
- 📅 Multi-step upload flow with progress

## Testing Checklist

### What You Can Test Now ✅

- [x] Fetch existing Walrus blobs
- [x] Display images from Walrus
- [x] Fetch NFT metadata
- [x] Mint NFTs with pre-uploaded blob IDs
- [x] View minted NFTs

### What Requires Workaround ⏳

- [ ] Upload images from browser
- [ ] Upload metadata from browser
- [ ] End-to-end NFT minting flow

## Error Messages

### SDK_VERSION_INCOMPATIBLE

```
Walrus uploads require upgrading @mysten/sui to v1.45.0+ and @mysten/dapp-kit to v0.18.0+.
Current versions have compatibility issues.
Alternative: Use the Walrus CLI or a backend service for uploads.
```

**Solution:** Use Walrus CLI or wait for package upgrade.

### FETCH_FAILED

```
Failed to fetch from Walrus: 404 Not Found
```

**Possible causes:**
- Invalid blob ID
- Blob expired (past storage epochs)
- Network issues

**Solution:** Verify blob ID and check if blob still exists.

## Resources

### Documentation
- [Walrus SDK Docs](https://docs.walrus.site/dev-guide/typescript-sdk.html)
- [Walrus CLI Guide](https://docs.walrus.site/usage/client-cli.html)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)

### Walrus Testnet Endpoints
- **Aggregator:** https://aggregator.walrus-testnet.walrus.space
- **Publisher:** https://publisher.walrus-testnet.walrus.space

### CLI Installation
```bash
curl -fsSL https://walrus.site/install.sh | sh
```

## Summary

**Current Status:**
- ✅ **Reading works perfectly** - Can fetch and display Walrus data
- ❌ **Writing is blocked** - Requires package upgrades
- ⏳ **Workaround available** - Use Walrus CLI for uploads

**Recommended Action:**
Use Walrus CLI for development and testing. Plan backend service or package upgrade for production.

**Impact on NFT Minting:**
NFT minting works fine with pre-uploaded blob IDs. The only limitation is the upload step must be done outside the browser UI.
