import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { SearchBar } from "../components/group/SearchBar";
import { FilterPanel, FilterOptions } from "../components/group/FilterPanel";
import { GroupGrid } from "../components/group/GroupGrid";
import { GroupCardProps } from "../components/group/GroupCard";
import { useAllGroups } from "../hooks/useAllGroups";
import { LoadingSpinner } from "../LoadingSpinner";
import { Plus } from "lucide-react";

export function ExplorePage() {
  const currentAccount = useCurrentAccount();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    minContribution: 0,
    maxContribution: 1000,
    frequency: "all",
    availableSlots: "all",
    showCompleted: false,
  });

  // Fetch all groups from blockchain
  const { data: groupsData, isLoading, error } = useAllGroups(
    {
      hasAvailableSlots: filters.availableSlots === "available" ? true : undefined,
      searchQuery: searchQuery || undefined,
    },
    null,
    50
  );

  const blockchainGroups: GroupCardProps[] = (groupsData?.groups || []).map(group => ({
    id: group.id,
    name: group.name,
    creator: group.creator,
    contributionAmount: group.contributionAmount,
    contributionFrequency: group.contributionFrequency,
    maxParticipants: group.maxParticipants,
    participantCount: group.participantCount,
    cycleComplete: group.cycleComplete,
    createdAt: group.createdAt,
  }));

  useEffect(() => {
    if (!currentAccount) {
      navigate("/");
    }
  }, [currentAccount, navigate]);

  // Filter and search logic
  const filteredGroups = useMemo(() => {
    return blockchainGroups.filter((group) => {
      // Search filter
      if (searchQuery && !group.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Contribution amount filter (convert MIST to SUI)
      const contributionInSui = group.contributionAmount / 1_000_000_000;
      if (contributionInSui < filters.minContribution || contributionInSui > filters.maxContribution) {
        return false;
      }

      // Frequency filter
      if (filters.frequency !== "all") {
        const frequencyInDays = Math.floor(group.contributionFrequency / (1000 * 60 * 60 * 24));
        switch (filters.frequency) {
          case "daily":
            if (frequencyInDays !== 1) return false;
            break;
          case "weekly":
            if (frequencyInDays !== 7) return false;
            break;
          case "biweekly":
            if (frequencyInDays !== 14) return false;
            break;
          case "monthly":
            if (frequencyInDays !== 30) return false;
            break;
        }
      }

      // Available slots filter
      if (filters.availableSlots !== "all") {
        const hasSlots = group.participantCount < group.maxParticipants;
        if (filters.availableSlots === "available" && !hasSlots) return false;
        if (filters.availableSlots === "full" && hasSlots) return false;
      }

      // Show completed filter
      if (!filters.showCompleted && group.cycleComplete) {
        return false;
      }

      return true;
    });
  }, [blockchainGroups, searchQuery, filters]);

  if (!currentAccount) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">Error loading groups. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Explore Groups
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Discover and join group susu savings opportunities
          </p>
        </div>
        <button
          onClick={() => navigate("/create-group")}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 rounded-xl font-semibold transition-all shadow-lg hover:shadow-cyan-500/50 whitespace-nowrap"
        >
          <Plus size={20} />
          <span>Create Group</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Filter Panel - Sidebar on large screens, collapsible on mobile */}
        <div className="lg:col-span-1">
          <FilterPanel onFilterChange={setFilters} />
        </div>

        {/* Groups Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-slate-400 text-sm">
              {filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'} found
            </p>
          </div>
          
          <GroupGrid 
            groups={filteredGroups}
            emptyMessage="Try adjusting your filters or search query"
          />
        </div>
      </div>
    </div>
  );
}
