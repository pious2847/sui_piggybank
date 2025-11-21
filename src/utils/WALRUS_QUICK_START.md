# Walrus Quick Start Guide

## 🚀 Quick Setup

1. **Environment Configuration** (already done)
   ```env
   VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
   VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
   VITE_WALRUS_EPOCHS=5
   ```

2. **Import what you need**
   ```typescript
   import { useWalrusJSON, useWalrusUploadJSON, useWalrusUrl } from '@/hooks/useWalrus';
   ```

## 📤 Upload Data

### Upload JSON
```typescript
const { mutate: upload, data: blobId } = useWalrusUploadJSON();

upload({ 
  data: { name: 'My Data', value: 123 } 
});
```

### Upload File
```typescript
const { mutate: upload } = useWalrusUpload();

upload({ 
  data: fileBlob,
  epochs: 10 
});
```

## 📥 Fetch Data

### Fetch JSON
```typescript
const { data, isLoading, error } = useWalrusJSON(blobId);
```

### Display Image
```typescript
const imageUrl = useWalrusUrl(blobId);
<img src={imageUrl} alt="Content" />
```

### Fetch NFT Metadata
```typescript
const { data: metadata } = useNFTMetadata(metadataUrl);
```

## 🎯 Common Patterns

### Upload NFT Metadata
```typescript
function CreateNFT() {
  const { mutate: uploadImage } = useWalrusUpload();
  const { mutate: uploadMetadata } = useWalrusUploadJSON();

  const handleCreate = async (imageFile: File) => {
    // 1. Upload image
    uploadImage({ data: imageFile }, {
      onSuccess: (imageBlobId) => {
        // 2. Upload metadata
        uploadMetadata({
          data: {
            name: 'My NFT',
            image: imageBlobId,
          }
        });
      }
    });
  };
}
```

### Display NFT Card
```typescript
function NFTCard({ metadataUrl }: { metadataUrl: string }) {
  const { data, isLoading } = useNFTMetadata(metadataUrl);
  const imageUrl = useWalrusUrl(data?.image);

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <img src={imageUrl} alt={data.name} />
      <h3>{data.name}</h3>
      <p>{data.description}</p>
    </div>
  );
}
```

### Prefetch Data
```typescript
function GroupList({ groups }) {
  const prefetch = usePrefetchWalrusData();

  return groups.map(group => (
    <div onMouseEnter={() => prefetch(group.metadataUrl)}>
      {group.name}
    </div>
  ));
}
```

## 🔧 Utilities

### Direct Functions (non-React)
```typescript
import { 
  uploadToWalrus, 
  fetchFromWalrus,
  getWalrusUrl 
} from '@/utils/walrus';

// Upload
const blobId = await uploadToWalrus('data');

// Fetch
const data = await fetchFromWalrus(blobId);

// Get URL
const url = getWalrusUrl(blobId);
```

### Cache Management
```typescript
import { clearWalrusCache, invalidateWalrusCache } from '@/utils/walrus';

// Clear all cache
clearWalrusCache();

// Invalidate specific blob
invalidateWalrusCache(blobId);
```

### Health Check
```typescript
import { checkWalrusHealth } from '@/utils/walrus';

const isHealthy = await checkWalrusHealth();
```

## ⚡ Performance Tips

1. **Use direct URLs for images** - Faster than fetching blobs
   ```typescript
   <img src={getWalrusUrl(blobId)} />
   ```

2. **Prefetch data** - Load before needed
   ```typescript
   const prefetch = usePrefetchWalrusData();
   prefetch(blobId);
   ```

3. **Cache is automatic** - No need to manage manually

4. **Retry is automatic** - Network failures handled automatically

## 🐛 Troubleshooting

### Upload fails
- Check `VITE_WALRUS_PUBLISHER_URL` is correct
- Verify network connection
- Check browser console for errors

### Fetch returns 404
- Verify blob ID is correct
- Check if data has expired
- Try with `skipCache: true`

### Images not loading
- Use `getWalrusUrl()` instead of fetching blob
- Check blob ID is valid
- Verify aggregator URL is accessible

## 📚 Full Documentation

See `src/utils/walrus.README.md` for complete documentation.

## 🎨 Examples

See `src/components/WalrusExample.tsx` for working examples.
