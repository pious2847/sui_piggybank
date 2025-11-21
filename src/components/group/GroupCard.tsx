import { Link } from "react-router-dom";

export interface GroupCardProps {
  id: string;
  name: string;
  creator: string;
  contributionAmount: number;
  contributionFrequency: number;
  maxParticipants: number;
  participantCount: number;
  cycleComplete: boolean;
  createdAt: number;
}

export function GroupCard({
  id,
  name,
  contributionAmount,
  contributionFrequency,
  maxParticipants,
  participantCount,
  cycleComplete,
}: GroupCardProps) {
  const availableSlots = maxParticipants - participantCount;
  const isFull = availableSlots === 0;
  
  // Convert contribution amount from MIST to SUI (1 SUI = 1,000,000,000 MIST)
  const contributionInSui = contributionAmount / 1_000_000_000;
  
  // Convert frequency from milliseconds to days
  const frequencyInDays = Math.floor(contributionFrequency / (1000 * 60 * 60 * 24));
  
  return (
    <Link to={`/group/${id}`}>
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
        
        <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-cyan-500/50 hover:bg-white/[0.1] transform hover:-translate-y-2 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-200 mb-1 line-clamp-1">
                {name}
              </h3>
              {cycleComplete && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ Cycle Complete
                </span>
              )}
            </div>
            <div className="text-3xl ml-2">💰</div>
          </div>

          {/* Contribution Details */}
          <div className="space-y-3 mb-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Contribution</span>
              <span className="text-cyan-300 font-semibold">
                {contributionInSui.toFixed(2)} SUI
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Frequency</span>
              <span className="text-violet-300 font-semibold">
                Every {frequencyInDays} {frequencyInDays === 1 ? 'day' : 'days'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Participants</span>
              <span className="text-slate-200 font-semibold">
                {participantCount} / {maxParticipants}
              </span>
            </div>
          </div>

          {/* Availability Status */}
          <div className="pt-4 border-t border-white/10">
            {isFull ? (
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <span className="text-sm">🔒 Group Full</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 text-sm font-medium">
                  {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'} available
                </span>
                <span className="text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                  View Details →
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
