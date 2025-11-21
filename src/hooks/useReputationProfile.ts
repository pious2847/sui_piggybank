import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { 
  reputationQueryConfig, 
  getReputationProfileQueryKey, 
  getReputationEventsQueryKey 
} from "../queryConfig";

export interface ReputationProfile {
  id: string;
  owner: string;
  reputationScore: number;
  cyclesCompleted: number;
  totalContributions: number;
  onTimeContributions: number;
  lateContributions: number;
  createdAt: number;
  encryptedData: number[];
}

export interface ReputationEvent {
  user: string;
  pointsEarned: number;
  eventType: number;
  timestamp: number;
}

/**
 * Hook to fetch a user's reputation profile
 * Returns null if the user doesn't have a reputation profile yet
 */
export function useReputationProfile(address: string | undefined) {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: getReputationProfileQueryKey(address || "", counterPackageId),
    queryFn: async () => {
      if (!address || !counterPackageId) return null;

      try {
        // Query for ReputationProfile objects owned by the user
        const { data } = await suiClient.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${counterPackageId}::reputation::ReputationProfile`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        if (data.length === 0) {
          return null;
        }

        // Get the first (and should be only) reputation profile
        const profileObject = data[0];
        const content = profileObject.data?.content;

        if (content && "fields" in content) {
          const fields = content.fields as any;
          
          return {
            id: profileObject.data?.objectId || "",
            owner: fields.owner || address,
            reputationScore: Number(fields.reputation_score || 0),
            cyclesCompleted: Number(fields.cycles_completed || 0),
            totalContributions: Number(fields.total_contributions || 0),
            onTimeContributions: Number(fields.on_time_contributions || 0),
            lateContributions: Number(fields.late_contributions || 0),
            createdAt: Number(fields.created_at || 0),
            encryptedData: fields.encrypted_data || [],
          } as ReputationProfile;
        }

        return null;
      } catch (error) {
        console.error("Error fetching reputation profile:", error);
        return null;
      }
    },
    enabled: !!address,
    ...reputationQueryConfig,
  });
}

/**
 * Hook to fetch reputation events for a user
 * This queries blockchain events to build a reputation history
 */
export function useReputationEvents(address: string | undefined) {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: getReputationEventsQueryKey(address || "", counterPackageId),
    queryFn: async () => {
      if (!address || !counterPackageId) return [];

      try {
        // Query for ReputationEvent events
        const events = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::reputation::ReputationEvent`,
          },
          limit: 50,
          order: "descending",
        });

        // Filter events for this specific user
        const userEvents = events.data
          .filter((event) => {
            const parsedJson = event.parsedJson as any;
            return parsedJson?.user === address;
          })
          .map((event) => {
            const parsedJson = event.parsedJson as any;
            return {
              user: parsedJson.user,
              pointsEarned: Number(parsedJson.points_earned),
              eventType: Number(parsedJson.event_type),
              timestamp: Number(parsedJson.timestamp),
            } as ReputationEvent;
          });

        return userEvents;
      } catch (error) {
        console.error("Error fetching reputation events:", error);
        return [];
      }
    },
    enabled: !!address,
    ...reputationQueryConfig,
  });
}

/**
 * Helper function to convert event type number to string
 */
export function getEventTypeString(eventType: number): "contribution" | "cycle_complete" | "milestone" {
  switch (eventType) {
    case 1:
      return "contribution";
    case 2:
      return "cycle_complete";
    case 3:
      return "milestone";
    default:
      return "contribution";
  }
}
