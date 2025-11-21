import {
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Button, Flex, Heading, Text, Card } from "@radix-ui/themes";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { StatsCard } from "./StatsCard";
import { BankCard } from "./BankCard";
import { EmptyState } from "./EmptyState";
import { SkeletonCard } from "./SkeletonCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorBoundary } from "./ErrorBoundary";
import { ownedObjectsQueryConfig, getOwnedObjectsQueryKey } from "./queryConfig";

// Lazy load heavy components that are only shown conditionally
const CreatePiggyBank = lazy(() => import("./CreateCounter"));
const PiggyBankDisplay = lazy(() => import("./PiggyBankDisplay"));
const PiggyBankActions = lazy(() => import("./PiggyBank"));

const SBank = () => {
  const currentAccount = useCurrentAccount();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data, isPending, error, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address || "",
      options: { showType: true },
    },
    {
      ...ownedObjectsQueryConfig,
      // Use unique query key for proper cache isolation
      queryKey: getOwnedObjectsQueryKey(currentAccount?.address || ""),
    }
  );
  
  // Memoize filtered piggy banks to avoid re-filtering on every render
  const piggyBanks = useMemo(() => 
    (data?.data || []).filter((obj: any) => obj.data?.type?.endsWith("counter::PiggyBank")),
    [data]
  );
  
  // Memoize callbacks to prevent unnecessary re-renders
  const handleCreateBank = useCallback((id: string) => {
    setCreatedId(id);
    setShowCreateForm(false);
    setSelectedBankId(id);
    refetch();
  }, [refetch]);
  
  const handleShowCreateForm = useCallback(() => {
    setShowCreateForm(true);
  }, []);
  
  const handleCloseCreateForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);
  
  const handleSelectBank = useCallback((bankId: string) => {
    setSelectedBankId(bankId);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10 animate-fade-in">
      {/* Header Section */}
      <header className="text-left mb-8 sm:mb-10 md:mb-12">
        <Heading size="8" mb="3" className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
          My Piggy Banks 🏦
        </Heading>
        <Text size="5" className="text-slate-400 font-light text-base sm:text-lg md:text-xl">
          Save smart, grow your SUI with time-locked goals
        </Text>
      </header>

      {/* Stats Overview */}
      <section aria-label="Statistics Overview">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          <StatsCard
            icon="🏛️"
            label="Total Banks"
            value={piggyBanks.length}
            gradientFrom="from-emerald-500/20"
            gradientTo="to-teal-500/20"
          />
          
          <StatsCard
            icon="💰"
            label="Active Savings"
            value={piggyBanks.length > 0 ? `${piggyBanks.length} Active` : "0 Active"}
            gradientFrom="from-violet-500/20"
            gradientTo="to-purple-500/20"
          />
          
          <StatsCard
            icon="🎯"
            label="Goals Set"
            value={piggyBanks.length}
            gradientFrom="from-cyan-500/20"
            gradientTo="to-blue-500/20"
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6 sm:gap-6 md:gap-8" aria-label="Piggy Banks Management">
        {/* Left Column - Banks List */}
        <div className="md:col-span-2 lg:col-span-1">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 shadow-2xl">
              <Flex justify="between" align="center" mb="5" className="flex-col sm:flex-row md:flex-row gap-3 sm:gap-0">
                <Heading size="4" className="text-white font-bold text-lg sm:text-xl md:text-xl">
                  Your Banks
                </Heading>
                <Button
                  onClick={handleShowCreateForm}
                  aria-label="Create new piggy bank"
                  className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 border-none rounded-xl px-4 py-2 md:px-5 md:py-2.5 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto min-h-[44px]"
                >
                  + New Bank
                </Button>
              </Flex>

              {isPending ? (
                <div className="space-y-3">
                  <SkeletonCard variant="bank" />
                  <SkeletonCard variant="bank" />
                  <SkeletonCard variant="bank" />
                </div>
              ) : error ? (
                <div className="text-center py-12 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                  <div className="text-4xl mb-3">⚠️</div>
                  <Text className="text-red-400">Error: {String(error)}</Text>
                </div>
              ) : piggyBanks.length === 0 ? (
                <EmptyState
                  icon="🐷"
                  title="No Piggy Banks Yet"
                  message="Create your first piggy bank to start saving towards your goals!"
                  actionLabel="+ Create Bank"
                  onAction={handleShowCreateForm}
                />
              ) : (
                <Flex direction="column" gap="3">
                  {piggyBanks.map((obj: any, index: number) => (
                    <BankCard
                      key={obj.data.objectId}
                      bankId={obj.data.objectId}
                      index={index}
                      isSelected={selectedBankId === obj.data.objectId}
                      onClick={() => handleSelectBank(obj.data.objectId)}
                    />
                  ))}
                </Flex>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column - Details & Actions */}
        <div className="md:col-span-3 lg:col-span-2">
          {showCreateForm ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-6 md:p-7 lg:p-8 shadow-2xl">
                <Flex justify="between" align="center" mb="6">
                  <Heading size="5" className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                    Create New Piggy Bank
                  </Heading>
                  <Button
                    variant="ghost"
                    onClick={handleCloseCreateForm}
                    aria-label="Close create piggy bank form"
                    className="text-white hover:bg-white/10 rounded-xl w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center transition-all min-h-[44px] min-w-[44px]"
                  >
                    <span aria-hidden="true">✕</span>
                  </Button>
                </Flex>
                <Suspense fallback={<LoadingSpinner size="md" message="Loading form..." />}>
                  <CreatePiggyBank
                    onCreated={handleCreateBank}
                  />
                </Suspense>
              </Card>
            </div>
          ) : (selectedBankId || createdId) ? (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-6 md:p-7 lg:p-8 shadow-2xl">
                  <Heading size="5" mb="6" className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                    Bank Details
                  </Heading>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner size="lg" message="Loading bank details..." />}>
                      <PiggyBankDisplay bankId={selectedBankId || createdId!} />
                    </Suspense>
                  </ErrorBoundary>
                </Card>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-6 md:p-7 lg:p-8 shadow-2xl">
                  <Heading size="5" mb="6" className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                    Actions
                  </Heading>
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner size="md" message="Loading actions..." />}>
                      <PiggyBankActions bankId={selectedBankId || createdId!} onAction={refetch} />
                    </Suspense>
                  </ErrorBoundary>
                </Card>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-4 sm:p-6 md:p-7 lg:p-8 shadow-2xl">
                <EmptyState
                  icon="🐷"
                  title="Select a Piggy Bank"
                  message="Choose a piggy bank from the list to view details and perform actions, or create a new one."
                />
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SBank;