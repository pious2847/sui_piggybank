# Transaction System Documentation

## Overview

This transaction system provides a comprehensive solution for signing and executing blockchain transactions with:
- Transaction builder functions for all smart contract calls
- Enhanced hook wrapper with status tracking
- Transaction confirmation modals
- User-friendly error handling
- Automatic cache invalidation

## Quick Start

### 1. Import Required Functions

```typescript
import { useSignAndExecute, getTransactionErrorMessage } from "../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../components/TransactionConfirmationModal";
import { createGroupSusuTx, joinGroupTx, contributeTx } from "../utils/transactions";
import { useNetworkVariable } from "../networkConfig";
```

### 2. Set Up the Hook

```typescript
const counterPackageId = useNetworkVariable("counterPackageId");
const { execute, status, result, error, reset } = useSignAndExecute();
const [showModal, setShowModal] = useState(false);
```

### 3. Execute a Transaction

```typescript
const handleCreateGroup = () => {
  // Build the transaction
  const tx = createGroupSusuTx(
    counterPackageId,
    "My Savings Group",
    BigInt(1_000_000_000), // 1 SUI
    BigInt(7 * 24 * 60 * 60 * 1000), // 1 week
    BigInt(10) // max participants
  );

  // Show modal and execute
  setShowModal(true);
  execute(tx, {
    invalidateQueries: [["allGroups"], ["userGroups"]],
    successMessage: "Group created successfully!",
    errorMessage: "Failed to create group",
    onSuccess: () => {
      console.log("Group created!");
    },
  });
};
```

### 4. Add the Modal

```typescript
<TransactionConfirmationModal
  isOpen={showModal}
  onClose={() => {
    setShowModal(false);
    reset();
  }}
  status={status}
  title="Create Group"
  description={getTransactionErrorMessage(error)}
  transactionDigest={result?.digest}
  error={error}
/>
```

## Available Transaction Builders

### Group Susu Transactions
- `createGroupSusuTx()` - Create a new group
- `joinGroupTx()` - Join an existing group
- `contributeTx()` - Make a contribution
- `distributeRoundTx()` - Distribute round funds
- `completeCycleTx()` - Complete a cycle

### Reputation Transactions
- `createReputationProfileTx()` - Create profile
- `awardContributionPointsTx()` - Award points
- `awardCycleCompletionBonusTx()` - Award bonus
- `updateEncryptedDataTx()` - Update encrypted data

### NFT Reward Transactions
- `initNFTCollectionTx()` - Initialize collection (admin)
- `mintRewardTx()` - Mint NFT reward (admin)
- `transferRewardTx()` - Transfer NFT

### PiggyBank Transactions
- `createPiggyBankTx()` - Create piggy bank
- `depositToPiggyBankTx()` - Deposit funds
- `breakPiggyBankTx()` - Break and withdraw

### Admin Transactions
- `updatePlatformConfigTx()` - Update config (admin)
- `transferAdminCapTx()` - Transfer admin rights (admin)

## Hook API

### useSignAndExecute()

Returns:
- `execute(tx, options)` - Execute a transaction
- `reset()` - Reset state
- `isPending` - Transaction in progress
- `status` - Current status ("idle" | "pending" | "success" | "error")
- `result` - Transaction result with digest
- `error` - Error object if failed
- `isSuccess` - Boolean success state
- `isError` - Boolean error state
- `isIdle` - Boolean idle state

### Execute Options

```typescript
{
  onSuccess?: (result) => void,
  onError?: (error) => void,
  onSettled?: () => void,
  invalidateQueries?: string[][], // Query keys to invalidate
  successMessage?: string,
  errorMessage?: string,
}
```

## Error Handling

The system provides user-friendly error messages:

```typescript
import { getTransactionErrorMessage } from "../hooks/useSignAndExecute";

const errorMsg = getTransactionErrorMessage(error);
// Returns: "Insufficient SUI balance to pay for gas fees..."
```

## Best Practices

1. Always show a modal during transactions
2. Invalidate relevant queries on success
3. Provide clear success/error messages
4. Use the reset() function when closing modals
5. Handle retry logic for failed transactions
