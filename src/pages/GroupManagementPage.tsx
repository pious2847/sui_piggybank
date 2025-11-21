import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { NotificationBanner } from "../components/group/NotificationBanner";
import { ContributionStatusIndicator } from "../components/group/ContributionStatusIndicator";
import { ContributeButton } from "../components/group/ContributeButton";
import { useGroupSusu, useGroupParticipants } from "../hooks/useGroupSusu";
import { LoadingSpinner } from "../LoadingSpinner";

interface Participant {
  address: string;
  contributionsMade: number;
  hasReceivedPayout: boolean;
  joinTimestamp: number;
  position: number;
  lastContributionTime: number;
  contributionStatus: "paid" | "pending" | "overdue";
}

interface GroupManagementData {
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
  nextContributionDeadline: number;
}

export function GroupManagementPage() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Fetch group data from blockchain
  const { data: groupData, isLoading: isLoadingGroup, error: groupError } = useGroupSusu(id);
  const { data: participantsData, isLoading: isLoadingParticipants } = useGroupParticipants(id);

  // Calculate contribution status based on last contribution time
  const getContributionStatus = (lastContributionTime: number, contributionFrequency: number): "paid" | "pending" | "overdue" => {
    const timeSinceLastContribution = Date.now() - lastContributionTime;
    if (timeSinceLastContribution > contributionFrequency * 1.5) {
      return "overdue";
    } else if (timeSinceLastContribution > contributionFrequency) {
      return "pending";
    }
    return "paid";
  };

  // Map blockchain data to component format
  const mockGroupData: GroupManagementData | null = groupData ? {
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
    nextContributionDeadline: groupData.createdAt + (groupData.currentRound + 1) * groupData.contributionFrequency,
    participants: participantsData?.map((p, index) => ({
      address: p.address,
      contributionsMade: p.contributionsMade,
      hasReceivedPayout: p.hasReceivedPayout,
      joinTimestamp: p.joinTimestamp,
      position: index,
      lastContributionTime: p.lastContributionTime,
      contributionStatus: getContributionStatus(p.lastContributionTime, groupData.contributionFrequency),
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

  if (groupError || !mockGroupData) {
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

  const contributionInSui = mockGroupData.contributionAmount / 1_000_000_000;
  const balanceInSui = mockGroupData.balance / 1_000_000_000;
  const frequencyInDays = Math.floor(mockGroupData.contributionFrequency / (1000 * 60 * 60 * 24));
  
  const currentRecipient = mockGroupData.participants.find(
    p => p.position === mockGroupData.currentRound
  );

  const userParticipant = mockGroupData.participants.find(
    p => p.address === currentAccount?.address
  );

  const daysUntilDeadline = Math.ceil(
    (mockGroupData.nextContributionDeadline - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Calculate rounds until user's payout
  const roundsUntilPayout = userParticipant 
    ? (userParticipant.position - mockGroupData.currentRound + mockGroupData.maxParticipants) % mockGroupData.maxParticipants
    : 0;

  // Generate notifications
  const notifications = [];
  
  // Upcoming contribution deadline notification
  if (daysUntilDeadline <= 3 && daysUntilDeadline > 0 && !dismissedNotifications.includes("deadline")) {
    notifications.push({
      id: "deadline",
      type: "warning" as const,
      message: `Contribution deadline in ${daysUntilDeadline} ${daysUntilDeadline === 1 ? 'day' : 'days'}! Make sure to contribute on time.`,
    });
  }

  // Overdue contribution notification
  if (userParticipant?.contributionStatus === "overdue" && !dismissedNotifications.includes("overdue")) {
    notifications.push({
      id: "overdue",
      type: "error" as const,
      message: "Your contribution is overdue! Please contribute as soon as possible to maintain your reputation.",
    });
  }

  // Current recipient notification
  if (userParticipant?.position === mockGroupData.currentRound && !dismissedNotifications.includes("recipient")) {
    notifications.push({
      id: "recipient",
      type: "success" as const,
      message: "🎉 You're the current round recipient! You'll receive the pooled funds once all contributions are in.",
    });
  }

  // Upcoming payout notification
  if (roundsUntilPayout === 1 && !dismissedNotifications.includes("upcoming-payout")) {
    notifications.push({
      id: "upcoming-payout",
      type: "info" as const,
      message: "You're next in line to receive the payout! Your turn is coming up in the next round.",
    });
  }

  // Pending contribution notification
  if (userParticipant?.contributionStatus === "pending" && daysUntilDeadline <= 7 && !dismissedNotifications.includes("pending")) {
    notifications.push({
      id: "pending",
      type: "info" as const,
      message: "Don't forget to make your contribution for this round!",
    });
  }

  const handleDismissNotification = (id: string) => {
    setDismissedNotifications([...dismissedNotifications, id]);
  };

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        to={`/group/${id}`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Group Details
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
          Group Management
        </h1>
        <p className="text-slate-400">{mockGroupData.name}</p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-3">
          {notifications.map((notification) => (
            <NotificationBanner
              key={notification.id}
              type={notification.type}
              message={notification.message}
              onDismiss={() => handleDismissNotification(notification.id)}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Round Status */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>🎯</span>
              Current Round Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-slate-400 text-sm mb-2">Current Round</p>
                <p className="text-3xl font-bold text-cyan-300">
                  {mockGroupData.currentRound + 1} / {mockGroupData.maxParticipants}
                </p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-slate-400 text-sm mb-2">Current Recipient</p>
                <p className="text-lg font-bold text-violet-300">
                  {currentRecipient?.address || "N/A"}
                </p>
                {currentRecipient?.address === currentAccount?.address && (
                  <p className="text-emerald-400 text-sm mt-1">← You!</p>
                )}
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-slate-400 text-sm mb-2">Pool Balance</p>
                <p className="text-3xl font-bold text-emerald-300">{balanceInSui} SUI</p>
              </div>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-slate-400 text-sm mb-2">Payout Amount</p>
                <p className="text-3xl font-bold text-fuchsia-300">
                  {contributionInSui * mockGroupData.participantCount} SUI
                </p>
              </div>
            </div>
          </div>

          {/* Participants with Contribution Status */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>👥</span>
              Participants & Contribution Status
            </h2>
            
            <div className="space-y-3">
              {mockGroupData.participants.map((participant) => (
                <div
                  key={participant.address}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center font-bold text-white">
                      {participant.position + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200 font-medium">
                        {participant.address}
                        {participant.address === mockGroupData.creator && (
                          <span className="ml-2 text-xs text-cyan-400">(Creator)</span>
                        )}
                        {participant.address === currentAccount?.address && (
                          <span className="ml-2 text-xs text-emerald-400">(You)</span>
                        )}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {participant.contributionsMade} contributions • Position {participant.position + 1} in rotation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <ContributionStatusIndicator 
                      status={participant.contributionStatus}
                      size="sm"
                    />
                    {participant.position === mockGroupData.currentRound && !mockGroupData.cycleComplete && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Current Recipient
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contribution Schedule */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <span>📅</span>
              Contribution Schedule
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-xl border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-300 font-semibold">Next Contribution Deadline</p>
                  <p className="text-cyan-300 font-bold text-lg">
                    {daysUntilDeadline} {daysUntilDeadline === 1 ? 'day' : 'days'}
                  </p>
                </div>
                <p className="text-slate-400 text-sm">
                  {new Date(mockGroupData.nextContributionDeadline).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-sm mb-1">Contribution Amount</p>
                  <p className="text-2xl font-bold text-slate-200">{contributionInSui} SUI</p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-sm mb-1">Frequency</p>
                  <p className="text-2xl font-bold text-slate-200">
                    Every {frequencyInDays} {frequencyInDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-sm mb-1">Estimated Completion</p>
                  <p className="text-lg font-bold text-slate-200">
                    {new Date(
                      mockGroupData.createdAt + 
                      (mockGroupData.maxParticipants * mockGroupData.contributionFrequency)
                    ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-slate-400 text-sm mb-3">Upcoming Payment Dates</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((offset) => {
                    const date = new Date(mockGroupData.nextContributionDeadline + (offset * mockGroupData.contributionFrequency));
                    return (
                      <div key={offset} className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-slate-400 text-xs mb-1">Round {mockGroupData.currentRound + offset + 1}</p>
                        <p className="text-slate-200 text-sm font-medium">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Your Position */}
          {userParticipant && (
            <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span>📍</span>
                Your Position
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Position in Rotation</p>
                  <p className="text-3xl font-bold text-cyan-300">
                    #{userParticipant.position + 1}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    of {mockGroupData.maxParticipants} participants
                  </p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm mb-2">Your Status</p>
                  <ContributionStatusIndicator 
                    status={userParticipant.contributionStatus}
                    size="md"
                  />
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm mb-1">Rounds Until Your Payout</p>
                  <p className="text-2xl font-bold text-violet-300">
                    {roundsUntilPayout === 0 ? "Current!" : roundsUntilPayout}
                  </p>
                  {roundsUntilPayout > 0 && (
                    <p className="text-slate-400 text-xs mt-1">
                      Approximately {roundsUntilPayout * frequencyInDays} days
                    </p>
                  )}
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm mb-1">Contributions Made</p>
                  <p className="text-2xl font-bold text-slate-200">
                    {userParticipant.contributionsMade}
                  </p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm mb-1">Payout Received</p>
                  <p className="text-lg font-bold text-slate-200">
                    {userParticipant.hasReceivedPayout ? (
                      <span className="text-emerald-400">✓ Yes</span>
                    ) : (
                      <span className="text-slate-400">Not yet</span>
                    )}
                  </p>
                </div>

                {userParticipant.position === mockGroupData.currentRound && (
                  <div className="p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl">
                    <p className="text-cyan-300 text-sm font-medium text-center">
                      🎉 You're the current recipient!
                    </p>
                  </div>
                )}

                {roundsUntilPayout === 1 && (
                  <div className="p-3 bg-violet-500/20 border border-violet-500/30 rounded-xl">
                    <p className="text-violet-300 text-sm font-medium text-center">
                      ⏭️ You're next in line!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contribute Button */}
          {userParticipant && !mockGroupData.cycleComplete && (
            <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span>💰</span>
                Make Contribution
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-sm mb-1">Required Amount</p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {contributionInSui} SUI
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Due every {frequencyInDays} days
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-300 text-xs">
                    💡 Contributing on time earns you reputation points!
                  </p>
                </div>

                <ContributeButton
                  groupId={mockGroupData.id}
                  groupName={mockGroupData.name}
                  contributionAmount={mockGroupData.contributionAmount}
                />
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
              <span>📊</span>
              Quick Stats
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Paid</span>
                <span className="text-emerald-400 font-semibold">
                  {mockGroupData.participants.filter(p => p.contributionStatus === "paid").length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Pending</span>
                <span className="text-yellow-400 font-semibold">
                  {mockGroupData.participants.filter(p => p.contributionStatus === "pending").length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Overdue</span>
                <span className="text-red-400 font-semibold">
                  {mockGroupData.participants.filter(p => p.contributionStatus === "overdue").length}
                </span>
              </div>
              
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Total Participants</span>
                  <span className="text-slate-200 font-semibold">
                    {mockGroupData.participantCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-200 mb-4">Status Legend</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium border text-emerald-400 bg-emerald-500/20 border-emerald-500/30">
                  ✓ PAID
                </span>
                <span className="text-slate-400 text-sm">Contribution received</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium border text-yellow-400 bg-yellow-500/20 border-yellow-500/30">
                  ⏳ PENDING
                </span>
                <span className="text-slate-400 text-sm">Awaiting contribution</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium border text-red-400 bg-red-500/20 border-red-500/30">
                  ⚠ OVERDUE
                </span>
                <span className="text-slate-400 text-sm">Missed deadline</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
