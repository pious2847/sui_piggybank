#!/bin/bash
# Walrus NFT Upload Example Script
# This script shows how to upload NFT assets to Walrus

echo "=== Walrus NFT Upload Example ==="
echo ""

# Configuration
EPOCHS=5
ACHIEVEMENT_NAME="Cycle Completion Champion"
IMAGE_FILE="nft-badge.png"

echo "Step 1: Upload NFT Image"
echo "Command: walrus store $IMAGE_FILE --epochs $EPOCHS"
echo ""
echo "Example output:"
echo "  Storing file: $IMAGE_FILE"
echo "  File size: 45.2 KB"
echo "  Epochs: $EPOCHS"
echo "  ✓ Blob stored successfully!"
echo "  Blob ID: 8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR"
echo ""
echo "📋 SAVE THIS BLOB ID - You'll need it for the metadata!"
echo ""

# Simulated image blob ID
IMAGE_BLOB_ID="8xK9mP2nQ5rT7vW1yZ3aB4cD6eF8gH0iJ2kL4mN6oP8qR"

echo "Step 2: Create Metadata JSON"
echo "Creating metadata.json with image blob ID..."
echo ""

cat > metadata.json << EOF
{
  "name": "$ACHIEVEMENT_NAME",
  "description": "Awarded for completing a full savings cycle",
  "image": "https://aggregator.walrus-testnet.walrus.space/v1/$IMAGE_BLOB_ID",
  "attributes": [
    {
      "trait_type": "Achievement",
      "value": "$ACHIEVEMENT_NAME"
    },
    {
      "trait_type": "Earned Date",
      "value": "$(date +%Y-%m-%d)"
    },
    {
      "trait_type": "Rarity",
      "value": "Common"
    }
  ]
}
EOF

echo "✓ Created metadata.json"
echo ""

echo "Step 3: Upload Metadata to Walrus"
echo "Command: walrus store metadata.json --epochs $EPOCHS"
echo ""
echo "Example output:"
echo "  Storing file: metadata.json"
echo "  File size: 312 bytes"
echo "  Epochs: $EPOCHS"
echo "  ✓ Blob stored successfully!"
echo "  Blob ID: 1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD"
echo ""
echo "📋 SAVE THIS BLOB ID TOO!"
echo ""

# Simulated metadata blob ID
METADATA_BLOB_ID="1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD"

echo "Step 4: Use in App"
echo "Go to Admin Dashboard → NFT Rewards tab"
echo ""
echo "Enter these blob IDs:"
echo "  Image Blob ID:    $IMAGE_BLOB_ID"
echo "  Metadata Blob ID: $METADATA_BLOB_ID"
echo ""
echo "Then click 'Mint NFT Reward' ✨"
echo ""

echo "=== Summary ==="
echo "Image Blob ID:    $IMAGE_BLOB_ID"
echo "Metadata Blob ID: $METADATA_BLOB_ID"
echo ""
echo "Save these IDs to a file for future reference!"
echo ""

# Optional: Save to CSV
echo "Achievement,Image Blob ID,Metadata Blob ID,Date" > nft-records.csv
echo "$ACHIEVEMENT_NAME,$IMAGE_BLOB_ID,$METADATA_BLOB_ID,$(date +%Y-%m-%d)" >> nft-records.csv
echo "✓ Saved to nft-records.csv"
