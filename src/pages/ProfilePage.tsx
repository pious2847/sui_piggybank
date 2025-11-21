import { useCurrentAccount } from "@mysten/dapp-kit";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Share2, Copy, Check, User, ExternalLink, Loader2 } from "lucide-react";
import { ReputationScore } from "../components/reputation/ReputationScore";
import { ReputationHistory, ReputationHistoryEvent } from "../components/reputation/ReputationHistory";
import { AchievementBadges } from "../components/reputation/AchievementBadges";
import { NFTGallery } from "../components/nft/NFTGallery";
import { ContributionHistory } from "../components/profile/ContributionHistory";
import { useReputationProfile, useReputationEvents, getEventTypeString } from "../hooks/useReputationProfile";
import { useUserNFTs } from "../hooks/useUserNFTs";
import { useCreateReputationProfile } from "../hooks/useCreateReputationProfile";
import { copyProfileLink, shareProfileLink } from "../utils/profileLinks";

/**
 * ProfilePage Component
 * 
 * Displays user reputation, achievements, and NFT rewards.
 * Supports both personal profile view and public shareable profiles.
 * 
 * Routes:
 * - /profile - Shows the current user's profile (requires wallet connection)
 * - /profile/:address - Shows a public profile for any Sui address
 * 
 * Features:
 * - Shareable profile links that can be copied or shared via Web Share API
 * - Public reputation and NFT data display for any user
 * - Reputation score with level indicators
 * - Achievement badges based on milestones
 * - NFT gallery with Walrus-stored assets
 * - Reputation history timeline
 */
export function ProfilePage() {
  const currentAccount = useCurrentAccount();
  const { address: urlAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const createProfile = useCreateReputationProfile();

  // Determine which address to display
  // If URL has an address, show that profile (public view)
  // Otherwise, show current user's profile
  const profileAddress = urlAddress || currentAccount?.address;
  const isOwnProfile = !urlAddress || urlAddress === currentAccount?.address;

  // Fetch reputation data
  const { data: reputationProfile, isLoading: reputationLoading } = useReputationProfile(profileAddress);
  const { data: reputationEvents, isLoading: eventsLoading } = useReputationEvents(profileAddress);
  const { data: nfts, isLoading: nftsLoading } = useUserNFTs(profileAddress);

  // If viewing own profile but not connected, redirect to home
  useEffect(() => {
    if (isOwnProfile && !currentAccount) {
      navigate("/");
    }
  }, [isOwnProfile, currentAccount, navigate]);

  // Don't render if redirecting
  if (isOwnProfile && !currentAccount) {
    return null;
  }

  const handleCopyLink = async () => {
    if (profileAddress) {
      try {
        await copyProfileLink(profileAddress);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        console.error("Failed to copy link:", error);
      }
    }
  };

  const handleShare = async () => {
    if (profileAddress) {
      try {
        await shareProfileLink(profileAddress);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        console.error("Failed to share:", error);
      }
    }
  };

  const handleCreateProfile = async () => {
    if (!profileAddress) return;
    
    setIsCreatingProfile(true);
    try {
      await createProfile.mutateAsync();
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Convert reputation events to history format
  const historyEvents: ReputationHistoryEvent[] = reputationEvents?.map(event => ({
    points: event.pointsEarned,
    eventType: getEventTypeString(event.eventType),
    timestamp: event.timestamp,
  })) || [];

  // Loading state
  if (reputationLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // No profile found
  if (!reputationProfile) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
            {isOwnProfile ? "My Profile" : "User Profile"}
          </h1>
          <p className="text-slate-400">
            {isOwnProfile 
              ? "View your reputation, achievements, and NFT rewards"
              : `Viewing profile for ${profileAddress?.slice(0, 6)}...${profileAddress?.slice(-4)}`
            }
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-12 text-center">
            <div className="text-7xl mb-4">👤</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Reputation Profile Found
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              {isOwnProfile 
                ? "You haven't created a reputation profile yet. Create one to track your achievements and reputation!"
                : "This user hasn't created a reputation profile yet."
              }
            </p>
            {isOwnProfile && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleCreateProfile}
                  disabled={isCreatingProfile}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingProfile ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <span>Create Reputation Profile</span>
                  )}
                </button>
                <button
                  onClick={() => navigate("/explore")}
                  className="px-6 py-3 rounded-xl bg-white/[0.07] border border-white/10 text-white font-semibold hover:bg-white/[0.1] transition-all"
                >
                  Explore Groups
                </button>
              </div>
            )}
          </div>

          {/* Show NFTs even without reputation profile */}
          {nfts && nfts.length > 0 && (
            <NFTGallery nfts={nfts} isLoading={nftsLoading} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                {isOwnProfile ? "My Profile" : "User Profile"}
              </h1>
              <div className="flex items-center gap-2 text-slate-400 flex-wrap">
                <span className="font-mono text-xs sm:text-sm break-all">
                  {profileAddress?.slice(0, 8)}...{profileAddress?.slice(-6)}
                </span>
                <a
                  href={`https://suiscan.xyz/testnet/account/${profileAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                  aria-label="View on Suiscan"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Share Button or Public Profile Badge */}
          {isOwnProfile ? (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.07] border border-white/10 text-slate-300 hover:bg-white/[0.1] hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                title="Copy profile link"
                aria-label="Copy profile link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span className="font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span className="font-medium hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                aria-label="Share profile"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>Share</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 w-fit">
              <User className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-medium">Public Profile</span>
            </div>
          )}
        </div>
        <p className="text-slate-400 text-sm sm:text-base">
          {isOwnProfile 
            ? "View your reputation, achievements, and NFT rewards"
            : "Public reputation and achievement data"
          }
        </p>
      </div>

      {/* Profile Content */}
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Reputation Score */}
        <ReputationScore
          score={reputationProfile.reputationScore}
          cyclesCompleted={reputationProfile.cyclesCompleted}
          totalContributions={reputationProfile.totalContributions}
          onTimeContributions={reputationProfile.onTimeContributions}
          lateContributions={reputationProfile.lateContributions}
        />

        {/* Achievement Badges */}
        <AchievementBadges
          cyclesCompleted={reputationProfile.cyclesCompleted}
          onTimeContributions={reputationProfile.onTimeContributions}
          lateContributions={reputationProfile.lateContributions}
          reputationScore={reputationProfile.reputationScore}
        />

        {/* NFT Gallery */}
        <NFTGallery nfts={nfts || []} isLoading={nftsLoading} />

        {/* Encrypted Contribution History - Only show for own profile */}
        {isOwnProfile && (
          <ContributionHistory 
            encryptedData={reputationProfile.encryptedData}
          />
        )}

        {/* Reputation History */}
        {!eventsLoading && historyEvents.length > 0 && (
          <ReputationHistory events={historyEvents} />
        )}
      </div>
    </div>
  );
}
