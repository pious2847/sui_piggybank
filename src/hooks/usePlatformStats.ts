import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { TESTNET_COUNTER_PACKAGE_ID } from "../constants";
import { platformStatsQueryConfig, getPlatformStatsQueryKey } from "../queryConfig";

export interface PlatformStats {
  totalUsers: number;
  activeGroups: number;
  completedCycles: number;
  totalNFTsMinted: number;
  recentTransactions: number;
}

/**
 * Hook to fetch platform-wide statistics
 * Aggregates data from various sources to provide admin dashboard metrics
 */
export function usePlatformStats() {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: getPlatformStatsQueryKey(),
    queryFn: async () => {
      try {
        // Query for various platform metrics
        
        // 1. Count total users (ReputationProfile objects)
        const reputationProfiles = await suiClient.getOwnedObjects({
          owner: TESTNET_COUNTER_PACKAGE_ID,
          filter: {
            StructType: `${TESTNET_COUNTER_PACKAGE_ID}::reputation::ReputationProfile`,
          },
          options: {
            showContent: false,
          },
        });

        // 2. Query for NFT collection to get total minted
        const nftCollections = await suiClient.getOwnedObjects({
          owner: TESTNET_COUNTER_PACKAGE_ID,
          filter: {
            StructType: `${TESTNET_COUNTER_PACKAGE_ID}::nft_rewards::NFTCollection`,
          },
          options: {
            showContent: true,
          },
        });

        let totalNFTsMinted = 0;
        if (nftCollections.data.length > 0) {
          const content = nftCollections.data[0].data?.content;
          if (content && "fields" in content) {
            const fields = content.fields as any;
            totalNFTsMinted = Number(fields.total_minted || 0);
          }
        }

        // 3. Query for completed cycles (from ReputationEvent)
        const cycleEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${TESTNET_COUNTER_PACKAGE_ID}::reputation::ReputationEvent`,
          },
          limit: 50,
          order: "descending",
        });

        const completedCycles = cycleEvents.data.filter((event) => {
          const parsedJson = event.parsedJson as any;
          return parsedJson?.event_type === 2; // 2 = cycle_complete
        }).length;

        // 4. Query for active groups (GroupSusu objects where cycle_complete = false)
        // Note: This would require an indexer in production
        // For now, we'll use a placeholder
        const activeGroups = 0; // TODO: Implement with indexer

        // 5. Recent transactions (last 24 hours)
        const recentTransactions = 0; // TODO: Implement with transaction history

        return {
          totalUsers: reputationProfiles.data.length,
          activeGroups,
          completedCycles,
          totalNFTsMinted,
          recentTransactions,
        } as PlatformStats;
      } catch (error) {
        console.error("Error fetching platform stats:", error);
        return {
          totalUsers: 0,
          activeGroups: 0,
          completedCycles: 0,
          totalNFTsMinted: 0,
          recentTransactions: 0,
        } as PlatformStats;
      }
    },
    ...platformStatsQueryConfig,
  });
}
