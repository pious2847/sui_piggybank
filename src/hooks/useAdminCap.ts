import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";


/**
 * Hook to check if the current user owns an AdminCap
 * Returns the AdminCap object if found, null otherwise
 */
export function useAdminCap(address: string | undefined) {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: ["adminCap", address, counterPackageId],
    queryFn: async () => {
      if (!address || !counterPackageId) return null;

      try {
        // Try to find AdminCap with the current package ID
        let { data } = await suiClient.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${counterPackageId}::admin::AdminCap`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        if (data.length === 0) {
          return null;
        }

        // Return the first AdminCap found
        const adminCapObject = data[0];
        return {
          id: adminCapObject.data?.objectId || "",
          owner: address,
        };
      } catch (error) {
        console.error("Error fetching AdminCap:", error);
        return null;
      }
    },
    enabled: !!address,
    staleTime: 60000, // 1 minute
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
