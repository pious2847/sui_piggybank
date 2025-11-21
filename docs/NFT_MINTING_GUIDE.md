# NFT Minting Guide - Updated for Manual Blob IDs

## Overview

The NFT minting form has been updated to accept **manual blob ID input** instead of file uploads. This is due to SDK version constraints that prevent direct browser uploads to Walrus.

## Why Manual Input?

**Technical Limitation:**
- Current SDK: `@mysten/sui@1.37.4`
- Required SDK: `@mysten/sui@1.45.0+`
- Upgrading would break existing code

**Solution:**
Use Walrus CLI to upload files, then paste the blob IDs into the form.

## Step-by-Step Process

### 1. Install Walrus CLI

```bash
curl -fsSL https://walrus.site/install.sh | sh
```

### 2. Prepare Your NFT Image

- Format: PNG, JPG, or any image format
- Size: Any size (recommended: 512x512 or 1024x1024)
- Example: `achievement-badge.png`

### 3. Upload Image to Walrus

```bash
walrus store achievement-badge.png --epochs 5
```

**Output:**
```
Storing file: achievement-badge.png
✓ Blob stored successfully!
Blob ID: 8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR
```

**📋 Copy this Blob ID!**

### 4. Create Metadata JSON

Create `metadata.json` with the image blob ID:

```json
{
  "name": "Cycle Completion Champion",
  "description": "Awarded for completing a full savings cycle",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/YOUR_IMAGE_BLOB_ID",
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

### 5. Upload Metadata to Walrus

```bash
walrus store metadata.json --epochs 5
```

**Output:**
```
Storing file: metadata.json
✓ Blob stored successfully!
Blob ID: 1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD
```

**📋 Copy this Blob ID too!**

### 6. Mint NFT in the App

1. Go to **Admin Dashboard**
2. Click **🎨 NFT Rewards** tab
3. Select a user from the eligible list
4. Choose achievement type
5. **Paste Image Blob ID** in the first field
6. **Paste Metadata Blob ID** in the second field
7. Click **"Mint NFT Reward"**

## Updated Form Features

### Info Banner
The form now shows a helpful banner explaining the CLI requirement with a link to the guide.

### Blob ID Input Fields
Two input fields for manual entry:
- **Image Blob ID** - Shows preview when valid
- **Metadata Blob ID** - For the metadata JSON

### Image Preview
When you enter a valid image blob ID, the form automatically displays a preview of the image.

### Validation
The mint button is disabled until all fields are filled:
- User selected ✓
- Achievement selected ✓
- Image blob ID entered ✓
- Metadata blob ID entered ✓

## Quick Example

```bash
# Upload image
walrus store badge.png --epochs 5
# Returns: abc123...

# Create metadata
cat > metadata.json << EOF
{
  "name": "Achievement",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/abc123...",
  "attributes": []
}
EOF

# Upload metadata
walrus store metadata.json --epochs 5
# Returns: def456...

# In app: Enter abc123... and def456...
```

## Troubleshooting

### "Please fill in all fields"
Make sure you've entered both blob IDs and selected a user and achievement.

### Image preview doesn't show
- Check that the blob ID is correct
- Verify the blob exists: `walrus read <blob-id>`
- Wait a few seconds for the image to load

### "Transaction failed"
- Check that you have enough SUI for gas
- Verify the user address is valid
- Ensure you're connected with the admin wallet

## Benefits of This Approach

✅ **Works immediately** - No waiting for SDK upgrades
✅ **More control** - Review assets before minting
✅ **Batch processing** - Upload multiple assets at once
✅ **Reliable** - CLI is stable and well-tested
✅ **Reusable** - Same blob IDs can be referenced multiple times

## Future Improvements

When SDK versions are upgraded:
- Direct file upload from browser
- Automatic metadata generation
- Drag-and-drop interface
- Progress indicators for uploads

## Resources

- **WALRUS_CLI_GUIDE.md** - Detailed CLI instructions
- **WALRUS_SDK_STATUS.md** - Technical explanation
- **walrus-upload-example.sh** - Example script
- **Official Docs:** https://docs.walrus.site

## Support

If you encounter issues:
1. Check the blob IDs are correct
2. Verify Walrus CLI is installed
3. Ensure blobs haven't expired
4. Review the error message in the form

The form will show clear error messages if something goes wrong!
