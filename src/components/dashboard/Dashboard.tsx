import { memo, useState, useCallback, lazy, Suspense } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { StatsOverview } from "./StatsOverview";
import { QuickActions } from "./QuickActions";
import { PiggyBanksList } from "./PiggyBanksList";
import { GroupMembershipsList } from "./GroupMembershipsList";
import { SavingsChart } from "./SavingsChart";
import { UpcomingMilestones } from "./UpcomingMilestones";
import { RecentActivity } from "./RecentActivity";
import { useUserGroups } from "../../hooks/useUserGroups";
import { LoadingSpinner } from "../../LoadingSpinner";
import { SkeletonCard } from "../../SkeletonCard";
import { Card, Heading } from "@radix-ui/themes";
import { ownedObjectsQueryConfig, getOwnedObjectsQueryKey } from "../../queryConfig";

const CreatePiggyBank = lazy(() => import("../../CreateCounter"));

export const Dashboard = memo(function Dashboard() {
  const currentAccount = useCurrentAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch piggy banks
  const { data: piggyBanksData, isPending: isPiggyBanksPending, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address || "",
      options: { showType: true, showContent: true },
    },
    {
      ...ownedObjectsQueryConfig,
      queryKey: getOwnedObjectsQueryKey(currentAccount?.address || ""),
    }
  );

  // Fetch group memberships
  const { data: groupMemberships, isPending: isGroupsPending } = useUserGroups(currentAccount?.address);

  // Filter piggy banks
  const piggyBanks = (piggyBanksData?.data || []).filter((obj: any) =>
    obj.data?.type?.endsWith("counter::PiggyBank")
  );

  // Calculate total savings from piggy banks
  const piggyBankSavings = piggyBanks.reduce((total: number, bank: any) => {
    const content = bank.data?.content;
    if (content && "fields" in content) {
      const fields = content.fields as any;
      return total + Number(fields.balance || 0);
    }
    return total;
  }, 0);

  // Calculate total savings from group memberships
  const groupSavings = (groupMemberships || []).reduce((total, group) => {
    // User's contribution is their position * contribution amount
    return total + (group.userPosition * group.contributionAmount);
  }, 0);

  const totalSavings = piggyBankSavings + groupSavings;
  const activeGroups = (groupMemberships || []).filter(g => !g.cycleComplete).length;

  const handleCreateBank = useCallback((_id: string) => {
    setShowCreateForm(false);
    refetch();
  }, [refetch]);

  const handleShowCreateForm = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const handleCloseCreateForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  const isLoading = isPiggyBanksPending || isGroupsPending;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10 animate-fade-in">
      {/* Header */}
      <header className="mb-8">
        <Heading size="8" className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent font-black text-3xl sm:text-4xl md:text-5xl mb-2">
          Dashboard
        </Heading>
        <p className="text-slate-400 text-lg">
          Welcome back! Here's your savings overview.
        </p>
      </header>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-8">
          <SkeletonCard variant="stat" />
          <SkeletonCard variant="stat" />
          <SkeletonCard variant="stat" />
          <SkeletonCard variant="stat" />
        </div>
      ) : (
        <StatsOverview
          totalSavings={totalSavings}
          totalPiggyBanks={piggyBanks.length}
          totalGroupMemberships={groupMemberships?.length || 0}
          activeGroups={activeGroups}
        />
      )}

      {/* Quick Actions */}
      <QuickActions onCreatePiggyBank={handleShowCreateForm} />

      {/* Create Piggy Bank Form */}
      {showCreateForm && (
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <Heading size="5" className="text-white font-bold">
                Create New Piggy Bank
              </Heading>
              <button
                onClick={handleCloseCreateForm}
                className="text-white hover:bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center transition-all"
                aria-label="Close create form"
              >
                ✕
              </button>
            </div>
            <Suspense fallback={<LoadingSpinner size="md" message="Loading form..." />}>
              <CreatePiggyBank onCreated={handleCreateBank} />
            </Suspense>
          </Card>
        </div>
      )}

      {/* Savings Chart */}
      {isLoading ? (
        <SkeletonCard variant="chart" />
      ) : (
        <SavingsChart piggyBanks={piggyBanks} groupMemberships={groupMemberships || []} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Piggy Banks List */}
        {isLoading ? (
          <SkeletonCard variant="list" />
        ) : (
          <PiggyBanksList piggyBanks={piggyBanks} />
        )}

        {/* Group Memberships List */}
        {isLoading ? (
          <SkeletonCard variant="list" />
        ) : (
          <GroupMembershipsList groups={groupMemberships || []} />
        )}
      </div>

      {/* Progress Tracking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Upcoming Milestones */}
        {isLoading ? (
          <SkeletonCard variant="list" />
        ) : (
          <UpcomingMilestones piggyBanks={piggyBanks} groupMemberships={groupMemberships || []} />
        )}

        {/* Recent Activity */}
        {isLoading ? (
          <SkeletonCard variant="list" />
        ) : (
          <RecentActivity piggyBanks={piggyBanks} groupMemberships={groupMemberships || []} />
        )}
      </div>
    </div>
  );
});
