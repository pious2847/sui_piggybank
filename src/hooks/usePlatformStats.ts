import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
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
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: getPlatformStatsQueryKey(counterPackageId),
    queryFn: async () => {
      if (!counterPackageId) {
        return {
          totalUsers: 0,
          activeGroups: 0,
          completedCycles: 0,
          totalNFTsMinted: 0,
          recentTransactions: 0,
        } as PlatformStats;
      }

      try {
        // Query for various platform metrics
        
        // 1. Count total users by querying ReputationEvent to find unique users
        const reputationEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::reputation::ReputationEvent`,
          },
          limit: 50,
          order: "descending",
        });

        const uniqueUsers = new Set(
          reputationEvents.data.map((event) => {
            const parsedJson = event.parsedJson as any;
            return parsedJson?.user;
          }).filter(Boolean)
        );

        // 2. Query for NFT minting events to count total NFTs
        const nftEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::nft_rewards::NFTMintedEvent`,
          },
          limit: 50,
          order: "descending",
        });

        const totalNFTsMinted = nftEvents.data.length;

        // 3. Query for completed cycles (from ReputationEvent)
        const completedCycles = reputationEvents.data.filter((event) => {
          const parsedJson = event.parsedJson as any;
          return parsedJson?.event_type === 2; // 2 = cycle_complete
        }).length;

        // 4. Query for active groups using GroupCreatedEvent
        const groupEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::group_susu::GroupCreatedEvent`,
          },
          limit: 50,
          order: "descending",
        });

        const activeGroups = groupEvents.data.length;

        // 5. Recent transactions (last 24 hours) - count contribution events
        const contributionEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::group_susu::ContributionMadeEvent`,
          },
          limit: 50,
          order: "descending",
        });

        const recentTransactions = contributionEvents.data.length;

        return {
          totalUsers: uniqueUsers.size,
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
