import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../../networkConfig";
import { LoadingSpinner } from "../../LoadingSpinner";

interface ActivityEvent {
  type: "contribution" | "cycle_complete" | "nft_minted" | "group_created";
  user: string;
  timestamp: number;
  details: string;
}

export function RecentActivity() {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recentActivity", counterPackageId],
    queryFn: async () => {
      if (!counterPackageId) return [];

      try {
        const events: ActivityEvent[] = [];

        // Fetch reputation events
        const reputationEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::reputation::ReputationEvent`,
          },
          limit: 10,
          order: "descending",
        });

        reputationEvents.data.forEach((event) => {
          const parsedJson = event.parsedJson as any;
          const eventType = Number(parsedJson?.event_type);
          
          let type: ActivityEvent["type"] = "contribution";
          let details = "";
          
          if (eventType === 1) {
            type = "contribution";
            details = `Earned ${parsedJson.points_earned} reputation points`;
          } else if (eventType === 2) {
            type = "cycle_complete";
            details = `Completed a cycle (+${parsedJson.points_earned} points)`;
          }

          events.push({
            type,
            user: parsedJson.user,
            timestamp: Number(parsedJson.timestamp),
            details,
          });
        });

        // Fetch NFT minting events
        const nftEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::nft_rewards::NFTMintedEvent`,
          },
          limit: 10,
          order: "descending",
        });

        nftEvents.data.forEach((event) => {
          const parsedJson = event.parsedJson as any;
          
          events.push({
            type: "nft_minted",
            user: parsedJson.recipient,
            timestamp: Number(parsedJson.earned_at),
            details: `Received "${parsedJson.name}" NFT`,
          });
        });

        // Sort by timestamp (most recent first)
        events.sort((a, b) => b.timestamp - a.timestamp);

        return events.slice(0, 15);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        return [];
      }
    },
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getEventIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "contribution":
        return "💰";
      case "cycle_complete":
        return "✅";
      case "nft_minted":
        return "🎨";
      case "group_created":
        return "🆕";
      default:
        return "📝";
    }
  };

  const getEventColor = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "contribution":
        return "text-cyan-400";
      case "cycle_complete":
        return "text-emerald-400";
      case "nft_minted":
        return "text-fuchsia-400";
      case "group_created":
        return "text-violet-400";
      default:
        return "text-slate-400";
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
        <LoadingSpinner size="md" message="Loading recent activity..." />
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-300">
          Recent Activity
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-400">Live</span>
        </div>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-slate-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
          {activities.map((activity, index) => (
            <div
              key={`${activity.user}-${activity.timestamp}-${index}`}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <div className="text-2xl flex-shrink-0">
                {getEventIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-slate-400">
                    {truncateAddress(activity.user)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                <p className={`text-sm ${getEventColor(activity.type)}`}>
                  {activity.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
