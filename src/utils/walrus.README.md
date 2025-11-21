# Walrus Client Integration

This module provides utilities for interacting with Walrus decentralized storage, including uploading and fetching data with built-in caching, error handling, and retry logic.

## Overview

Walrus is a decentralized storage network used for storing NFT metadata, images, and other assets. This integration provides:

- **Upload functions** for storing data on Walrus
- **Fetch functions** for retrieving data from Walrus
- **Caching layer** to reduce network calls and improve performance
- **Retry logic** with exponential backoff for handling network issues
- **React hooks** for easy integration with React components
- **TypeScript support** with full type definitions

## Configuration

### Environment Variables

Configure Walrus endpoints in your `.env` file:

```env
# Walrus aggregator URL for reading data
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Walrus publisher URL for uploading data
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space

# Number of epochs to store data (default: 5)
VITE_WALRUS_EPOCHS=5
```

### Default Configuration

If environment variables are not set, the following defaults are used:

- **Aggregator URL**: `https://aggregator.walrus-testnet.walrus.space`
- **Publisher URL**: `https://publisher.walrus-testnet.walrus.space`
- **Epochs**: `5`
- **Cache Duration**: `5 minutes`
- **Max Cache Size**: `100 items`
- **Max Retries**: `3`
- **Retry Delay**: `1 second` (with exponential backoff)

## Core Functions

### Upload Functions

#### `uploadToWalrus(data, options?)`

Upload data to Walrus storage.

```typescript
import { uploadToWalrus } from '@/utils/walrus';

// Upload string data
const blobId = await uploadToWalrus('Hello, Walrus!');

// Upload JSON data
const jsonData = { name: 'NFT', description: 'My NFT' };
const blobId = await uploadToWalrus(JSON.stringify(jsonData));

// Upload with custom epochs
const blobId = await uploadToWalrus(data, { epochs: 10 });

// Upload Blob or File
const file = new File(['content'], 'file.txt');
const blobId = await uploadToWalrus(file);
```

**Parameters:**
- `data`: `string | Blob | Uint8Array` - Data to upload
- `options.epochs?`: `number` - Number of epochs to store (default: 5)
- `options.force?`: `boolean` - Skip cache check

**Returns:** `Promise<string>` - Blob ID of uploaded data

#### `uploadJSONToWalrus(data, options?)`

Upload JSON data to Walrus (automatically stringifies).

```typescript
import { uploadJSONToWalrus } from '@/utils/walrus';

const metadata = {
  name: 'Cycle Completion Champion',
  description: 'Completed 5 group susu cycles',
  image: 'walrus://blob_id_12345',
  attributes: [
    { trait_type: 'Achievement', value: 'Cycle Completion' },
    { trait_type: 'Cycles', value: '5' },
  ],
};

const blobId = await uploadJSONToWalrus(metadata);
```

### Fetch Functions

#### `fetchFromWalrus(blobId, options?)`

Fetch text data from Walrus.

```typescript
import { fetchFromWalrus } from '@/utils/walrus';

// Fetch as string
const data = await fetchFromWalrus('blob_id_123');

// Fetch and parse JSON
const data = await fetchFromWalrus('blob_id_123', { parseJSON: true });

// Skip cache
const data = await fetchFromWalrus('blob_id_123', { skipCache: true });
```

**Parameters:**
- `blobId`: `string` - Blob ID to fetch
- `options.skipCache?`: `boolean` - Skip cache lookup
- `options.parseJSON?`: `boolean` - Parse response as JSON

**Returns:** `Promise<string | any>` - Fetched data

#### `fetchJSONFromWalrus<T>(blobId, options?)`

Fetch and parse JSON data from Walrus with type safety.

```typescript
import { fetchJSONFromWalrus } from '@/utils/walrus';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
}

const metadata = await fetchJSONFromWalrus<NFTMetadata>('blob_id_123');
console.log(metadata.name); // Type-safe access
```

#### `fetchBlobFromWalrus(blobId, options?)`

Fetch binary data (images, files) from Walrus.

```typescript
import { fetchBlobFromWalrus } from '@/utils/walrus';

const imageBlob = await fetchBlobFromWalrus('blob_id_123');
const imageUrl = URL.createObjectURL(imageBlob);
```

#### `getWalrusUrl(blobId)`

Get a direct URL for a Walrus blob (useful for `<img>` tags).

```typescript
import { getWalrusUrl } from '@/utils/walrus';

const imageUrl = getWalrusUrl('blob_id_123');

// Use in JSX
<img src={imageUrl} alt="NFT" />
```

## React Hooks

### `useWalrusData(blobId, options?)`

Hook to fetch text data from Walrus.

```typescript
import { useWalrusData } from '@/hooks/useWalrus';

function MyComponent({ blobId }: { blobId: string }) {
  const { data, isLoading, error } = useWalrusData(blobId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data}</div>;
}
```

### `useWalrusJSON<T>(blobId, options?)`

Hook to fetch and parse JSON data with type safety.

```typescript
import { useWalrusJSON } from '@/hooks/useWalrus';

interface NFTMetadata {
  name: string;
  description: string;
}

function NFTDisplay({ metadataUrl }: { metadataUrl: string }) {
  const { data, isLoading, error } = useWalrusJSON<NFTMetadata>(metadataUrl);

  if (isLoading) return <div>Loading metadata...</div>;
  if (error) return <div>Failed to load metadata</div>;

  return (
    <div>
      <h3>{data.name}</h3>
      <p>{data.description}</p>
    </div>
  );
}
```

### `useWalrusBlob(blobId, options?)`

Hook to fetch binary data (images).

```typescript
import { useWalrusBlob } from '@/hooks/useWalrus';

function ImageDisplay({ blobId }: { blobId: string }) {
  const { data: blob, isLoading } = useWalrusBlob(blobId);
  const imageUrl = blob ? URL.createObjectURL(blob) : undefined;

  if (isLoading) return <div>Loading image...</div>;

  return <img src={imageUrl} alt="Walrus content" />;
}
```

### `useWalrusUpload()`

Hook to upload data to Walrus.

```typescript
import { useWalrusUpload } from '@/hooks/useWalrus';

function UploadForm() {
  const { mutate: upload, isPending, isSuccess } = useWalrusUpload();

  const handleUpload = async (file: File) => {
    upload({ data: file, epochs: 10 });
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isPending && <div>Uploading...</div>}
      {isSuccess && <div>Upload successful!</div>}
    </div>
  );
}
```

### `useWalrusUploadJSON()`

Hook to upload JSON data.

```typescript
import { useWalrusUploadJSON } from '@/hooks/useWalrus';

function CreateNFT() {
  const { mutate: uploadJSON, data: blobId } = useWalrusUploadJSON();

  const handleCreate = () => {
    const metadata = {
      name: 'My NFT',
      description: 'NFT description',
    };
    uploadJSON({ data: metadata });
  };

  return (
    <div>
      <button onClick={handleCreate}>Create NFT</button>
      {blobId && <div>Blob ID: {blobId}</div>}
    </div>
  );
}
```

### `useWalrusUrl(blobId)`

Hook to get a Walrus URL for direct use.

```typescript
import { useWalrusUrl } from '@/hooks/useWalrus';

function NFTImage({ blobId }: { blobId: string }) {
  const imageUrl = useWalrusUrl(blobId);

  return <img src={imageUrl} alt="NFT" />;
}
```

### `useNFTMetadata(metadataUrl)`

Specialized hook for fetching NFT metadata.

```typescript
import { useNFTMetadata } from '@/hooks/useWalrus';

function NFTCard({ metadataUrl }: { metadataUrl: string }) {
  const { data: metadata, isLoading } = useNFTMetadata(metadataUrl);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <img src={metadata.image} alt={metadata.name} />
      <h3>{metadata.name}</h3>
      <p>{metadata.description}</p>
      {metadata.attributes?.map((attr) => (
        <div key={attr.trait_type}>
          {attr.trait_type}: {attr.value}
        </div>
      ))}
    </div>
  );
}
```

## Caching

The Walrus client includes an in-memory cache to reduce network calls:

- **Cache Duration**: 5 minutes for text/JSON, 10 minutes for binary data
- **Max Cache Size**: 100 items (LRU eviction)
- **Cache Key**: Based on blob ID

### Cache Management

```typescript
import { clearWalrusCache, invalidateWalrusCache } from '@/utils/walrus';

// Clear entire cache
clearWalrusCache();

// Invalidate specific blob
invalidateWalrusCache('blob_id_123');
```

## Error Handling

All Walrus functions throw `WalrusError` on failure:

```typescript
import { fetchFromWalrus, WalrusError } from '@/utils/walrus';

try {
  const data = await fetchFromWalrus('blob_id_123');
} catch (error) {
  if (error instanceof WalrusError) {
    console.error('Walrus error:', error.code, error.message);
    console.error('Original error:', error.originalError);
  }
}
```

### Error Codes

- `UPLOAD_FAILED`: Upload to Walrus failed
- `INVALID_RESPONSE`: Invalid response from Walrus
- `UPLOAD_ERROR`: General upload error
- `FETCH_FAILED`: Fetch from Walrus failed
- `FETCH_ERROR`: General fetch error
- `FETCH_BLOB_FAILED`: Binary fetch failed
- `FETCH_BLOB_ERROR`: General binary fetch error

## Retry Logic

All operations include automatic retry with exponential backoff:

- **Max Retries**: 3
- **Initial Delay**: 1 second
- **Backoff Multiplier**: 2x
- **Max Delay**: 4 seconds (1s → 2s → 4s)

## Best Practices

### 1. Use Hooks in React Components

```typescript
// ✅ Good - Use hooks
function MyComponent({ blobId }) {
  const { data } = useWalrusJSON(blobId);
  return <div>{data?.name}</div>;
}

// ❌ Avoid - Direct function calls in components
function MyComponent({ blobId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchJSONFromWalrus(blobId).then(setData);
  }, [blobId]);
  return <div>{data?.name}</div>;
}
```

### 2. Use Direct URLs for Images

```typescript
// ✅ Good - Direct URL
import { getWalrusUrl } from '@/utils/walrus';
<img src={getWalrusUrl(blobId)} alt="NFT" />

// ❌ Avoid - Fetching blob unnecessarily
const { data: blob } = useWalrusBlob(blobId);
<img src={blob ? URL.createObjectURL(blob) : ''} alt="NFT" />
```

### 3. Prefetch Data When Possible

```typescript
import { usePrefetchWalrusData } from '@/hooks/useWalrus';

function GroupList({ groups }) {
  const prefetch = usePrefetchWalrusData();

  return (
    <div>
      {groups.map((group) => (
        <div
          key={group.id}
          onMouseEnter={() => prefetch(group.metadataUrl)}
        >
          {group.name}
        </div>
      ))}
    </div>
  );
}
```

### 4. Handle Errors Gracefully

```typescript
function NFTDisplay({ metadataUrl }) {
  const { data, error, isLoading } = useWalrusJSON(metadataUrl);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorFallback error={error} />;
  if (!data) return <EmptyState />;

  return <NFTCard metadata={data} />;
}
```

## Testing

### Health Check

```typescript
import { checkWalrusHealth } from '@/utils/walrus';

const isHealthy = await checkWalrusHealth();
console.log('Walrus is', isHealthy ? 'accessible' : 'unavailable');
```

### Configuration Check

```typescript
import { getWalrusConfig } from '@/utils/walrus';

const config = getWalrusConfig();
console.log('Walrus config:', config);
```

## Troubleshooting

### Issue: Upload fails with network error

**Solution**: Check that `VITE_WALRUS_PUBLISHER_URL` is correct and accessible.

### Issue: Fetch returns 404

**Solution**: Verify the blob ID is correct and the data hasn't expired.

### Issue: Images not loading

**Solution**: Use `getWalrusUrl()` for direct image URLs instead of fetching blobs.

### Issue: Cache not working

**Solution**: Ensure you're not using `skipCache: true` unnecessarily.

### Issue: Slow performance

**Solution**: Use prefetching hooks to load data before it's needed.

## Examples

### Complete NFT Upload and Display Flow

```typescript
import { useWalrusUploadJSON, useNFTMetadata, useWalrusUrl } from '@/hooks/useWalrus';

function NFTCreator() {
  const { mutate: uploadMetadata, data: metadataUrl } = useWalrusUploadJSON();
  const { mutate: uploadImage, data: imageUrl } = useWalrusUpload();

  const handleCreate = async (name: string, description: string, imageFile: File) => {
    // 1. Upload image
    uploadImage({ data: imageFile }, {
      onSuccess: (imageBlobId) => {
        // 2. Upload metadata with image reference
        const metadata = {
          name,
          description,
          image: imageBlobId,
        };
        uploadMetadata({ data: metadata });
      },
    });
  };

  return (
    <div>
      {/* Upload form */}
      {metadataUrl && <NFTPreview metadataUrl={metadataUrl} />}
    </div>
  );
}

function NFTPreview({ metadataUrl }: { metadataUrl: string }) {
  const { data: metadata } = useNFTMetadata(metadataUrl);
  const imageUrl = useWalrusUrl(metadata?.image);

  return (
    <div>
      <img src={imageUrl} alt={metadata?.name} />
      <h3>{metadata?.name}</h3>
      <p>{metadata?.description}</p>
    </div>
  );
}
```

## API Reference

See inline TypeScript documentation for complete API details.
