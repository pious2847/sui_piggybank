import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { PLATFORM_CONFIG_ID } from "../constants";

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
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: ["platformConfig", counterPackageId, PLATFORM_CONFIG_ID],
    queryFn: async () => {
      if (!counterPackageId || !PLATFORM_CONFIG_ID) return null;

      try {
        // Use the known PLATFORM_CONFIG_ID from env
        const object = await suiClient.getObject({
          id: PLATFORM_CONFIG_ID,
          options: {
            showContent: true,
            showType: true,
          },
        });

        if (!object.data) {
          return null;
        }

        const content = object.data.content;

        if (content && "fields" in content) {
          const fields = content.fields as any;
          
          return {
            id: object.data.objectId || "",
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
