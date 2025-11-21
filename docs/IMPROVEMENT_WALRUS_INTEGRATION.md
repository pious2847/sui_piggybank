# Improvement: Proper Walrus Integration

## What Was Improved

Refactored the NFT minting form to use the proper Walrus integration hooks instead of raw fetch calls, making the code cleaner, more maintainable, and following React best practices.

## Changes Made

### Before (Raw Fetch Approach)
```typescript
// Hardcoded URLs
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";
const WALRUS_PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";

// Manual fetch implementation
const uploadToWalrus = async (data: Blob): Promise<string> => {
  const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/store`, {
    method: "PUT",
    body: data,
  });
  // ... manual error handling
  const result = await response.json();
  // ... manual blob ID extraction
};

// Usage
const imageBlobId = await uploadToWalrus(imageFile);
const metadataBlobId = await uploadToWalrus(metadataBlob);
```

### After (Hook-Based Approach)
```typescript
// Use React Query hooks
const { mutateAsync: uploadFile } = useWalrusUpload();
const { mutateAsync: uploadJSON } = useWalrusUploadJSON();

// Usage with proper error handling and caching
const imageBlobId = await uploadFile({ data: imageFile, epochs: 5 });
const metadataBlobId = await uploadJSON({ data: metadata, epochs: 5 });
```

## Benefits

### 1. Centralized Configuration
- URLs are configured in one place (`src/utils/walrus.ts`)
- Can be changed via environment variables
- No hardcoded values scattered across components

### 2. Built-in Error Handling
- Automatic retry logic with exponential backoff
- Proper error types (`WalrusError`)
- Consistent error messages

### 3. Caching
- Automatic caching of uploaded blobs
- Reduces redundant uploads
- Improves performance

### 4. React Query Integration
- Automatic loading states
- Error states
- Cache invalidation
- Optimistic updates

### 5. Type Safety
- Proper TypeScript types
- Better IDE autocomplete
- Compile-time error checking

### 6. Reusability
- Hooks can be used in any component
- Consistent API across the app
- Easy to test

## Walrus Integration Architecture

### Current Implementation (HTTP API)

The current implementation uses the Walrus HTTP API (Publisher/Aggregator), which is actually the **recommended approach** for most applications according to the Walrus SDK documentation.

**Why HTTP API is Better:**
- Simple and straightforward
- Fewer requests (1 request to upload vs ~2200 with direct SDK)
- Works in all environments (browser, Node.js)
- No WASM dependencies
- Better for end-user applications

**When to Use TypeScript SDK:**
- Building custom aggregators or publishers
- Need direct control over storage nodes
- Users need to pay for their own storage directly
- Building infrastructure tools

### Walrus Utility Functions

Located in `src/utils/walrus.ts`:

```typescript
// Upload functions
uploadToWalrus(data, options)      // Upload any data
uploadJSONToWalrus(data, options)  // Upload JSON

// Fetch functions
fetchFromWalrus(blobId, options)   // Fetch as string
fetchJSONFromWalrus(blobId)        // Fetch and parse JSON
fetchBlobFromWalrus(blobId)        // Fetch as Blob (for images)

// Helper functions
getWalrusUrl(blobId)               // Get direct URL
clearWalrusCache()                 // Clear cache
checkWalrusHealth()                // Health check
```

### React Hooks

Located in `src/hooks/useWalrus.ts`:

```typescript
// Upload hooks
useWalrusUpload()                  // Upload data
useWalrusUploadJSON()              // Upload JSON

// Fetch hooks
useWalrusData(blobId)              // Fetch text data
useWalrusJSON(blobId)              // Fetch JSON
useWalrusBlob(blobId)              // Fetch binary data
useNFTMetadata(blobId)             // Fetch NFT metadata

// Utility hooks
useWalrusUrl(blobId)               // Get URL
usePrefetchWalrusData()            // Prefetch data
```

## NFT Minting Flow

### 1. User Uploads Image
```typescript
const { mutateAsync: uploadFile } = useWalrusUpload();
const imageBlobId = await uploadFile({ 
  data: imageFile, 
  epochs: 5  // Store for 5 epochs
});
```

### 2. Create and Upload Metadata
```typescript
const metadata = {
  name: "Cycle Completion Champion",
  description: "Awarded for completing a full group susu cycle",
  image: getWalrusUrl(imageBlobId),  // Full URL to image
  attributes: [
    { trait_type: "Achievement", value: "Cycle Completion Champion" },
    { trait_type: "Earned Date", value: "2025-11-14" }
  ]
};

const { mutateAsync: uploadJSON } = useWalrusUploadJSON();
const metadataBlobId = await uploadJSON({ 
  data: metadata, 
  epochs: 5 
});
```

### 3. Mint NFT with Blob IDs
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::nft_rewards::mint_reward`,
  arguments: [
    tx.object(adminCapId),
    tx.object(NFT_COLLECTION_ID),
    tx.pure.address(recipient),
    tx.pure.u8(achievementType),
    tx.pure.string(imageBlobId),      // Walrus blob ID for image
    tx.pure.string(metadataBlobId),   // Walrus blob ID for metadata
    tx.pure.u64(Date.now()),
  ],
});
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Walrus Configuration
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
VITE_WALRUS_EPOCHS=5
```

### Default Values

If environment variables are not set, defaults are used:
- Aggregator: `https://aggregator.walrus-testnet.walrus.space`
- Publisher: `https://publisher.walrus-testnet.walrus.space`
- Epochs: `5`

## Error Handling

### WalrusError Class

```typescript
try {
  const blobId = await uploadFile({ data: file });
} catch (error) {
  if (error instanceof WalrusError) {
    console.error('Walrus error:', error.code, error.message);
    // error.code can be:
    // - UPLOAD_FAILED
    // - FETCH_FAILED
    // - INVALID_RESPONSE
    // - etc.
  }
}
```

### Automatic Retries

- Max retries: 3
- Initial delay: 1 second
- Backoff multiplier: 2x
- Max delay: 8 seconds

## Caching Strategy

### Cache Configuration
- Duration: 5 minutes
- Max size: 100 items
- Strategy: LRU (Least Recently Used)

### Cache Keys
- Text/JSON: `blobId`
- Binary data: `blob:blobId`

### Cache Operations
```typescript
// Automatic caching on fetch
const data = await fetchFromWalrus(blobId);  // Cached

// Skip cache
const fresh = await fetchFromWalrus(blobId, { skipCache: true });

// Clear cache
clearWalrusCache();

// Invalidate specific item
invalidateWalrusCache(blobId);
```

## Testing

### Upload Test
```typescript
const { mutateAsync: upload } = useWalrusUpload();

const blobId = await upload({
  data: "Hello, Walrus!",
  epochs: 5
});

console.log('Uploaded:', blobId);
```

### Fetch Test
```typescript
const { data, isLoading, error } = useWalrusData(blobId);

if (isLoading) return <LoadingSpinner />;
if (error) return <div>Error: {error.message}</div>;
return <div>{data}</div>;
```

## Files Modified

- `src/components/admin/MintNFTForm.tsx` - Refactored to use hooks
- `src/hooks/useWalrus.ts` - Already existed with proper hooks
- `src/utils/walrus.ts` - Already existed with utility functions

## Summary

The Walrus integration is now:
- ✅ Using proper React hooks
- ✅ Centralized configuration
- ✅ Built-in error handling and retries
- ✅ Automatic caching
- ✅ Type-safe
- ✅ Reusable across components
- ✅ Following React best practices

The HTTP API approach is actually the recommended way for most applications, so the current implementation is optimal!
