# Quick Start: NFT Minting

## How to Mint NFTs Now

Since there are no users with reputation profiles yet, I've added a **manual entry field** for testing.

### Steps to Mint an NFT:

1. **Go to Admin Dashboard**
   - Navigate to `/admin`
   - Make sure you're connected with the admin wallet

2. **Click on 🎨 NFT Rewards Tab**

3. **Enter User Address Manually**
   - In the left panel, you'll see a blue box labeled "💡 Manual Entry (for testing)"
   - Enter any Sui address (e.g., your own wallet address or a test address)
   - Format: `0x` followed by 64 hex characters
   - Press **Enter**

4. **The Mint Form Will Appear**
   - On the right side, you'll see the mint form
   - It will show the selected user address

5. **Select Achievement**
   - Choose from dropdown:
     - Cycle Completion Champion
     - 5 Cycles Milestone
     - 10 Cycles Milestone
     - Perfect Attendance

6. **Upload NFT Image**
   - Click "Choose File"
   - Select an image (PNG, JPG, etc.)
   - Image preview will appear

7. **Click "Mint NFT Reward"**
   - The system will:
     - Upload image to Walrus
     - Upload metadata to Walrus
     - Mint the NFT
     - Send it to the user

8. **Success!**
   - You'll see a success message
   - The NFT will be in the user's wallet

## Example Addresses to Test With

You can mint NFTs for:
- **Your own wallet** - Check your connected address
- **Admin wallet** - `0xda31b8127cd23f42be99f904cc61f69c5e0693138b2f5cc25eef4a8f94493b87`
- **Any other Sui address**

## What You'll See

### Left Panel (Eligible Users)
```
┌─────────────────────────────────────┐
│ 💡 Manual Entry (for testing)      │
│ ┌─────────────────────────────────┐ │
│ │ Enter user address (0x...)      │ │
│ └─────────────────────────────────┘ │
│ Press Enter to select this address  │
└─────────────────────────────────────┘

No users eligible for rewards at this time
Users will appear here when they complete 
cycles or reach milestones

Use the manual entry above to mint NFTs 
for testing
```

### Right Panel (Mint Form)
```
┌─────────────────────────────────────┐
│ Mint NFT Reward                     │
│                                     │
│ Minting for:                        │
│ 0xda31...493b87                     │
│                                     │
│ Select Achievement                  │
│ [Dropdown ▼]                        │
│                                     │
│ Upload NFT Image                    │
│ [Image upload area]                 │
│                                     │
│ [🎨 Mint NFT Reward]                │
└─────────────────────────────────────┘
```

## Why Manual Entry?

The automatic user detection requires:
- Users to have reputation profiles
- Users to have completed cycles
- Users to have earned achievements

Since the platform is new, there are no users with these yet. The manual entry allows you to:
- Test the NFT minting functionality
- Mint NFTs to any address
- Verify the Walrus integration works
- See the complete flow

## Future: Automatic Detection

Once users start:
1. Creating reputation profiles
2. Joining groups
3. Completing cycles
4. Making contributions

They will automatically appear in the "Eligible Users" list based on their achievements!

## Troubleshooting

### "Please select a user"
- Make sure you entered an address and pressed Enter
- The address should appear in the mint form on the right

### "Please enter a valid Sui address"
- Address must start with `0x`
- Must be exactly 66 characters long (0x + 64 hex chars)

### "NFT collection not found"
- This should be fixed now
- Make sure you're using the latest code

### Walrus upload fails
- Check your internet connection
- Walrus testnet might be down (rare)
- Try a smaller image file

## Testing Checklist

- [ ] Navigate to Admin Dashboard
- [ ] Click 🎨 NFT Rewards tab
- [ ] Enter a user address in manual entry field
- [ ] Press Enter
- [ ] See mint form appear on right
- [ ] Select an achievement
- [ ] Upload an image
- [ ] Click "Mint NFT Reward"
- [ ] Approve transaction
- [ ] See success message
- [ ] Check user's wallet for NFT

## Next Steps

After testing NFT minting:
1. Create groups
2. Have users join groups
3. Users make contributions
4. Users complete cycles
5. Users earn reputation
6. Users automatically appear in eligible list
7. Mint NFTs for real achievements!

---

**Note:** The manual entry is a testing feature. In production, you'd only mint NFTs for users who have actually earned the achievements.
