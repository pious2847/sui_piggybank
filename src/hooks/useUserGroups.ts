import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { groupSusuQueryConfig, getUserGroupsQueryKey } from "../queryConfig";
import { TESTNET_COUNTER_PACKAGE_ID } from "../constants";

export interface GroupSusuMembership {
  id: string;
  name: string;
  creator: string;
  contributionAmount: number;
  contributionFrequency: number;
  maxParticipants: number;
  participantCount: number;
  balance: number;
  currentRound: number;
  totalRounds: number;
  cycleComplete: boolean;
  createdAt: number;
  userPosition: number;
}

/**
 * Hook to fetch all group susu memberships for a user
 * This queries all GroupSusu objects and filters for ones where the user is a participant
 */
export function useUserGroups(address: string | undefined) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: getUserGroupsQueryKey(address || ""),
    queryFn: async () => {
      if (!address) return [];

      try {
        // Query for all GroupCreatedEvent events to find all groups
        const response = await suiClient.queryEvents({
          query: {
            MoveEventType: `${TESTNET_COUNTER_PACKAGE_ID}::group_susu::GroupCreatedEvent`,
          },
          limit: 50,
          order: "descending",
        });

        // Extract group IDs from events
        const groupIds = response.data
          .map((event) => {
            const parsedJson = event.parsedJson as any;
            return parsedJson?.group_id;
          })
          .filter(Boolean);

        // Fetch full group data for each ID and filter for user's groups
        const groupPromises = groupIds.map(async (groupId) => {
          try {
            const object = await suiClient.getObject({
              id: groupId,
              options: {
                showContent: true,
                showType: true,
              },
            });

            if (!object.data) return null;

            const content = object.data.content;
            if (content && "fields" in content) {
              const fields = content.fields as any;
              const participants = fields.participants || [];

              // Check if user is a participant
              if (!participants.includes(address)) {
                return null;
              }

              // Find user's position in the round recipients
              const roundRecipients = fields.round_recipients || [];
              const userPosition = roundRecipients.indexOf(address);

              return {
                id: object.data.objectId,
                name: fields.name || "Unnamed Group",
                creator: fields.creator || "",
                contributionAmount: Number(fields.contribution_amount || 0),
                contributionFrequency: Number(fields.contribution_frequency_ms || 0),
                maxParticipants: Number(fields.max_participants || 0),
                participantCount: Number(fields.participant_count || 0),
                balance: Number(fields.balance || 0),
                currentRound: Number(fields.current_round || 0),
                totalRounds: Number(fields.total_rounds || 0),
                cycleComplete: fields.cycle_complete || false,
                createdAt: Number(fields.created_at || 0),
                userPosition: userPosition >= 0 ? userPosition : 0,
              } as GroupSusuMembership;
            }

            return null;
          } catch (error) {
            console.error(`Error fetching group ${groupId}:`, error);
            return null;
          }
        });

        const userGroups = (await Promise.all(groupPromises)).filter(
          (group): group is GroupSusuMembership => group !== null
        );

        return userGroups;
      } catch (error) {
        console.error("Error fetching user groups:", error);
        return [];
      }
    },
    enabled: !!address,
    ...groupSusuQueryConfig,
  });
}
