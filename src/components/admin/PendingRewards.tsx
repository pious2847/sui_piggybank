import { usePendingRewards } from "../../hooks/usePendingRewards";
import { LoadingSpinner } from "../../LoadingSpinner";
import { useState } from "react";

interface PendingRewardsProps {
  onSelectUser: (user: string, eligibleRewards: string[]) => void;
}

export function PendingRewards({ onSelectUser }: PendingRewardsProps) {
  const { data: pendingRewards, isLoading, error } = usePendingRewards();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSelectUser = (user: string, eligibleRewards: string[]) => {
    setSelectedUser(user);
    onSelectUser(user, eligibleRewards);
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
        <LoadingSpinner size="md" message="Loading eligible users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
        <p className="text-red-400">Failed to load pending rewards</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          Eligible Users
        </h3>
        <p className="text-sm text-slate-400">
          Users who have earned achievements and are eligible for NFT rewards
        </p>
      </div>

      {/* Manual User Entry for Testing */}
      <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <p className="text-blue-300 text-sm mb-2">💡 Manual Entry (for testing)</p>
        <input
          type="text"
          placeholder="Enter user address (0x...)"
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const address = (e.target as HTMLInputElement).value;
              if (address.startsWith('0x') && address.length === 66) {
                handleSelectUser(address, [
                  "Cycle Completion Champion",
                  "5 Cycles Milestone",
                  "10 Cycles Milestone",
                  "Perfect Attendance"
                ]);
                (e.target as HTMLInputElement).value = '';
              } else {
                alert('Please enter a valid Sui address (0x followed by 64 hex characters)');
              }
            }
          }}
        />
        <p className="text-slate-500 text-xs mt-1">Press Enter to select this address</p>
      </div>

      {!pendingRewards || pendingRewards.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-slate-400">No users eligible for rewards at this time</p>
          <p className="text-sm text-slate-500 mt-2">
            Users will appear here when they complete cycles or reach milestones
          </p>
          <p className="text-sm text-blue-400 mt-3">
            Use the manual entry above to mint NFTs for testing
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {pendingRewards.map((reward) => (
            <div
              key={reward.user}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedUser === reward.user
                  ? "bg-cyan-500/20 border-cyan-500/50"
                  : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
              }`}
              onClick={() => handleSelectUser(reward.user, reward.eligibleFor)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-slate-300">
                      {truncateAddress(reward.user)}
                    </span>
                    {selectedUser === reward.user && (
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/30 text-cyan-300 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>
                      🏆 {reward.reputationScore.toLocaleString()} points
                    </span>
                    <span>
                      ✅ {reward.cyclesCompleted} cycles
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 mb-2">Eligible for:</p>
                {reward.eligibleFor.map((achievement) => (
                  <div
                    key={achievement}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full" />
                    <span className="text-fuchsia-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingRewards && pendingRewards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-slate-500 text-center">
            {pendingRewards.length} user{pendingRewards.length !== 1 ? "s" : ""} eligible for rewards
          </p>
        </div>
      )}
    </div>
  );
}
