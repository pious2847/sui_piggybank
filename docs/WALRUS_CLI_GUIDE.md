# Walrus CLI Guide for NFT Minting

## Quick Start

This guide shows you how to upload images and metadata to Walrus using the CLI, then mint NFTs with those blob IDs.

## Installation

### Install Walrus CLI

```bash
curl -fsSL https://walrus.site/install.sh | sh
```

### Verify Installation

```bash
walrus --version
```

## Upload Workflow

### Step 1: Prepare Your NFT Image

Create or download an image for your NFT:
- Recommended: PNG or JPG
- Size: Any size (will be stored as-is)
- Example: `achievement-badge.png`

### Step 2: Upload Image to Walrus

```bash
walrus store achievement-badge.png --epochs 5
```

**Output:**
```
Storing file: achievement-badge.png
File size: 45.2 KB
Epochs: 5
...
✓ Blob stored successfully!
Blob ID: 8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR
```

**Save this Blob ID!** You'll need it for minting.

### Step 3: Create Metadata JSON

Create a file `metadata.json`:

```json
{
  "name": "Cycle Completion Champion",
  "description": "Awarded for completing a full savings cycle",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR",
  "attributes": [
    {
      "trait_type": "Achievement",
      "value": "Cycle Completion Champion"
    },
    {
      "trait_type": "Earned Date",
      "value": "2025-11-14"
    }
  ]
}
```

**Important:** Use the blob ID from Step 2 in the `image` URL!

### Step 4: Upload Metadata to Walrus

```bash
walrus store metadata.json --epochs 5
```

**Output:**
```
Storing file: metadata.json
File size: 312 bytes
Epochs: 5
...
✓ Blob stored successfully!
Blob ID: 1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD
```

**Save this Blob ID too!** This is your metadata blob ID.

### Step 5: Mint NFT in the App

Now go to your app's Admin Dashboard → NFT Rewards tab:

1. Select a user
2. Choose achievement type
3. **Instead of uploading**, manually enter the blob IDs:
   - Image Blob ID: `8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR`
   - Metadata Blob ID: `1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD`
4. Click "Mint NFT Reward"

## Complete Example

### Example 1: Achievement Badge

```bash
# 1. Upload image
walrus store badges/cycle-champion.png --epochs 5
# Blob ID: abc123...

# 2. Create metadata
cat > metadata.json << EOF
{
  "name": "Cycle Completion Champion",
  "description": "Completed first savings cycle",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/abc123...",
  "attributes": [
    {"trait_type": "Achievement", "value": "Cycle Completion Champion"},
    {"trait_type": "Rarity", "value": "Common"}
  ]
}
EOF

# 3. Upload metadata
walrus store metadata.json --epochs 5
# Blob ID: def456...

# 4. Use in app:
# Image: abc123...
# Metadata: def456...
```

### Example 2: Milestone Badge

```bash
# Upload 5-cycle milestone badge
walrus store badges/5-cycles.png --epochs 10
# Blob ID: xyz789...

# Create metadata
cat > 5-cycles-metadata.json << EOF
{
  "name": "5 Cycles Milestone",
  "description": "Completed 5 savings cycles",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/xyz789...",
  "attributes": [
    {"trait_type": "Achievement", "value": "5 Cycles Milestone"},
    {"trait_type": "Rarity", "value": "Rare"}
  ]
}
EOF

walrus store 5-cycles-metadata.json --epochs 10
# Blob ID: uvw012...
```

## CLI Commands Reference

### Store a File

```bash
walrus store <file> [OPTIONS]
```

**Options:**
- `--epochs <N>` - Number of epochs to store (default: 1)
- `--force` - Overwrite if already exists
- `--json` - Output in JSON format

**Examples:**
```bash
# Store for 5 epochs
walrus store image.png --epochs 5

# Store with JSON output
walrus store data.json --epochs 3 --json
```

### Read a Blob

```bash
walrus read <blob-id> [OPTIONS]
```

**Options:**
- `--output <file>` - Save to file
- `--json` - Output in JSON format

**Examples:**
```bash
# Read and display
walrus read abc123...

# Save to file
walrus read abc123... --output downloaded.png
```

### List Stored Blobs

```bash
walrus list
```

Shows all blobs you've stored.

### Check Blob Info

```bash
walrus info <blob-id>
```

Shows blob metadata, size, expiry, etc.

## Tips & Best Practices

### 1. Organize Your Files

```bash
mkdir -p nft-assets/{images,metadata}

# Store images
walrus store nft-assets/images/badge1.png --epochs 5
walrus store nft-assets/images/badge2.png --epochs 5

# Store metadata
walrus store nft-assets/metadata/badge1.json --epochs 5
walrus store nft-assets/metadata/badge2.json --epochs 5
```

### 2. Keep a Record

Create a spreadsheet or file to track blob IDs:

```csv
Achievement,Image Blob ID,Metadata Blob ID,Date
Cycle Champion,abc123...,def456...,2025-11-14
5 Cycles,xyz789...,uvw012...,2025-11-14
```

### 3. Use Longer Epochs for Production

```bash
# Development: 5 epochs (~5 days)
walrus store image.png --epochs 5

# Production: 100+ epochs (~3+ months)
walrus store image.png --epochs 100
```

### 4. Verify Uploads

After uploading, verify the blob is accessible:

```bash
# Upload
walrus store image.png --epochs 5
# Blob ID: abc123...

# Verify
walrus read abc123... --output test.png

# Or check in browser
open https://aggregator.walrus-testnet.walrus.space/v1/abc123...
```

### 5. Batch Upload Script

Create a script for multiple NFTs:

```bash
#!/bin/bash
# upload-nfts.sh

for achievement in "cycle-champion" "5-cycles" "10-cycles" "perfect-attendance"; do
  echo "Uploading $achievement..."
  
  # Upload image
  IMAGE_ID=$(walrus store "images/${achievement}.png" --epochs 10 --json | jq -r '.blobId')
  echo "Image: $IMAGE_ID"
  
  # Create metadata
  cat > "metadata/${achievement}.json" << EOF
{
  "name": "${achievement}",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/${IMAGE_ID}",
  "attributes": [{"trait_type": "Achievement", "value": "${achievement}"}]
}
EOF
  
  # Upload metadata
  META_ID=$(walrus store "metadata/${achievement}.json" --epochs 10 --json | jq -r '.blobId')
  echo "Metadata: $META_ID"
  
  # Save to CSV
  echo "${achievement},${IMAGE_ID},${META_ID},$(date +%Y-%m-%d)" >> nft-records.csv
done
```

## Troubleshooting

### Error: "walrus: command not found"

**Solution:** Add Walrus to your PATH:

```bash
export PATH="$HOME/.walrus/bin:$PATH"

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export PATH="$HOME/.walrus/bin:$PATH"' >> ~/.bashrc
```

### Error: "Insufficient balance"

**Solution:** You need WAL tokens to pay for storage:

1. Get testnet SUI from faucet
2. Convert SUI to WAL (if needed)
3. Check balance: `walrus balance`

### Error: "Failed to connect to storage nodes"

**Solution:** Check your internet connection and try again:

```bash
walrus store image.png --epochs 5 --retry 3
```

### Blob Not Found (404)

**Possible causes:**
- Blob expired (past storage epochs)
- Invalid blob ID
- Network issues

**Solution:**
- Verify blob ID is correct
- Check if blob is still within storage period
- Try reading with CLI: `walrus read <blob-id>`

## Integration with App

### Current NFT Minting Form

The app's NFT minting form currently expects:
1. User selection
2. Achievement type
3. Image upload (blocked by SDK version)

### Temporary Workaround

Until the upload feature is fixed, you can:

1. **Add manual blob ID input fields** to the form
2. **Skip the upload step** and use pre-uploaded blob IDs
3. **Mint directly** with the blob IDs from CLI

### Example Form Modification

```typescript
// Add these fields to MintNFTForm.tsx
const [imageBlobId, setImageBlobId] = useState('');
const [metadataBlobId, setMetadataBlobId] = useState('');

// In the form:
<input
  type="text"
  placeholder="Image Blob ID (from Walrus CLI)"
  value={imageBlobId}
  onChange={(e) => setImageBlobId(e.target.value)}
/>

<input
  type="text"
  placeholder="Metadata Blob ID (from Walrus CLI)"
  value={metadataBlobId}
  onChange={(e) => setMetadataBlobId(e.target.value)}
/>

// In handleMint:
tx.moveCall({
  target: `${PACKAGE_ID}::nft_rewards::mint_reward`,
  arguments: [
    tx.object(adminCapId),
    tx.object(NFT_COLLECTION_ID),
    tx.pure.address(selectedUser),
    tx.pure.u8(achievementType),
    tx.pure.string(imageBlobId),      // From input
    tx.pure.string(metadataBlobId),   // From input
    tx.pure.u64(Date.now()),
  ],
});
```

## Summary

**Workflow:**
1. ✅ Upload image with CLI → Get image blob ID
2. ✅ Create metadata JSON with image URL
3. ✅ Upload metadata with CLI → Get metadata blob ID
4. ✅ Use both blob IDs in app to mint NFT

**Advantages:**
- Works immediately (no code changes needed)
- Full control over uploads
- Can batch process multiple NFTs

**Limitations:**
- Manual process (not integrated in UI)
- Requires CLI installation
- Two-step upload process

**Future:**
Once SDK versions are upgraded, uploads will be integrated directly into the UI with a seamless user experience.
