import { memo } from "react";
import { Text, Heading } from "@radix-ui/themes";

interface StatsOverviewProps {
  totalSavings: number;
  totalPiggyBanks: number;
  totalGroupMemberships: number;
  activeGroups: number;
}

export const StatsOverview = memo(function StatsOverview({
  totalSavings,
  totalPiggyBanks,
  totalGroupMemberships,
  activeGroups,
}: StatsOverviewProps) {
  const formatSUI = (amount: number) => {
    return (amount / 1_000_000_000).toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8">
      {/* Total Savings */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-emerald-500/50 transform hover:-translate-y-1">
          <div className="text-center">
            <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              💰
            </div>
            <Text size="2" className="text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2 block">
              Total Savings
            </Text>
            <Heading size="7" className="text-white font-bold text-2xl">
              {formatSUI(totalSavings)} SUI
            </Heading>
          </div>
        </div>
      </div>

      {/* Piggy Banks */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-violet-500/50 transform hover:-translate-y-1">
          <div className="text-center">
            <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              🐷
            </div>
            <Text size="2" className="text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2 block">
              Piggy Banks
            </Text>
            <Heading size="7" className="text-white font-bold text-2xl">
              {totalPiggyBanks}
            </Heading>
          </div>
        </div>
      </div>

      {/* Group Memberships */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-cyan-500/50 transform hover:-translate-y-1">
          <div className="text-center">
            <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              👥
            </div>
            <Text size="2" className="text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2 block">
              Group Memberships
            </Text>
            <Heading size="7" className="text-white font-bold text-2xl">
              {totalGroupMemberships}
            </Heading>
          </div>
        </div>
      </div>

      {/* Active Groups */}
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-fuchsia-500/50 transform hover:-translate-y-1">
          <div className="text-center">
            <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
              🎯
            </div>
            <Text size="2" className="text-slate-400 uppercase tracking-wider text-xs font-semibold mb-2 block">
              Active Groups
            </Text>
            <Heading size="7" className="text-white font-bold text-2xl">
              {activeGroups}
            </Heading>
          </div>
        </div>
      </div>
    </div>
  );
});
