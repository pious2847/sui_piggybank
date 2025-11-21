# Shareable Profile Feature

## Overview

The SuiVault platform supports shareable user profiles that allow users to showcase their reputation, achievements, and NFT rewards publicly. Any user can view another user's profile by navigating to their unique profile URL.

## Features

### 1. Public Profile View
- **Route**: `/profile/:address`
- **Description**: Displays public reputation and NFT data for any Sui wallet address
- **Data Shown**:
  - Reputation score and level
  - Cycles completed
  - Total contributions
  - On-time contribution rate
  - Achievement badges
  - NFT rewards gallery
  - Reputation history timeline

### 2. Personal Profile View
- **Route**: `/profile`
- **Description**: Shows the current user's own profile (requires wallet connection)
- **Additional Features**:
  - Share profile button
  - Copy profile link button
  - Profile management options

### 3. Shareable Links
Users can generate and share their profile links in multiple ways:
- **Copy Link**: Copies the profile URL to clipboard
- **Share Button**: Uses Web Share API (mobile) or falls back to copy
- **Direct URL**: `https://your-domain.com/profile/0x...address`

## Usage

### Viewing Your Own Profile
1. Connect your wallet
2. Navigate to `/profile` or click "Profile" in the sidebar
3. Your reputation, achievements, and NFTs will be displayed

### Sharing Your Profile
1. On your profile page, click the "Copy Link" button to copy your profile URL
2. Or click "Share Profile" to use the native share dialog (on supported devices)
3. Share the link via social media, messaging apps, or any other platform

### Viewing Someone Else's Profile
1. Navigate to `/profile/:address` where `:address` is their Sui wallet address
2. Or click on a ProfileLink component anywhere in the app
3. Their public reputation and NFT data will be displayed

## Components

### ProfilePage
The main profile page component that handles both personal and public profile views.

**Location**: `src/pages/ProfilePage.tsx`

**Features**:
- Automatic detection of own vs. public profile
- Shareable link generation
- Copy to clipboard functionality
- Web Share API integration
- Public profile badge indicator

### ProfileLink
A reusable component for linking to user profiles throughout the app.

**Location**: `src/components/profile/ProfileLink.tsx`

**Usage**:
```tsx
import { ProfileLink } from "../components/profile";

// Default variant
<ProfileLink address="0x123..." />

// With custom display name
<ProfileLink address="0x123..." displayName="Alice" />

// Compact variant
<ProfileLink address="0x123..." variant="compact" />

// Badge variant
<ProfileLink address="0x123..." variant="badge" />
```

**Variants**:
- `default`: Standard link with icon and text
- `compact`: Smaller, inline link
- `badge`: Pill-shaped badge style

## Utility Functions

### Profile Link Utilities
**Location**: `src/utils/profileLinks.ts`

**Functions**:
- `generateProfileLink(address, baseUrl?)`: Generates a shareable profile URL
- `copyProfileLink(address)`: Copies profile link to clipboard
- `shareProfileLink(address, userName?)`: Shares profile using Web Share API
- `formatAddress(address, prefixLength?, suffixLength?)`: Formats address for display
- `isValidSuiAddress(address)`: Validates Sui address format

**Usage**:
```typescript
import { generateProfileLink, copyProfileLink, shareProfileLink } from "../utils/profileLinks";

// Generate a profile link
const link = generateProfileLink("0x123...");

// Copy to clipboard
await copyProfileLink("0x123...");

// Share via Web Share API
await shareProfileLink("0x123...", "Alice");
```

## Data Hooks

### useReputationProfile
Fetches reputation profile data for any address.

**Location**: `src/hooks/useReputationProfile.ts`

**Usage**:
```typescript
const { data: profile, isLoading } = useReputationProfile(address);
```

### useUserNFTs
Fetches NFT rewards owned by any address.

**Location**: `src/hooks/useUserNFTs.ts`

**Usage**:
```typescript
const { data: nfts, isLoading } = useUserNFTs(address);
```

### useReputationEvents
Fetches reputation event history for any address.

**Location**: `src/hooks/useReputationProfile.ts`

**Usage**:
```typescript
const { data: events, isLoading } = useReputationEvents(address);
```

## Privacy Considerations

### Public Data
The following data is publicly visible on any profile:
- Reputation score
- Cycles completed
- Total contributions count
- On-time contribution rate
- Achievement badges
- NFT rewards
- Reputation event history

### Private Data
The following data remains private:
- Encrypted user data (stored in ReputationProfile.encrypted_data)
- Individual contribution amounts (only aggregates are public)
- Personal financial details

## Integration Examples

### Adding Profile Links to Group Participants
```tsx
import { ProfileLink } from "../components/profile";

function ParticipantList({ participants }) {
  return (
    <div>
      {participants.map(participant => (
        <div key={participant.address}>
          <ProfileLink 
            address={participant.address}
            displayName={participant.name}
            variant="badge"
          />
        </div>
      ))}
    </div>
  );
}
```

### Sharing Profile from Custom Component
```tsx
import { shareProfileLink } from "../utils/profileLinks";

function ShareButton({ userAddress }) {
  const handleShare = async () => {
    try {
      await shareProfileLink(userAddress);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <button onClick={handleShare}>
      Share Profile
    </button>
  );
}
```

## Technical Details

### Route Configuration
The profile routes are configured in `src/App.tsx`:
```tsx
<Route path="/profile" element={<ProfilePage />} />
<Route path="/profile/:address" element={<ProfilePage />} />
```

### Address Detection Logic
The ProfilePage component determines which profile to show:
1. If URL contains an address parameter, show that user's profile (public view)
2. If no address parameter, show current user's profile (requires wallet connection)
3. If viewing own profile, show share buttons
4. If viewing public profile, show "Public Profile" badge

### Web Share API Support
The share functionality uses the Web Share API when available (primarily on mobile devices) and falls back to copying the link to clipboard on desktop browsers.

## Future Enhancements

Potential improvements for the shareable profile feature:
- Profile customization (banner images, bio)
- Privacy settings (hide specific data)
- Profile verification badges
- Social media integration
- QR code generation for profiles
- Profile analytics (view counts)
- Follow/friend system
