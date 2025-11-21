import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAdminCap } from "../hooks/useAdminCap";
import { PlatformStats } from "../components/admin/PlatformStats";
import { RecentActivity } from "../components/admin/RecentActivity";
import { PendingRewards } from "../components/admin/PendingRewards";
import { MintNFTForm } from "../components/admin/MintNFTForm";
import { PlatformConfigForm } from "../components/admin/PlatformConfigForm";
import { TransferAdminForm } from "../components/admin/TransferAdminForm";
import { LoadingSpinner } from "../LoadingSpinner";
import { useQueryClient } from "@tanstack/react-query";

export function AdminDashboard() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: adminCap, isLoading: isLoadingAdminCap } = useAdminCap(currentAccount?.address);
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [eligibleRewards, setEligibleRewards] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "nft" | "config" | "transfer">("overview");

  const handleSelectUser = (user: string, rewards: string[]) => {
    setSelectedUser(user);
    setEligibleRewards(rewards);
  };

  const handleMintSuccess = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["pendingRewards"] });
    queryClient.invalidateQueries({ queryKey: ["platformStats"] });
    queryClient.invalidateQueries({ queryKey: ["recentActivity"] });
    
    // Reset selection
    setSelectedUser(null);
    setEligibleRewards([]);
  };

  useEffect(() => {
    if (!currentAccount) {
      navigate("/");
    }
  }, [currentAccount, navigate]);

  // Show loading state while checking for AdminCap
  if (isLoadingAdminCap) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" message="Verifying admin access..." />
        </div>
      </div>
    );
  }

  // Access denied if user doesn't have AdminCap
  if (!adminCap) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="backdrop-blur-xl bg-white/[0.07] border border-red-500/30 rounded-3xl p-12 max-w-md">
            <div className="text-6xl mb-6">🚫</div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">
              Access Denied
            </h2>
            <p className="text-slate-400 mb-6">
              You don't have permission to access the admin dashboard. 
              This area is restricted to platform administrators only.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="text-3xl sm:text-4xl" aria-hidden="true">👑</div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-slate-400 text-sm sm:text-base">
          Manage platform, mint NFT rewards, and monitor activity
        </p>
        
        {/* Admin Badge */}
        <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30 rounded-full">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true" />
          <span className="text-xs sm:text-sm text-cyan-300 font-medium">
            Admin Access Verified
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "overview"
              ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab("nft")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "nft"
              ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          🎨 NFT Rewards
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "config"
              ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          ⚙️ Configuration
        </button>
        <button
          onClick={() => setActiveTab("transfer")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === "transfer"
              ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
              : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
          }`}
        >
          🔐 Transfer Admin
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Platform Stats (spans 2 columns on large screens) */}
            <div className="lg:col-span-2">
              <PlatformStats />
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-1">
              <RecentActivity />
            </div>
          </div>
        </>
      )}

      {activeTab === "nft" && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl" aria-hidden="true">🎨</div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                NFT Reward Management
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Mint and distribute achievement NFTs to eligible users
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Pending Rewards List */}
            <PendingRewards onSelectUser={handleSelectUser} />

            {/* Mint NFT Form */}
            <MintNFTForm
              selectedUser={selectedUser}
              eligibleRewards={eligibleRewards}
              adminCapId={adminCap?.id || ""}
              onSuccess={handleMintSuccess}
            />
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="max-w-3xl mx-auto">
          <PlatformConfigForm adminCapId={adminCap?.id || ""} />
        </div>
      )}

      {activeTab === "transfer" && (
        <div className="max-w-3xl mx-auto">
          <TransferAdminForm adminCapId={adminCap?.id || ""} />
        </div>
      )}
    </div>
  );
}
