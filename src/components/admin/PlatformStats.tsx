import { usePlatformStats } from "../../hooks/usePlatformStats";
import { LoadingSpinner } from "../../LoadingSpinner";

export function PlatformStats() {
  const { data: stats, isLoading, error } = usePlatformStats();

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8">
        <LoadingSpinner size="md" message="Loading platform statistics..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8">
        <p className="text-red-400">Failed to load platform statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: "👥",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      label: "Active Groups",
      value: stats.activeGroups.toLocaleString(),
      icon: "🔄",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Completed Cycles",
      value: stats.completedCycles.toLocaleString(),
      icon: "✅",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "NFTs Minted",
      value: stats.totalNFTsMinted.toLocaleString(),
      icon: "🎨",
      gradient: "from-fuchsia-500 to-pink-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Platform Statistics
        </h2>
        <p className="text-slate-400">
          Overview of platform activity and user engagement
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="group relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.1] transition-all duration-300"
          >
            <div className={`absolute -inset-1 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
            
            <div className="relative">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Health Metrics */}
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">
          System Health
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Blockchain Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">Operational</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Recent Transactions (24h)</span>
            <span className="text-white font-medium">
              {stats.recentTransactions.toLocaleString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Average Response Time</span>
            <span className="text-white font-medium">~2.3s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
