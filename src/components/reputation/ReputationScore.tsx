import { Trophy, TrendingUp, Award } from "lucide-react";

interface ReputationScoreProps {
  score: number;
  cyclesCompleted: number;
  totalContributions: number;
  onTimeContributions: number;
  lateContributions: number;
}

export function ReputationScore({
  score,
  cyclesCompleted,
  totalContributions,
  onTimeContributions,
  lateContributions,
}: ReputationScoreProps) {
  // Calculate on-time percentage
  const onTimePercentage = totalContributions > 0 
    ? Math.round((onTimeContributions / totalContributions) * 100) 
    : 0;

  // Determine reputation level based on score
  const getReputationLevel = (score: number) => {
    if (score >= 1000) return { level: "Elite", color: "from-yellow-400 to-orange-500" };
    if (score >= 500) return { level: "Expert", color: "from-purple-400 to-pink-500" };
    if (score >= 250) return { level: "Advanced", color: "from-blue-400 to-cyan-500" };
    if (score >= 100) return { level: "Intermediate", color: "from-green-400 to-emerald-500" };
    return { level: "Beginner", color: "from-slate-400 to-slate-500" };
  };

  const { level, color } = getReputationLevel(score);

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} bg-opacity-20`}>
          <Trophy className={`w-6 h-6 text-transparent bg-gradient-to-br ${color} bg-clip-text`} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Reputation Score</h3>
          <p className="text-slate-400 text-sm">Your platform standing</p>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-8">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-6xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
            {score}
          </span>
          <span className="text-slate-400 text-lg">points</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${color} bg-opacity-20`}>
          <Award className="w-4 h-4" />
          <span className="font-semibold">{level}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cycles Completed */}
        <div className="backdrop-blur-xl bg-white/[0.05] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <TrendingUp className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-slate-400 text-sm">Cycles</span>
          </div>
          <p className="text-3xl font-bold text-white">{cyclesCompleted}</p>
        </div>

        {/* Total Contributions */}
        <div className="backdrop-blur-xl bg-white/[0.05] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Trophy className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-slate-400 text-sm">Contributions</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalContributions}</p>
        </div>

        {/* On-Time Rate */}
        <div className="backdrop-blur-xl bg-white/[0.05] border border-white/5 rounded-2xl p-4 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">On-Time Rate</span>
            <span className="text-emerald-400 font-semibold">{onTimePercentage}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
              style={{ width: `${onTimePercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{onTimeContributions} on-time</span>
            <span>{lateContributions} late</span>
          </div>
        </div>
      </div>
    </div>
  );
}
