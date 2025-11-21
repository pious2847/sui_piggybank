import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { TESTNET_COUNTER_PACKAGE_ID } from "../constants";

export interface PlatformConfig {
  id: string;
  admin: string;
  nftMintingEnabled: boolean;
  minReputationForRewards: number;
}

/**
 * Hook to fetch the platform configuration
 * This is a shared object that contains platform-wide settings
 */
export function usePlatformConfig() {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["platformConfig"],
    queryFn: async () => {
      try {
        // Query for PlatformConfig shared object
        // Note: In production, you'd want to know the object ID or use an indexer
        const { data } = await suiClient.getOwnedObjects({
          owner: TESTNET_COUNTER_PACKAGE_ID,
          filter: {
            StructType: `${TESTNET_COUNTER_PACKAGE_ID}::admin::PlatformConfig`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        if (data.length === 0) {
          return null;
        }

        const configObject = data[0];
        const content = configObject.data?.content;

        if (content && "fields" in content) {
          const fields = content.fields as any;
          
          return {
            id: configObject.data?.objectId || "",
            admin: fields.admin || "",
            nftMintingEnabled: fields.nft_minting_enabled || false,
            minReputationForRewards: Number(fields.min_reputation_for_rewards || 0),
          } as PlatformConfig;
        }

        return null;
      } catch (error) {
        console.error("Error fetching platform config:", error);
        return null;
      }
    },
    staleTime: 60000, // 1 minute
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
