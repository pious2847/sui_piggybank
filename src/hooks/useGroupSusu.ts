import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";

export interface GroupSusu {
  id: string;
  name: string;
  creator: string;
  contributionAmount: number;
  contributionFrequency: number;
  maxParticipants: number;
  participants: string[];
  participantCount: number;
  balance: number;
  currentRound: number;
  totalRounds: number;
  roundRecipients: string[];
  cycleComplete: boolean;
  createdAt: number;
}

export interface ParticipantInfo {
  address: string;
  contributionsMade: number;
  hasReceivedPayout: boolean;
  joinTimestamp: number;
  lastContributionTime: number;
}

/**
 * Hook to fetch a specific GroupSusu object by ID
 * Returns detailed information about the group including all participants
 */
export function useGroupSusu(groupId: string | undefined) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["groupSusu", groupId],
    queryFn: async () => {
      if (!groupId) return null;

      try {
        // Fetch the GroupSusu object
        const object = await suiClient.getObject({
          id: groupId,
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
            id: object.data.objectId,
            name: fields.name || "Unnamed Group",
            creator: fields.creator || "",
            contributionAmount: Number(fields.contribution_amount || 0),
            contributionFrequency: Number(fields.contribution_frequency_ms || 0),
            maxParticipants: Number(fields.max_participants || 0),
            participants: fields.participants || [],
            participantCount: Number(fields.participant_count || 0),
            balance: Number(fields.balance || 0),
            currentRound: Number(fields.current_round || 0),
            totalRounds: Number(fields.total_rounds || 0),
            roundRecipients: fields.round_recipients || [],
            cycleComplete: fields.cycle_complete || false,
            createdAt: Number(fields.created_at || 0),
          } as GroupSusu;
        }

        return null;
      } catch (error) {
        console.error("Error fetching group susu:", error);
        return null;
      }
    },
    enabled: !!groupId,
    staleTime: 15000, // 15 seconds
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch participant information for a specific group
 * Returns detailed status for each participant
 */
export function useGroupParticipants(groupId: string | undefined) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["groupParticipants", groupId],
    queryFn: async () => {
      if (!groupId) return [];

      try {
        // Fetch the GroupSusu object to get participant addresses
        const object = await suiClient.getObject({
          id: groupId,
          options: {
            showContent: true,
          },
        });

        if (!object.data) {
          return [];
        }

        const content = object.data.content;
        if (content && "fields" in content) {
          const fields = content.fields as any;
          const participants = fields.participants || [];
          const lastContributionTime = fields.last_contribution_time || {};

          // Map participants to detailed info
          // Note: In production, this would query additional data structures
          const participantInfo: ParticipantInfo[] = participants.map((address: string, index: number) => ({
            address,
            contributionsMade: 0, // TODO: Query from ParticipantInfo struct
            hasReceivedPayout: index < Number(fields.current_round || 0),
            joinTimestamp: 0, // TODO: Query from ParticipantInfo struct
            lastContributionTime: lastContributionTime[address] || 0,
          }));

          return participantInfo;
        }

        return [];
      } catch (error) {
        console.error("Error fetching group participants:", error);
        return [];
      }
    },
    enabled: !!groupId,
    staleTime: 15000, // 15 seconds
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });
}

/**
 * Hook to check if a user is a participant in a specific group
 */
export function useIsGroupParticipant(groupId: string | undefined, userAddress: string | undefined) {
  const { data: group } = useGroupSusu(groupId);

  return {
    isParticipant: group?.participants.includes(userAddress || "") || false,
    isCreator: group?.creator === userAddress,
    userPosition: group?.participants.indexOf(userAddress || "") ?? -1,
  };
}
