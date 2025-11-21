import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CreateGroupForm } from "../components/group/CreateGroupForm";
import { ArrowLeft } from "lucide-react";

export function CreateGroupPage() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentAccount) {
      navigate("/");
    }
  }, [currentAccount, navigate]);

  const handleSuccess = () => {
    // Navigate to explore page after successful creation
    setTimeout(() => {
      navigate("/explore");
    }, 2000);
  };

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl">
      {/* Back Button */}
      <button
        onClick={() => navigate("/explore")}
        className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Explore</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Create New Group
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Start a new savings group and invite participants to join
        </p>
      </div>

      {/* Info Card */}
      <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-xl">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3">How it works</h3>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Set the contribution amount and frequency for your group</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Define the maximum number of participants</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>Each round, one participant receives the total pool</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-1">•</span>
            <span>The cycle continues until everyone has received their payout</span>
          </li>
        </ul>
      </div>

      {/* Create Group Form */}
      <div className="backdrop-blur-xl bg-slate-950/40 border border-white/10 rounded-2xl p-6 sm:p-8">
        <CreateGroupForm onSuccess={handleSuccess} />
      </div>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <p className="text-yellow-300 text-sm">
          <strong>Note:</strong> As the creator, you'll be the first participant in the group. 
          Share the group link with others to invite them to join.
        </p>
      </div>
    </div>
  );
}
