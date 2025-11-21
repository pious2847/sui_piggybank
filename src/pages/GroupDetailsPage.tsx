import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGroupSusu, useGroupParticipants } from "../hooks/useGroupSusu";
import { LoadingSpinner } from "../LoadingSpinner";
import { joinGroupTx } from "../utils/transactions";
import { DEVNET_COUNTER_PACKAGE_ID } from "../constants";
import { useQueryClient } from "@tanstack/react-query";

interface Participant {
  address: string;
  contributionsMade: number;
  hasReceivedPayout: boolean;
  joinTimestamp: number;
  position: number;
}

interface GroupDetails {
  id: string;
  name: string;
  creator: string;
  contributionAmount: number;
  contributionFrequency: number;
  maxParticipants: number;
  participantCount: number;
  balance: number;
  currentRound: number;
  cycleComplete: boolean;
  createdAt: number;
  participants: Participant[];
}

export function GroupDetailsPage() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Fetch group data from blockchain
  const { data: groupData, isLoading: isLoadingGroup, error: groupError } = useGroupSusu(id);
  const { data: participantsData, isLoading: isLoadingParticipants } = useGroupParticipants(id);

  // Map blockchain data to component format
  const mockGroupDetails: GroupDetails | null = groupData ? {
    id: groupData.id,
    name: groupData.name,
    creator: groupData.creator,
    contributionAmount: groupData.contributionAmount,
    contributionFrequency: groupData.contributionFrequency,
    maxParticipants: groupData.maxParticipants,
    participantCount: groupData.participantCount,
    balance: groupData.balance,
    currentRound: groupData.currentRound,
    cycleComplete: groupData.cycleComplete,
    createdAt: groupData.createdAt,
    participants: participantsData?.map((p, index) => ({
      address: p.address,
      contributionsMade: p.contributionsMade,
      hasReceivedPayout: p.hasReceivedPayout,
      joinTimestamp: p.joinTimestamp,
      position: index,
    })) || [],
  } : null;

  useEffect(() => {
    if (!currentAccount) {
      navigate("/");
    }
  }, [currentAccount, navigate]);

  if (!currentAccount) {
    return null;
  }

  if (isLoadingGroup || isLoadingParticipants) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (groupError || !mockGroupDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">Group not found or error loading group data.</p>
          <Link to="/explore" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const contributionInSui = mockGroupDetails.contributionAmount / 1_000_000_000;
  const balanceInSui = mockGroupDetails.balance / 1_000_000_000;
  const frequencyInDays = Math.floor(mockGroupDetails.contributionFrequency / (1000 * 60 * 60 * 24));
  const availableSlots = mockGroupDetails.maxParticipants - mockGroupDetails.participantCount;
  const isFull = availableSlots === 0;
  const isParticipant = currentAccount && mockGroupDetails.participants.some(
    p => p.address === currentAccount.address
  );
  const canJoin = !isFull && !isParticipant && !mockGroupDetails.cycleComplete;

  const handleJoinGroup = async () => {
    if (!currentAccount || !canJoin || !id) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      // Build the join group transaction
      const tx = joinGroupTx(DEVNET_COUNTER_PACKAGE_ID, id);

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            // Invalidate and refetch group data
            queryClient.invalidateQueries({ queryKey: ["groupSusu", id] });
            queryClient.invalidateQueries({ queryKey: ["groupParticipants", id] });
            queryClient.invalidateQueries({ queryKey: ["allGroups"] });
            
            setIsJoining(false);
            setJoinError(null);
          },
          onError: (error) => {
            console.error("Join group error:", error);
            setJoinError("Failed to join group. Please try again.");
            setIsJoining(false);
          },
        }
      );
    } catch (error) {
      console.error("Join group error:", error);
      setJoinError("Failed to join group. Please try again.");
      setIsJoining(false);
    }
  };

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back Button */}
      <Link 
        to="/explore"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-4 sm:mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-1"
        aria-label="Back to explore page"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm sm:text-base">Back to Explore</span>
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2 break-words">
              {mockGroupDetails.name}
            </h1>
            <p className="text-slate-400 text-sm sm:text-base break-all">
              Created by {mockGroupDetails.creator}
            </p>
          </div>
          
          {mockGroupDetails.cycleComplete && (
            <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
              ✓ Cycle Complete
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Group Info Card */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-4 sm:mb-6 flex items-center gap-2">
              <span aria-hidden="true">📊</span>
              <span>Group Information</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Contribution Amount</p>
                <p className="text-2xl font-bold text-cyan-300">{contributionInSui} SUI</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-1">Frequency</p>
                <p className="text-2xl font-bold text-violet-300">
                  {frequencyInDays} {frequencyInDays === 1 ? 'day' : 'days'}
                </p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-1">Participants</p>
                <p className="text-2xl font-bold text-slate-200">
                  {mockGroupDetails.participantCount} / {mockGroupDetails.maxParticipants}
                </p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-1">Pool Balance</p>
                <p className="text-2xl font-bold text-emerald-300">{balanceInSui} SUI</p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-1">Current Round</p>
                <p className="text-2xl font-bold text-slate-200">
                  {mockGroupDetails.currentRound + 1} / {mockGroupDetails.maxParticipants}
                </p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-1">Available Slots</p>
                <p className="text-2xl font-bold text-fuchsia-300">{availableSlots}</p>
              </div>
            </div>
          </div>

          {/* Participant List */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>👥</span>
              Participants
            </h2>
            
            <div className="space-y-3">
              {mockGroupDetails.participants.map((participant, index) => (
                <div
                  key={participant.address}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">
                        {participant.address}
                        {participant.address === mockGroupDetails.creator && (
                          <span className="ml-2 text-xs text-cyan-400">(Creator)</span>
                        )}
                        {participant.address === currentAccount?.address && (
                          <span className="ml-2 text-xs text-emerald-400">(You)</span>
                        )}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {participant.contributionsMade} contributions made
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {participant.hasReceivedPayout && (
                      <span className="text-emerald-400 text-sm">✓ Received</span>
                    )}
                    {participant.position === mockGroupDetails.currentRound && !mockGroupDetails.cycleComplete && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Current Recipient
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout Rotation */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>🔄</span>
              Payout Rotation
            </h2>
            
            <div className="space-y-2">
              {mockGroupDetails.participants.map((participant, index) => (
                <div
                  key={participant.address}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    index === mockGroupDetails.currentRound && !mockGroupDetails.cycleComplete
                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">Round {index + 1}</span>
                    <span className="text-slate-300">{participant.address}</span>
                  </div>
                  
                  {participant.hasReceivedPayout && (
                    <span className="text-emerald-400 text-sm">✓</span>
                  )}
                  {index === mockGroupDetails.currentRound && !mockGroupDetails.cycleComplete && (
                    <span className="text-cyan-400 text-sm font-medium">← Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Join Card */}
          {canJoin && (
            <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-200 mb-4">Join This Group</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Available Slots</span>
                  <span className="text-emerald-300 font-semibold">{availableSlots}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Your Commitment</span>
                  <span className="text-cyan-300 font-semibold">{contributionInSui} SUI</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Every</span>
                  <span className="text-violet-300 font-semibold">
                    {frequencyInDays} {frequencyInDays === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              {joinError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                  {joinError}
                </div>
              )}

              <button
                onClick={handleJoinGroup}
                disabled={isJoining}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl px-6 py-4 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  {isJoining ? "Joining..." : "Join Group"}
                </div>
              </button>
            </div>
          )}

          {isParticipant && (
            <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="text-center mb-4">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-emerald-300 mb-2">You're a Member!</h3>
                <p className="text-slate-400 text-sm mb-4">
                  You're part of this savings group
                </p>
              </div>
              
              <Link
                to={`/group/${mockGroupDetails.id}/manage`}
                className="block w-full"
              >
                <button className="w-full relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl px-6 py-3 font-bold text-white">
                    Manage Group
                  </div>
                </button>
              </Link>
            </div>
          )}

          {isFull && !isParticipant && (
            <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="text-center">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Group Full</h3>
                <p className="text-slate-400 text-sm">
                  This group has reached maximum capacity
                </p>
              </div>
            </div>
          )}

          {/* Contribution Schedule */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span>📅</span>
              Schedule
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm mb-1">Next Contribution</p>
                <p className="text-slate-200 font-semibold">
                  {new Date(Date.now() + mockGroupDetails.contributionFrequency).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-1">Estimated Completion</p>
                <p className="text-slate-200 font-semibold">
                  {new Date(
                    mockGroupDetails.createdAt + 
                    (mockGroupDetails.maxParticipants * mockGroupDetails.contributionFrequency)
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
