import { useState } from "react";

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search groups by name..." 
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-all duration-500" aria-hidden="true" />
      
      <div className="relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 focus-within:border-cyan-500/50 focus-within:bg-white/[0.1]">
        <div className="flex items-center px-3 sm:px-5 py-3 sm:py-4">
          {/* Search Icon */}
          <span className="text-xl sm:text-2xl mr-2 sm:mr-3" aria-hidden="true">🔍</span>
          
          {/* Input */}
          <input
            type="search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none text-sm sm:text-base"
            aria-label="Search groups"
            role="searchbox"
          />
          
          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              className="ml-2 sm:ml-3 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label="Clear search"
              type="button"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
