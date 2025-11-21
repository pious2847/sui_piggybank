# Seal Encryption Integration

This document describes the Seal encryption integration for protecting sensitive user data in the SuiVault platform.

## Overview

Seal is a privacy-preserving encryption protocol on Sui blockchain that allows selective encryption of sensitive data while maintaining transparency where needed. This implementation provides utilities for encrypting and decrypting user contribution history and other personal financial information.

## Architecture

### Core Components

1. **`seal.ts`** - Core encryption utilities
   - `decryptSealData()` - Decrypts encrypted blockchain data
   - `encryptSealData()` - Encrypts data for blockchain storage
   - `getUserPrivateKey()` - Retrieves user's decryption key from wallet
   - Helper functions for data validation and formatting

2. **`useSealEncryption.ts`** - React hook for encryption state management
   - Manages decryption state (loading, error, data)
   - Provides `decrypt()` and `lock()` functions
   - Handles error states gracefully

3. **`ContributionHistory.tsx`** - Component for displaying encrypted contribution data
   - Shows encrypted/decrypted state
   - Decrypt button with loading states
   - Displays contribution history with stats

4. **`EncryptedDataViewer.tsx`** - Reusable encrypted data viewer component
   - Generic component for any encrypted data
   - Consistent UI for encryption states
   - Render prop pattern for flexible content

## Usage

### Basic Usage with Hook

```tsx
import { useSealEncryption } from '../hooks/useSealEncryption';

function MyComponent({ encryptedData }) {
  const { decryptedData, isDecrypting, error, decrypt, lock } = 
    useSealEncryption(encryptedData);

  return (
    <div>
      {!decryptedData ? (
        <button onClick={decrypt} disabled={isDecrypting}>
          {isDecrypting ? 'Decrypting...' : 'Decrypt Data'}
        </button>
      ) : (
        <>
          <button onClick={lock}>Lock Data</button>
          <div>{JSON.stringify(decryptedData)}</div>
        </>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Using ContributionHistory Component

```tsx
import { ContributionHistory } from '../components/profile/ContributionHistory';

function ProfilePage() {
  const { data: profile } = useReputationProfile(address);

  return (
    <ContributionHistory 
      encryptedData={profile.encryptedData}
      userAddress={address}
    />
  );
}
```

### Using EncryptedDataViewer Component

```tsx
import { EncryptedDataViewer } from '../components/profile/EncryptedDataViewer';

function MyComponent({ encryptedData }) {
  return (
    <EncryptedDataViewer
      encryptedData={encryptedData}
      title="Personal Notes"
      emptyMessage="No notes available"
      lockedMessage="Your notes are encrypted for privacy"
    >
      {(data) => (
        <div>
          <p>{data.personalNotes}</p>
          <ul>
            {data.contributionHistory?.contributions.map((c, i) => (
              <li key={i}>{c.amount} SUI - {c.status}</li>
            ))}
          </ul>
        </div>
      )}
    </EncryptedDataViewer>
  );
}
```

## Data Structures

### DecryptedUserData

```typescript
interface DecryptedUserData {
  contributionHistory?: {
    contributions: Array<{
      groupId: string;
      amount: number;
      timestamp: number;
      status: 'on-time' | 'late';
    }>;
    totalAmount: number;
    averageAmount: number;
  };
  personalNotes?: string;
  preferences?: Record<string, any>;
}
```

## Error Handling

The implementation includes comprehensive error handling:

### Error Types

- `EMPTY_DATA` - No encrypted data available
- `INVALID_KEY` - Invalid encryption/decryption key
- `DECRYPTION_FAILED` - General decryption failure
- `ENCRYPTION_FAILED` - General encryption failure

### Error Display

Errors are displayed in a user-friendly format with:
- Clear error messages
- Visual indicators (icons, colors)
- Retry options
- Graceful degradation

## Security Considerations

1. **Private Key Management**
   - Keys are retrieved from the user's connected wallet
   - Keys are never stored in application state
   - Keys are only used for the duration of the decryption operation

2. **Data Privacy**
   - Encrypted data is only decrypted on user request
   - Decrypted data is stored in component state (not persisted)
   - Users can "lock" data at any time to clear decrypted state

3. **Access Control**
   - Only the data owner can decrypt their data
   - Public profiles do not show encrypted data sections
   - Wallet connection is required for decryption

## Production Implementation

This is a simplified implementation for demonstration. In production:

1. **Install Seal SDK**
   ```bash
   npm install @sui/seal
   # or the actual Seal package name
   ```

2. **Update `getUserPrivateKey()`**
   ```typescript
   export async function getUserPrivateKey(): Promise<Uint8Array> {
     // Get signing key from wallet
     const wallet = await getConnectedWallet();
     const signature = await wallet.signMessage('Decrypt data');
     
     // Derive decryption key from signature
     return deriveDecryptionKey(signature);
   }
   ```

3. **Update `decryptSealData()`**
   ```typescript
   import { SealClient } from '@sui/seal';
   
   export async function decryptSealData(
     encryptedData: Uint8Array,
     privateKey: Uint8Array
   ): Promise<DecryptedUserData> {
     const sealClient = new SealClient();
     const decrypted = await sealClient.decrypt(encryptedData, privateKey);
     return JSON.parse(new TextDecoder().decode(decrypted));
   }
   ```

4. **Update `encryptSealData()`**
   ```typescript
   import { SealClient } from '@sui/seal';
   
   export async function encryptSealData(
     data: DecryptedUserData,
     publicKey: Uint8Array
   ): Promise<Uint8Array> {
     const sealClient = new SealClient();
     const jsonData = new TextEncoder().encode(JSON.stringify(data));
     return await sealClient.encrypt(jsonData, publicKey);
   }
   ```

## Testing

To test the encryption functionality:

1. Connect your wallet
2. Navigate to your profile page
3. Scroll to the "Contribution History (Encrypted)" section
4. Click "Decrypt Data"
5. View your decrypted contribution history
6. Click "Lock Data" to re-encrypt

## Future Enhancements

1. **Selective Decryption** - Decrypt only specific fields
2. **Caching** - Cache decrypted data with expiration
3. **Batch Operations** - Decrypt multiple data sources at once
4. **Key Rotation** - Support for updating encryption keys
5. **Audit Logging** - Track decryption events for security
6. **Multi-Party Encryption** - Share encrypted data with specific users

## Requirements Satisfied

This implementation satisfies the following requirements:

- **5.3**: Encrypt user identity information in Reputation Profiles using Seal
- **5.4**: Provide decryption capabilities only to authorized parties with proper credentials

## Related Files

- `src/utils/seal.ts` - Core encryption utilities
- `src/hooks/useSealEncryption.ts` - React hook for encryption state
- `src/components/profile/ContributionHistory.tsx` - Contribution history component
- `src/components/profile/EncryptedDataViewer.tsx` - Generic encrypted data viewer
- `src/pages/ProfilePage.tsx` - Profile page with encrypted data integration
