/**
 * Centralized query configuration for blockchain data caching optimization
 * 
 * This file defines optimal caching strategies for different types of blockchain queries
 * to reduce redundant network calls and improve application performance.
 * 
 * Caching Strategy:
 * 1. Owned Objects (60s stale time): User's piggy banks list changes infrequently
 * 2. Object Details (15s stale time): Balance and status change with deposits/actions
 * 3. Action Validation (15s stale time): Need fresh data for proper validation
 * 
 * All queries include:
 * - Exponential backoff retry (3 attempts, max 30s delay)
 * - Background refetching when stale
 * - Refetch on window focus and network reconnect
 * - 10-minute garbage collection time
 * - Unique query keys for proper cache isolation
 */

// Base retry configuration with exponential backoff
export const baseRetryConfig = {
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Common refetch configuration
export const baseRefetchConfig = {
  refetchOnWindowFocus: true,
  refetchOnMount: 'always' as const,
  refetchOnReconnect: true,
};

/**
 * Configuration for owned objects queries (user's piggy banks list)
 * These queries are cached longer since owned objects don't change frequently
 */
export const ownedObjectsQueryConfig = {
  // Cache for 60 seconds before considering stale
  staleTime: 60000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Configuration for individual object queries (piggy bank details)
 * These queries need fresher data since balances change with deposits
 */
export const objectDetailsQueryConfig = {
  // Cache for 15 seconds before considering stale
  staleTime: 15000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Configuration for action validation queries
 * These queries need relatively fresh data for proper validation
 */
export const actionValidationQueryConfig = {
  // Cache for 15 seconds before considering stale
  staleTime: 15000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Generate a unique query key for piggy bank details
 * This ensures proper cache isolation between different banks
 */
export const getPiggyBankDetailsQueryKey = (bankId: string) => ['piggyBankDetails', bankId];

/**
 * Generate a unique query key for piggy bank actions
 * This ensures proper cache isolation between different banks
 */
export const getPiggyBankActionsQueryKey = (bankId: string) => ['piggyBankActions', bankId];

/**
 * Generate a unique query key for owned objects
 * This ensures proper cache isolation between different users
 */
export const getOwnedObjectsQueryKey = (address: string) => ['ownedObjects', address];

/**
 * Configuration for group susu queries
 * These queries need relatively fresh data since group state changes with contributions
 */
export const groupSusuQueryConfig = {
  // Cache for 15 seconds before considering stale
  staleTime: 15000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Configuration for reputation profile queries
 * These queries can be cached longer since reputation changes less frequently
 */
export const reputationQueryConfig = {
  // Cache for 15 seconds before considering stale
  staleTime: 15000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Configuration for NFT queries
 * These queries can be cached longer since NFTs don't change after minting
 */
export const nftQueryConfig = {
  // Cache for 30 seconds before considering stale
  staleTime: 30000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Configuration for platform stats queries
 * These queries can be cached longer since they're aggregate data
 */
export const platformStatsQueryConfig = {
  // Cache for 30 seconds before considering stale
  staleTime: 30000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Configuration for all groups queries (explore page)
 * These queries can be cached longer since the list doesn't change frequently
 */
export const allGroupsQueryConfig = {
  // Cache for 30 seconds before considering stale
  staleTime: 30000,
  // Keep in cache for 10 minutes after last use
  gcTime: 600000,
  ...baseRefetchConfig,
  ...baseRetryConfig,
};

/**
 * Generate query keys for group susu data
 */
export const getGroupSusuQueryKey = (groupId: string) => ['groupSusu', groupId];
export const getGroupParticipantsQueryKey = (groupId: string) => ['groupParticipants', groupId];
export const getAllGroupsQueryKey = (filters?: any, cursor?: string | null, limit?: number) => 
  ['allGroups', filters, cursor, limit];

/**
 * Generate query keys for reputation data
 */
export const getReputationProfileQueryKey = (address: string, packageId?: string) => ['reputationProfile', address, packageId];
export const getReputationEventsQueryKey = (address: string, packageId?: string) => ['reputationEvents', address, packageId];

/**
 * Generate query keys for NFT data
 */
export const getUserNFTsQueryKey = (address: string, packageId?: string) => ['userNFTs', address, packageId];
export const getNFTMintEventsQueryKey = (address: string, packageId?: string) => ['nftMintEvents', address, packageId];

/**
 * Generate query keys for user groups
 */
export const getUserGroupsQueryKey = (address: string, packageId?: string) => ['userGroups', address, packageId];

/**
 * Generate query key for platform stats
 */
export const getPlatformStatsQueryKey = (packageId?: string) => ['platformStats', packageId];

/**
 * Cache invalidation helpers
 * These functions return arrays of query keys that should be invalidated
 * after specific transaction types
 */

/**
 * Query keys to invalidate after a user joins a group
 */
export const getInvalidateKeysAfterJoinGroup = (userAddress: string, groupId: string, packageId?: string) => [
  getGroupSusuQueryKey(groupId),
  getGroupParticipantsQueryKey(groupId),
  getUserGroupsQueryKey(userAddress, packageId),
  getAllGroupsQueryKey(),
  getPlatformStatsQueryKey(),
];

/**
 * Query keys to invalidate after a contribution is made
 */
export const getInvalidateKeysAfterContribution = (userAddress: string, groupId: string, packageId?: string) => [
  getGroupSusuQueryKey(groupId),
  getGroupParticipantsQueryKey(groupId),
  getUserGroupsQueryKey(userAddress, packageId),
  getReputationProfileQueryKey(userAddress, packageId),
  getReputationEventsQueryKey(userAddress, packageId),
];

/**
 * Query keys to invalidate after a round distribution
 */
export const getInvalidateKeysAfterDistribution = (groupId: string, recipientAddress: string, packageId?: string) => [
  getGroupSusuQueryKey(groupId),
  getGroupParticipantsQueryKey(groupId),
  getReputationProfileQueryKey(recipientAddress, packageId),
  getReputationEventsQueryKey(recipientAddress, packageId),
  getPlatformStatsQueryKey(),
];

/**
 * Query keys to invalidate after a cycle completes
 */
export const getInvalidateKeysAfterCycleComplete = (groupId: string, participantAddresses: string[], packageId?: string) => {
  const keys = [
    getGroupSusuQueryKey(groupId),
    getGroupParticipantsQueryKey(groupId),
    getAllGroupsQueryKey(),
    getPlatformStatsQueryKey(),
  ];
  
  // Add reputation keys for all participants
  participantAddresses.forEach(address => {
    keys.push(getReputationProfileQueryKey(address, packageId));
    keys.push(getReputationEventsQueryKey(address, packageId));
  });
  
  return keys;
};

/**
 * Query keys to invalidate after an NFT is minted
 */
export const getInvalidateKeysAfterNFTMint = (recipientAddress: string, packageId?: string) => [
  getUserNFTsQueryKey(recipientAddress, packageId),
  getNFTMintEventsQueryKey(recipientAddress, packageId),
  getPlatformStatsQueryKey(),
];

/**
 * Query keys to invalidate after a group is created
 */
export const getInvalidateKeysAfterGroupCreate = (creatorAddress: string, packageId?: string) => [
  getUserGroupsQueryKey(creatorAddress, packageId),
  getAllGroupsQueryKey(),
  getPlatformStatsQueryKey(),
];

/**
 * Query keys to invalidate after a reputation profile is created
 */
export const getInvalidateKeysAfterReputationCreate = (userAddress: string, packageId?: string) => [
  getReputationProfileQueryKey(userAddress, packageId),
  getPlatformStatsQueryKey(),
];