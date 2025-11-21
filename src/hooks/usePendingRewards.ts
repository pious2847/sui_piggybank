import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { TESTNET_COUNTER_PACKAGE_ID } from "../constants";

export interface PendingReward {
  user: string;
  reputationScore: number;
  cyclesCompleted: number;
  eligibleFor: string[];
  lastRewardedAt?: number;
}

/**
 * Hook to fetch users eligible for NFT rewards
 * Queries reputation profiles and determines eligibility based on achievements
 */
export function usePendingRewards() {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["pendingRewards"],
    queryFn: async () => {
      try {
        // Query all reputation profiles
        // Note: In production, this would use an indexer for better performance
        const { data: profiles } = await suiClient.getOwnedObjects({
          owner: TESTNET_COUNTER_PACKAGE_ID,
          filter: {
            StructType: `${TESTNET_COUNTER_PACKAGE_ID}::reputation::ReputationProfile`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        // Query all NFT minting events to see who has already received rewards
        const nftEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${TESTNET_COUNTER_PACKAGE_ID}::nft_rewards::NFTMintedEvent`,
          },
          limit: 100,
          order: "descending",
        });

        // Build a map of users and their last rewarded achievement types
        const userRewards = new Map<string, Set<number>>();
        nftEvents.data.forEach((event) => {
          const parsedJson = event.parsedJson as any;
          const user = parsedJson.recipient;
          const achievementType = Number(parsedJson.achievement_type);
          
          if (!userRewards.has(user)) {
            userRewards.set(user, new Set());
          }
          userRewards.get(user)!.add(achievementType);
        });

        // Process profiles to determine eligibility
        const pendingRewards: PendingReward[] = [];

        for (const profileObj of profiles) {
          const content = profileObj.data?.content;
          if (!content || !("fields" in content)) continue;

          const fields = content.fields as any;
          const user = fields.owner;
          const reputationScore = Number(fields.reputation_score || 0);
          const cyclesCompleted = Number(fields.cycles_completed || 0);
          const onTimeContributions = Number(fields.on_time_contributions || 0);
          const totalContributions = Number(fields.total_contributions || 0);

          const eligibleFor: string[] = [];
          const alreadyRewarded = userRewards.get(user) || new Set();

          // Check eligibility for different achievement types
          // Achievement Type 1: Cycle Completion (1 cycle)
          if (cyclesCompleted >= 1 && !alreadyRewarded.has(1)) {
            eligibleFor.push("Cycle Completion Champion");
          }

          // Achievement Type 2: 5 Cycles Milestone
          if (cyclesCompleted >= 5 && !alreadyRewarded.has(2)) {
            eligibleFor.push("5 Cycles Milestone");
          }

          // Achievement Type 3: 10 Cycles Milestone
          if (cyclesCompleted >= 10 && !alreadyRewarded.has(3)) {
            eligibleFor.push("10 Cycles Milestone");
          }

          // Achievement Type 4: Perfect Attendance (100% on-time contributions)
          if (
            totalContributions >= 10 &&
            onTimeContributions === totalContributions &&
            !alreadyRewarded.has(4)
          ) {
            eligibleFor.push("Perfect Attendance");
          }

          // Only include users who are eligible for at least one reward
          if (eligibleFor.length > 0) {
            pendingRewards.push({
              user,
              reputationScore,
              cyclesCompleted,
              eligibleFor,
            });
          }
        }

        // Sort by reputation score (highest first)
        pendingRewards.sort((a, b) => b.reputationScore - a.reputationScore);

        return pendingRewards;
      } catch (error) {
        console.error("Error fetching pending rewards:", error);
        return [];
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
}
