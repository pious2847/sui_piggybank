import { Trophy, Star, Zap, Target, Lock } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  cyclesCompleted: number;
  onTimeContributions: number;
  lateContributions: number;
  reputationScore: number;
}

export function AchievementBadges({
  cyclesCompleted,
  onTimeContributions,
  lateContributions,
  reputationScore,
}: AchievementBadgesProps) {
  // Define achievement badges with unlock conditions
  const badges: Badge[] = [
    {
      id: "first-cycle",
      name: "First Cycle",
      description: "Complete your first group susu cycle",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-cyan-400 to-blue-500",
      unlocked: cyclesCompleted >= 1,
      progress: Math.min(cyclesCompleted, 1),
      maxProgress: 1,
    },
    {
      id: "5-cycles",
      name: "5 Cycles Milestone",
      description: "Complete 5 group susu cycles",
      icon: <Star className="w-6 h-6" />,
      color: "from-violet-400 to-purple-500",
      unlocked: cyclesCompleted >= 5,
      progress: Math.min(cyclesCompleted, 5),
      maxProgress: 5,
    },
    {
      id: "10-cycles",
      name: "10 Cycles Milestone",
      description: "Complete 10 group susu cycles",
      icon: <Zap className="w-6 h-6" />,
      color: "from-yellow-400 to-orange-500",
      unlocked: cyclesCompleted >= 10,
      progress: Math.min(cyclesCompleted, 10),
      maxProgress: 10,
    },
    {
      id: "perfect-attendance",
      name: "Perfect Attendance",
      description: "Make 10+ on-time contributions with no late payments",
      icon: <Target className="w-6 h-6" />,
      color: "from-emerald-400 to-green-500",
      unlocked: onTimeContributions >= 10 && lateContributions === 0,
      progress: Math.min(onTimeContributions, 10),
      maxProgress: 10,
    },
    {
      id: "reputation-master",
      name: "Reputation Master",
      description: "Reach 1000 reputation points",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-pink-400 to-rose-500",
      unlocked: reputationScore >= 1000,
      progress: Math.min(reputationScore, 1000),
      maxProgress: 1000,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Achievement Badges</h3>
            <p className="text-slate-400 text-sm">
              {unlockedCount} of {badges.length} unlocked
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{unlockedCount}/{badges.length}</div>
          <div className="text-xs text-slate-400">Completed</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 transition-all duration-500"
            style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative backdrop-blur-xl border rounded-2xl p-5 transition-all ${
              badge.unlocked
                ? "bg-white/[0.08] border-white/20 hover:bg-white/[0.12]"
                : "bg-white/[0.03] border-white/5 opacity-60"
            }`}
          >
            {/* Badge Icon */}
            <div className="flex items-start gap-4 mb-3">
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                  badge.unlocked
                    ? `bg-gradient-to-br ${badge.color} shadow-lg`
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                {badge.unlocked ? badge.icon : <Lock className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white mb-1 truncate">
                  {badge.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Progress Bar (for locked badges) */}
            {!badge.unlocked && badge.progress !== undefined && badge.maxProgress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>
                    {badge.progress}/{badge.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${badge.color} transition-all duration-500`}
                    style={{
                      width: `${(badge.progress / badge.maxProgress) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Unlocked Badge */}
            {badge.unlocked && (
              <div className="absolute top-3 right-3">
                <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${badge.color} text-xs font-semibold text-white`}>
                  ✓ Unlocked
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
