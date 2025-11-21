import { useSignAndExecuteTransaction, useSuiClient, useCurrentAccount } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../networkConfig";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getReputationProfileQueryKey } from "../queryConfig";

/**
 * Hook to create a reputation profile for the current user
 * This should be called once when a user first joins the platform
 */
export function useCreateReputationProfile() {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const tx = new Transaction();

      // Get current timestamp
      const timestamp = Date.now();

      // Empty public key for now (Seal encryption placeholder)
      const publicKey: number[] = [];

      // Call create_reputation_profile
      tx.moveCall({
        target: `${counterPackageId}::reputation::create_reputation_profile`,
        arguments: [
          tx.pure.u64(timestamp),
          tx.pure.vector("u8", publicKey),
        ],
      });

      // Execute transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
      });

      // Wait for transaction to be confirmed
      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      return result;
    },
    onSuccess: () => {
      // Invalidate reputation profile query to refetch
      if (currentAccount?.address) {
        queryClient.invalidateQueries({
          queryKey: getReputationProfileQueryKey(currentAccount.address, counterPackageId),
        });
      }
    },
  });
}
