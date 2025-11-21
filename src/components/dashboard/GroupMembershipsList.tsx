import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "@radix-ui/themes";
import { GroupSusuMembership } from "../../hooks/useUserGroups";

interface GroupMembershipsListProps {
  groups: GroupSusuMembership[];
}

export const GroupMembershipsList = memo(function GroupMembershipsList({ groups }: GroupMembershipsListProps) {
  const navigate = useNavigate();

  const formatSUI = (amount: number) => {
    return (amount / 1_000_000_000).toFixed(2);
  };

  if (groups.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-5xl mb-4">👥</div>
        <Text className="text-slate-400 mb-4 block">No group memberships yet.</Text>
        <button
          onClick={() => navigate("/explore")}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 rounded-xl font-semibold transition-all transform hover:scale-105"
        >
          Explore Groups
        </button>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <span>👥</span>
          Group Memberships
        </h2>
        <button
          onClick={() => navigate("/explore")}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
        >
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {groups.slice(0, 3).map((group) => (
          <button
            key={group.id}
            onClick={() => navigate(`/group/${group.id}/manage`)}
            className="w-full group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-left">
                <p className="text-white font-semibold mb-1">{group.name}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{formatSUI(group.contributionAmount)} SUI/round</span>
                  <span>•</span>
                  <span>Position #{group.userPosition + 1}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-cyan-300 font-semibold text-sm mb-1">
                  Round {group.currentRound + 1}/{group.totalRounds}
                </p>
                <p className="text-slate-400 text-xs">
                  {group.participantCount}/{group.maxParticipants} members
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {groups.length > 3 && (
        <button
          onClick={() => navigate("/explore")}
          className="w-full mt-4 py-3 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
        >
          + {groups.length - 3} more
        </button>
      )}
    </div>
  );
});
