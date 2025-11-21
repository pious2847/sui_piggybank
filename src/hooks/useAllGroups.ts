import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { TESTNET_COUNTER_PACKAGE_ID } from "../constants";
import { GroupSusu } from "./useGroupSusu";

export interface GroupFilters {
  minContribution?: number;
  maxContribution?: number;
  frequency?: number;
  hasAvailableSlots?: boolean;
  searchQuery?: string;
}

export interface PaginatedGroupsResult {
  groups: GroupSusu[];
  hasNextPage: boolean;
  nextCursor: { eventSeq: string; txDigest: string } | null;
  totalCount: number;
}

/**
 * Hook to fetch all active GroupSusu objects with pagination
 * Used for the explore page to discover available groups
 */
export function useAllGroups(
  filters?: GroupFilters,
  cursor?: { eventSeq: string; txDigest: string } | null,
  limit: number = 20
) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["allGroups", filters, cursor, limit],
    queryFn: async (): Promise<PaginatedGroupsResult> => {
      try {
        // Query for all GroupSusu objects using GroupCreatedEvent
        const response = await suiClient.queryEvents({
          query: {
            MoveEventType: `${TESTNET_COUNTER_PACKAGE_ID}::group_susu::GroupCreatedEvent`,
          },
          limit: limit,
          order: "descending",
          cursor: cursor ? { eventSeq: cursor.eventSeq, txDigest: cursor.txDigest } : undefined,
        });

        // Extract group IDs from events
        const groupIds = response.data.map((event) => {
          const parsedJson = event.parsedJson as any;
          return parsedJson?.group_id;
        }).filter(Boolean);

        // Fetch full group data for each ID
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
            console.error(`Error fetching group ${groupId}:`, error);
            return null;
          }
        });

        const allGroups = (await Promise.all(groupPromises)).filter(
          (group): group is GroupSusu => group !== null
        );

        // Apply filters
        let filteredGroups = allGroups;

        if (filters) {
          filteredGroups = allGroups.filter((group) => {
            // Filter by contribution amount range
            if (filters.minContribution !== undefined && group.contributionAmount < filters.minContribution) {
              return false;
            }
            if (filters.maxContribution !== undefined && group.contributionAmount > filters.maxContribution) {
              return false;
            }

            // Filter by frequency
            if (filters.frequency !== undefined && group.contributionFrequency !== filters.frequency) {
              return false;
            }

            // Filter by available slots
            if (filters.hasAvailableSlots && group.participantCount >= group.maxParticipants) {
              return false;
            }

            // Filter by search query (name)
            if (filters.searchQuery) {
              const query = filters.searchQuery.toLowerCase();
              if (!group.name.toLowerCase().includes(query)) {
                return false;
              }
            }

            // Exclude completed cycles
            if (group.cycleComplete) {
              return false;
            }

            return true;
          });
        }

        return {
          groups: filteredGroups,
          hasNextPage: response.hasNextPage,
          nextCursor: response.nextCursor ? { 
            eventSeq: response.nextCursor.eventSeq, 
            txDigest: response.nextCursor.txDigest 
          } : null,
          totalCount: filteredGroups.length,
        };
      } catch (error) {
        console.error("Error fetching all groups:", error);
        return {
          groups: [],
          hasNextPage: false,
          nextCursor: null,
          totalCount: 0,
        };
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch featured or recommended groups
 * Returns groups with available slots sorted by various criteria
 */
export function useFeaturedGroups(limit: number = 6) {
  const { data, isLoading, error } = useAllGroups(
    { hasAvailableSlots: true },
    null,
    limit
  );

  return {
    data: data?.groups || [],
    isLoading,
    error,
  };
}

/**
 * Hook to search groups by name
 */
export function useSearchGroups(searchQuery: string, limit: number = 20) {
  return useAllGroups(
    { searchQuery, hasAvailableSlots: true },
    null,
    limit
  );
}
