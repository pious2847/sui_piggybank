import { memo, useMemo } from "react";
import { Text } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

interface Milestone {
  id: string;
  type: "piggybank" | "group";
  title: string;
  description: string;
  date: number;
  amount?: number;
  icon: string;
}

interface UpcomingMilestonesProps {
  piggyBanks: any[];
  groupMemberships: any[];
}

export const UpcomingMilestones = memo(function UpcomingMilestones({ 
  piggyBanks, 
  groupMemberships 
}: UpcomingMilestonesProps) {
  const navigate = useNavigate();

  const milestones = useMemo(() => {
    const items: Milestone[] = [];

    // Add piggy bank unlock dates
    piggyBanks.forEach((bank: any, index: number) => {
      const content = bank.data?.content;
      if (content && "fields" in content) {
        const fields = content.fields as any;
        const unlockDate = Number(fields.unlock_timestamp_ms || 0);
        const goalAmount = Number(fields.goal_amount || 0);
        
        if (unlockDate > Date.now()) {
          items.push({
            id: bank.data.objectId,
            type: "piggybank",
            title: `Bank #${index + 1} Unlocks`,
            description: `Goal: ${(goalAmount / 1_000_000_000).toFixed(2)} SUI`,
            date: unlockDate,
            amount: goalAmount,
            icon: "🐷",
          });
        }
      }
    });

    // Add group payout dates
    groupMemberships.forEach((group: any) => {
      if (!group.cycleComplete) {
        // Calculate when user will receive payout
        const roundsUntilPayout = (group.userPosition - group.currentRound + group.maxParticipants) % group.maxParticipants;
        const payoutDate = group.createdAt + (group.currentRound + roundsUntilPayout) * group.contributionFrequency;
        
        if (payoutDate > Date.now()) {
          items.push({
            id: group.id,
            type: "group",
            title: `${group.name} Payout`,
            description: `Position #${group.userPosition + 1} receives ${(group.contributionAmount * group.participantCount / 1_000_000_000).toFixed(2)} SUI`,
            date: payoutDate,
            amount: group.contributionAmount * group.participantCount,
            icon: "👥",
          });
        }
      }
    });

    // Sort by date
    return items.sort((a, b) => a.date - b.date).slice(0, 5);
  }, [piggyBanks, groupMemberships]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = timestamp - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `In ${days} days`;
    if (days < 30) return `In ${Math.ceil(days / 7)} weeks`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleMilestoneClick = (milestone: Milestone) => {
    if (milestone.type === "piggybank") {
      navigate("/piggy-banks");
    } else {
      navigate(`/group/${milestone.id}/manage`);
    }
  };

  if (milestones.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-5xl mb-4">🎯</div>
        <Text className="text-slate-400">No upcoming milestones</Text>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center gap-2">
          <span>🎯</span>
          Upcoming Milestones
        </h2>
        <Text className="text-slate-400 text-sm">
          Important dates and unlock events
        </Text>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone) => (
          <button
            key={milestone.id}
            onClick={() => handleMilestoneClick(milestone)}
            className="w-full group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{milestone.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold mb-1">{milestone.title}</p>
                <p className="text-slate-400 text-sm mb-2">{milestone.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs font-medium">
                    {formatDate(milestone.date)}
                  </span>
                  {milestone.type === "piggybank" && (
                    <span className="px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-300 text-xs font-medium">
                      Unlock
                    </span>
                  )}
                  {milestone.type === "group" && (
                    <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium">
                      Payout
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
