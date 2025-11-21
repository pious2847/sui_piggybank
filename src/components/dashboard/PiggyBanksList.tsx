import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "@radix-ui/themes";

interface PiggyBanksListProps {
  piggyBanks: any[];
}

export const PiggyBanksList = memo(function PiggyBanksList({ piggyBanks }: PiggyBanksListProps) {
  const navigate = useNavigate();

  if (piggyBanks.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-5xl mb-4">🐷</div>
        <Text className="text-slate-400">No piggy banks yet. Create one to start saving!</Text>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
          <span>🐷</span>
          My Piggy Banks
        </h2>
        <button
          onClick={() => navigate("/piggy-banks")}
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
        >
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {piggyBanks.slice(0, 3).map((bank, index) => (
          <button
            key={bank.data.objectId}
            onClick={() => navigate("/piggy-banks")}
            className="w-full group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">
                {['🐷', '🏦', '💰', '🪙', '💎', '🎯'][index % 6]}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-semibold">Bank #{index + 1}</p>
                <p className="text-slate-400 text-sm font-mono">
                  {bank.data.objectId.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-cyan-300 font-semibold text-sm">View Details</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {piggyBanks.length > 3 && (
        <button
          onClick={() => navigate("/piggy-banks")}
          className="w-full mt-4 py-3 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
        >
          + {piggyBanks.length - 3} more
        </button>
      )}
    </div>
  );
});
