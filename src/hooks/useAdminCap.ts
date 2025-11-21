import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { DEVNET_COUNTER_PACKAGE_ID,ADMIN_CAP_ID  } from "../constants";


/**
 * Hook to check if the current user owns an AdminCap
 * Returns the AdminCap object if found, null otherwise
 */
export function useAdminCap(address: string | undefined) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["adminCap", address],
    queryFn: async () => {
      if (!address) return null;

      try {
        // Try to find AdminCap with the current package ID
        let { data } = await suiClient.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${DEVNET_COUNTER_PACKAGE_ID}::admin::AdminCap`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        // If not found, try with the original package ID (for AdminCaps created before upgrade)
        if (data.length === 0) {
          const originalResult = await suiClient.getOwnedObjects({
            owner: address,
            filter: {
              StructType: `${ADMIN_CAP_ID }::admin::AdminCap`,
            },
            options: {
              showContent: true,
              showType: true,
            },
          });
          data = originalResult.data;
        }

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
