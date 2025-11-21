import { Transaction } from "@mysten/sui/transactions";

/**
 * Transaction builder functions for all smart contract calls
 * These functions create Transaction objects that can be signed and executed
 */

const SUI_CLOCK_OBJECT_ID = "0x6";

// ============================================================================
// GROUP SUSU TRANSACTIONS
// ============================================================================

/**
 * Create a new Group Susu
 */
export function createGroupSusuTx(
  packageId: string,
  name: string,
  contributionAmount: bigint,
  contributionFrequencyMs: bigint,
  maxParticipants: bigint
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::group_susu::create_group_susu`,
    arguments: [
      tx.pure.string(name),
      tx.pure.u64(contributionAmount),
      tx.pure.u64(contributionFrequencyMs),
      tx.pure.u64(maxParticipants),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Join an existing Group Susu
 */
export function joinGroupTx(
  packageId: string,
  groupId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::group_susu::join_group`,
    arguments: [
      tx.object(groupId),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Make a contribution to a Group Susu
 */
export function contributeTx(
  packageId: string,
  groupId: string,
  amount: bigint
): Transaction {
  const tx = new Transaction();
  
  // Split coins for the contribution amount
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
  // For now, use an empty public key (encryption is optional)
  // In production, this would be the user's actual public key for Seal encryption
  const emptyPublicKey: number[] = [];
  
  tx.moveCall({
    target: `${packageId}::group_susu::contribute`,
    arguments: [
      tx.object(groupId),
      coin,
      tx.pure.vector("u8", emptyPublicKey),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Distribute round funds to the current recipient
 */
export function distributeRoundTx(
  packageId: string,
  groupId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::group_susu::distribute_round`,
    arguments: [
      tx.object(groupId),
    ],
  });
  
  return tx;
}

/**
 * Complete a cycle
 */
export function completeCycleTx(
  packageId: string,
  groupId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::group_susu::complete_cycle`,
    arguments: [
      tx.object(groupId),
    ],
  });
  
  return tx;
}

// ============================================================================
// REPUTATION TRANSACTIONS
// ============================================================================

/**
 * Create a reputation profile for a user
 */
export function createReputationProfileTx(
  packageId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::reputation::create_reputation_profile`,
    arguments: [
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Award contribution points to a user
 */
export function awardContributionPointsTx(
  packageId: string,
  profileId: string,
  points: bigint,
  isOnTime: boolean
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::reputation::award_contribution_points`,
    arguments: [
      tx.object(profileId),
      tx.pure.u64(points),
      tx.pure.bool(isOnTime),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Award cycle completion bonus
 */
export function awardCycleCompletionBonusTx(
  packageId: string,
  profileId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::reputation::award_cycle_completion_bonus`,
    arguments: [
      tx.object(profileId),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Update encrypted data in reputation profile
 */
export function updateEncryptedDataTx(
  packageId: string,
  profileId: string,
  encryptedData: Uint8Array
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::reputation::update_encrypted_data`,
    arguments: [
      tx.object(profileId),
      tx.pure.vector("u8", Array.from(encryptedData)),
    ],
  });
  
  return tx;
}

// ============================================================================
// NFT REWARD TRANSACTIONS
// ============================================================================

/**
 * Initialize NFT collection (admin only)
 */
export function initNFTCollectionTx(
  packageId: string,
  adminCapId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::nft_rewards::init_nft_collection`,
    arguments: [
      tx.object(adminCapId),
    ],
  });
  
  return tx;
}

/**
 * Mint an NFT reward (admin only)
 */
export function mintRewardTx(
  packageId: string,
  adminCapId: string,
  collectionId: string,
  recipient: string,
  name: string,
  description: string,
  imageUrl: string,
  metadataUrl: string,
  achievementType: number
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::nft_rewards::mint_reward`,
    arguments: [
      tx.object(adminCapId),
      tx.object(collectionId),
      tx.pure.address(recipient),
      tx.pure.string(name),
      tx.pure.string(description),
      tx.pure.string(imageUrl),
      tx.pure.string(metadataUrl),
      tx.pure.u8(achievementType),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Transfer NFT reward to recipient
 */
export function transferRewardTx(
  packageId: string,
  nftId: string,
  recipient: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::nft_rewards::transfer_reward`,
    arguments: [
      tx.object(nftId),
      tx.pure.address(recipient),
    ],
  });
  
  return tx;
}

// ============================================================================
// PIGGY BANK TRANSACTIONS (existing functionality)
// ============================================================================

/**
 * Create a new PiggyBank
 */
export function createPiggyBankTx(
  packageId: string,
  goalAmount: bigint,
  unlockTimestampMs: bigint
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::counter::create_piggy_bank`,
    arguments: [
      tx.pure.u64(goalAmount),
      tx.pure.u64(unlockTimestampMs),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

/**
 * Deposit SUI into a PiggyBank
 */
export function depositToPiggyBankTx(
  packageId: string,
  bankId: string,
  amount: bigint
): Transaction {
  const tx = new Transaction();
  
  // Split coins for the deposit amount
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
  tx.moveCall({
    target: `${packageId}::counter::deposit`,
    arguments: [
      tx.object(bankId),
      coin,
    ],
  });
  
  return tx;
}

/**
 * Break a PiggyBank and withdraw funds
 */
export function breakPiggyBankTx(
  packageId: string,
  bankId: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::counter::break_piggy_bank`,
    arguments: [
      tx.object(bankId),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  
  return tx;
}

// ============================================================================
// ADMIN TRANSACTIONS
// ============================================================================

/**
 * Update platform configuration (admin only)
 */
export function updatePlatformConfigTx(
  packageId: string,
  adminCapId: string,
  configId: string,
  nftMintingEnabled: boolean,
  minReputationForRewards: bigint
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::admin::update_platform_config`,
    arguments: [
      tx.object(adminCapId),
      tx.object(configId),
      tx.pure.bool(nftMintingEnabled),
      tx.pure.u64(minReputationForRewards),
    ],
  });
  
  return tx;
}

/**
 * Transfer admin capability (admin only)
 */
export function transferAdminCapTx(
  packageId: string,
  adminCapId: string,
  configId: string,
  newAdmin: string
): Transaction {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${packageId}::admin::transfer_admin_cap`,
    arguments: [
      tx.object(adminCapId),
      tx.pure.address(newAdmin),
      tx.object(configId),
    ],
  });
  
  return tx;
}
