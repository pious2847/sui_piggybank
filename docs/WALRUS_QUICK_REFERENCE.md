# Walrus Quick Reference

## Reading (Works in App) ✅

```typescript
import { fetchFromWalrus, getWalrusUrl } from './utils/walrus';

// Fetch text
const text = await fetchFromWalrus(blobId);

// Fetch JSON
const metadata = await fetchJSONFromWalrus(blobId);

// Get image URL
const url = getWalrusUrl(blobId);
<img src={url} alt="NFT" />
```

## Writing (Use CLI) ⏳

```bash
# Upload file
walrus store myfile.png --epochs 5
# Returns blob ID: abc123...

# Use blob ID in app
```

## NFT Minting Workflow

### 1. Upload Image (CLI)
```bash
walrus store badge.png --epochs 5
# Save blob ID: IMAGE_BLOB_ID
```

### 2. Create Metadata
```json
{
  "name": "Achievement",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/IMAGE_BLOB_ID",
  "attributes": [...]
}
```

### 3. Upload Metadata (CLI)
```bash
walrus store metadata.json --epochs 5
# Save blob ID: METADATA_BLOB_ID
```

### 4. Mint NFT (App)
Use both blob IDs in the minting form.

## Endpoints

- **Aggregator:** https://aggregator.walrus-testnet.walrus.space
- **Direct Blob:** https://aggregator.walrus-testnet.walrus.space/v1/{blobId}

## Common Issues

### "SDK_VERSION_INCOMPATIBLE"
**Solution:** Use Walrus CLI for uploads

### "404 Not Found"
**Solution:** Check blob ID or blob may have expired

### "walrus: command not found"
**Solution:** Install CLI: `curl -fsSL https://walrus.site/install.sh | sh`

## Resources

- Full docs: WALRUS_SDK_STATUS.md
- CLI guide: WALRUS_CLI_GUIDE.md
- Official docs: https://docs.walrus.site
