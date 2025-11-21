import { useQueryClient } from "@tanstack/react-query";
import {
  getInvalidateKeysAfterJoinGroup,
  getInvalidateKeysAfterContribution,
  getInvalidateKeysAfterDistribution,
  getInvalidateKeysAfterCycleComplete,
  getInvalidateKeysAfterNFTMint,
  getInvalidateKeysAfterGroupCreate,
  getInvalidateKeysAfterReputationCreate,
} from "../queryConfig";

/**
 * Hook that provides cache invalidation functions for different transaction types
 * Use these functions after successful transactions to ensure UI reflects latest blockchain state
 */
export function useCacheInvalidation() {
  const queryClient = useQueryClient();

  /**
   * Invalidate cache after a user joins a group
   */
  const invalidateAfterJoinGroup = async (userAddress: string, groupId: string) => {
    const keys = getInvalidateKeysAfterJoinGroup(userAddress, groupId);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate cache after a contribution is made
   */
  const invalidateAfterContribution = async (userAddress: string, groupId: string) => {
    const keys = getInvalidateKeysAfterContribution(userAddress, groupId);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate cache after a round distribution
   */
  const invalidateAfterDistribution = async (groupId: string, recipientAddress: string) => {
    const keys = getInvalidateKeysAfterDistribution(groupId, recipientAddress);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate cache after a cycle completes
   */
  const invalidateAfterCycleComplete = async (groupId: string, participantAddresses: string[]) => {
    const keys = getInvalidateKeysAfterCycleComplete(groupId, participantAddresses);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate cache after an NFT is minted
   */
  const invalidateAfterNFTMint = async (recipientAddress: string) => {
    const keys = getInvalidateKeysAfterNFTMint(recipientAddress);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate cache after a group is created
   */
  const invalidateAfterGroupCreate = async (creatorAddress: string) => {
    const keys = getInvalidateKeysAfterGroupCreate(creatorAddress);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate cache after a reputation profile is created
   */
  const invalidateAfterReputationCreate = async (userAddress: string) => {
    const keys = getInvalidateKeysAfterReputationCreate(userAddress);
    await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  /**
   * Invalidate all queries (use sparingly, only when necessary)
   */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries();
  };

  return {
    invalidateAfterJoinGroup,
    invalidateAfterContribution,
    invalidateAfterDistribution,
    invalidateAfterCycleComplete,
    invalidateAfterNFTMint,
    invalidateAfterGroupCreate,
    invalidateAfterReputationCreate,
    invalidateAll,
  };
}

/**
 * Example usage in a transaction component:
 * 
 * const { invalidateAfterJoinGroup } = useCacheInvalidation();
 * const { mutate: joinGroup } = useSignAndExecuteTransaction();
 * 
 * const handleJoinGroup = () => {
 *   joinGroup(
 *     { transaction: txb },
 *     {
 *       onSuccess: async () => {
 *         await invalidateAfterJoinGroup(userAddress, groupId);
 *         toast.success("Successfully joined group!");
 *       },
 *     }
 *   );
 * };
 */
