import { memo, useMemo } from "react";
import { Text } from "@radix-ui/themes";

interface Activity {
  id: string;
  type: "deposit" | "contribution" | "payout" | "create" | "join";
  title: string;
  description: string;
  timestamp: number;
  amount?: number;
  icon: string;
  color: string;
}

interface RecentActivityProps {
  piggyBanks: any[];
  groupMemberships: any[];
}

export const RecentActivity = memo(function RecentActivity({ 
  piggyBanks, 
  groupMemberships 
}: RecentActivityProps) {
  const activities = useMemo(() => {
    const items: Activity[] = [];

    // Add piggy bank creation activities
    piggyBanks.forEach((bank: any, index: number) => {
      const content = bank.data?.content;
      if (content && "fields" in content) {
        const fields = content.fields as any;
        const createdAt = Number(fields.created_at || Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const goalAmount = Number(fields.goal_amount || 0);
        
        items.push({
          id: `create-${bank.data.objectId}`,
          type: "create",
          title: `Created Bank #${index + 1}`,
          description: `Goal: ${(goalAmount / 1_000_000_000).toFixed(2)} SUI`,
          timestamp: createdAt,
          amount: goalAmount,
          icon: "🐷",
          color: "violet",
        });

        // Add mock deposit activity
        const balance = Number(fields.balance || 0);
        if (balance > 0) {
          items.push({
            id: `deposit-${bank.data.objectId}`,
            type: "deposit",
            title: `Deposited to Bank #${index + 1}`,
            description: `Added ${(balance / 1_000_000_000).toFixed(2)} SUI`,
            timestamp: createdAt + Math.random() * 2 * 24 * 60 * 60 * 1000,
            amount: balance,
            icon: "💰",
            color: "emerald",
          });
        }
      }
    });

    // Add group membership activities
    groupMemberships.forEach((group: any) => {
      items.push({
        id: `join-${group.id}`,
        type: "join",
        title: `Joined ${group.name}`,
        description: `Position #${group.userPosition + 1} in rotation`,
        timestamp: group.createdAt,
        icon: "👥",
        color: "cyan",
      });

      // Add mock contribution activity
      if (group.currentRound > 0) {
        items.push({
          id: `contribution-${group.id}`,
          type: "contribution",
          title: `Contributed to ${group.name}`,
          description: `${(group.contributionAmount / 1_000_000_000).toFixed(2)} SUI for Round ${group.currentRound}`,
          timestamp: group.createdAt + group.currentRound * group.contributionFrequency,
          amount: group.contributionAmount,
          icon: "💳",
          color: "blue",
        });
      }
    });

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [piggyBanks, groupMemberships]);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-300" },
      violet: { bg: "bg-violet-500/20", border: "border-violet-500/30", text: "text-violet-300" },
      cyan: { bg: "bg-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-300" },
      blue: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-300" },
    };
    return colors[color] || colors.cyan;
  };

  if (activities.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-5xl mb-4">📋</div>
        <Text className="text-slate-400">No recent activity</Text>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center gap-2">
          <span>📋</span>
          Recent Activity
        </h2>
        <Text className="text-slate-400 text-sm">
          Your latest transactions and actions
        </Text>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {activities.map((activity) => {
          const colorClasses = getColorClasses(activity.color);
          return (
            <div
              key={activity.id}
              className="relative p-4 bg-white/5 border border-white/10 rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold mb-1">{activity.title}</p>
                  <p className="text-slate-400 text-sm mb-2">{activity.description}</p>
                  <span className={`px-2 py-1 ${colorClasses.bg} border ${colorClasses.border} rounded-lg ${colorClasses.text} text-xs font-medium`}>
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
