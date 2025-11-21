import { Clock, TrendingUp, Award, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ReputationHistoryEvent {
  points: number;
  eventType: "contribution" | "cycle_complete" | "milestone";
  timestamp: number;
  description?: string;
}

interface ReputationHistoryProps {
  events: ReputationHistoryEvent[];
}

export function ReputationHistory({ events }: ReputationHistoryProps) {
  // Sort events by timestamp (most recent first)
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "contribution":
        return <CheckCircle className="w-5 h-5 text-cyan-400" />;
      case "cycle_complete":
        return <TrendingUp className="w-5 h-5 text-violet-400" />;
      case "milestone":
        return <Award className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "contribution":
        return "from-cyan-500/20 to-blue-500/20";
      case "cycle_complete":
        return "from-violet-500/20 to-purple-500/20";
      case "milestone":
        return "from-yellow-500/20 to-orange-500/20";
      default:
        return "from-slate-500/20 to-slate-600/20";
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case "contribution":
        return "Contribution Made";
      case "cycle_complete":
        return "Cycle Completed";
      case "milestone":
        return "Milestone Reached";
      default:
        return "Event";
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-500/20 to-slate-600/20">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Reputation History</h3>
            <p className="text-slate-400 text-sm">Track your earned points</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-400">No reputation events yet</p>
          <p className="text-slate-500 text-sm mt-2">
            Start participating in group susu to earn points
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
          <Clock className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Reputation History</h3>
          <p className="text-slate-400 text-sm">Track your earned points</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedEvents.map((event, index) => (
          <div
            key={`${event.timestamp}-${index}`}
            className="relative flex gap-4 group"
          >
            {/* Timeline line */}
            {index < sortedEvents.length - 1 && (
              <div className="absolute left-[22px] top-12 w-0.5 h-full bg-gradient-to-b from-white/10 to-transparent" />
            )}

            {/* Icon */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${getEventColor(event.eventType)} flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform`}>
              {getEventIcon(event.eventType)}
            </div>

            {/* Content */}
            <div className="flex-1 backdrop-blur-xl bg-white/[0.05] border border-white/5 rounded-2xl p-4 group-hover:bg-white/[0.08] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white">
                    {getEventTitle(event.eventType)}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-slate-400 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <span className="text-emerald-400 font-bold">+{event.points}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
