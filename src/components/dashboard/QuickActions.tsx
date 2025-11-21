import { memo } from "react";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onCreatePiggyBank: () => void;
}

export const QuickActions = memo(function QuickActions({ onCreatePiggyBank }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl mb-8">
      <h2 className="text-2xl font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span>⚡</span>
        Quick Actions
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Deposit to Piggy Bank */}
        <button
          onClick={() => navigate("/piggy-banks")}
          className="group relative p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl hover:from-emerald-500/20 hover:to-teal-500/20 transition-all transform hover:scale-105"
        >
          <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110">
            💳
          </div>
          <h3 className="text-white font-semibold mb-1">Deposit</h3>
          <p className="text-slate-400 text-sm">Add funds to piggy bank</p>
        </button>

        {/* Create New Piggy Bank */}
        <button
          onClick={onCreatePiggyBank}
          className="group relative p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-2xl hover:from-violet-500/20 hover:to-purple-500/20 transition-all transform hover:scale-105"
        >
          <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110">
            🐷
          </div>
          <h3 className="text-white font-semibold mb-1">New Piggy Bank</h3>
          <p className="text-slate-400 text-sm">Create savings goal</p>
        </button>

        {/* Create New Group */}
        <button
          onClick={() => navigate("/explore")}
          className="group relative p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl hover:from-cyan-500/20 hover:to-blue-500/20 transition-all transform hover:scale-105"
        >
          <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-110">
            👥
          </div>
          <h3 className="text-white font-semibold mb-1">Join Group</h3>
          <p className="text-slate-400 text-sm">Explore group susu</p>
        </button>
      </div>
    </div>
  );
});
