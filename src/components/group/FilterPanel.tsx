import { useState } from "react";

export interface FilterOptions {
  minContribution: number;
  maxContribution: number;
  frequency: string;
  availableSlots: string;
  showCompleted: boolean;
}

export interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    minContribution: 0,
    maxContribution: 1000,
    frequency: "all",
    availableSlots: "all",
    showCompleted: false,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      minContribution: 0,
      maxContribution: 1000,
      frequency: "all",
      availableSlots: "all",
      showCompleted: false,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl" aria-hidden="true">🎛️</span>
          <h3 className="text-base sm:text-lg font-semibold text-slate-200">Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg"
          aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Filter Content */}
      <div 
        className={`space-y-4 sm:space-y-6 transition-all duration-300 ${isExpanded ? "block" : "hidden lg:block"}`}
        role="region"
        aria-label="Filter options"
      >
        {/* Contribution Amount Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3">
            Contribution Amount (SUI)
          </label>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label htmlFor="min-contribution" className="text-xs text-slate-400 mb-1 block">
                Min
              </label>
              <input
                id="min-contribution"
                type="number"
                min="0"
                step="0.1"
                value={filters.minContribution}
                onChange={(e) => handleFilterChange("minContribution", parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="0"
                aria-label="Minimum contribution amount"
              />
            </div>
            <div>
              <label htmlFor="max-contribution" className="text-xs text-slate-400 mb-1 block">
                Max
              </label>
              <input
                id="max-contribution"
                type="number"
                min="0"
                step="0.1"
                value={filters.maxContribution}
                onChange={(e) => handleFilterChange("maxContribution", parseFloat(e.target.value) || 1000)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="1000"
                aria-label="Maximum contribution amount"
              />
            </div>
          </div>
        </div>

        {/* Contribution Frequency */}
        <div>
          <label htmlFor="frequency-filter" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3">
            Contribution Frequency
          </label>
          <select
            id="frequency-filter"
            value={filters.frequency}
            onChange={(e) => handleFilterChange("frequency", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
            aria-label="Filter by contribution frequency"
          >
            <option value="all">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly (7 days)</option>
            <option value="biweekly">Bi-weekly (14 days)</option>
            <option value="monthly">Monthly (30 days)</option>
          </select>
        </div>

        {/* Available Slots */}
        <div>
          <label htmlFor="slots-filter" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2 sm:mb-3">
            Available Slots
          </label>
          <select
            id="slots-filter"
            value={filters.availableSlots}
            onChange={(e) => handleFilterChange("availableSlots", e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all cursor-pointer"
            aria-label="Filter by available slots"
          >
            <option value="all">All Groups</option>
            <option value="available">Has Available Slots</option>
            <option value="full">Full Groups</option>
          </select>
        </div>

        {/* Show Completed Cycles */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              id="show-completed"
              type="checkbox"
              checked={filters.showCompleted}
              onChange={(e) => handleFilterChange("showCompleted", e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
              aria-label="Show completed cycles"
            />
            <span className="text-xs sm:text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
              Show completed cycles
            </span>
          </label>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-slate-200 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
