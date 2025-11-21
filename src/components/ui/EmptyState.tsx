/**
 * EmptyState Component
 * 
 * Reusable empty state components for various scenarios.
 * Provides consistent messaging and actions when no data is available.
 */

import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div 
      className={`backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 sm:p-12 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-bounce-slow">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
        {title}
      </h3>
      <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-6">
        {description}
      </p>
      
      {action && (
        action.href ? (
          <Link
            to={action.href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            {action.label}
          </button>
        )
      )}
      
      {children}
    </div>
  );
}

export function EmptyGroupsState() {
  return (
    <EmptyState
      icon="🔍"
      title="No Groups Found"
      description="We couldn't find any groups matching your criteria. Try adjusting your filters or search query."
    />
  );
}

export function EmptyPiggyBanksState() {
  return (
    <EmptyState
      icon="🐷"
      title="No Piggy Banks Yet"
      description="You haven't created any piggy banks yet. Start saving by creating your first piggy bank!"
      action={{
        label: "Create Piggy Bank",
        href: "/piggy-banks",
      }}
    />
  );
}

export function EmptyNFTsState() {
  return (
    <EmptyState
      icon="🎨"
      title="No NFT Rewards Yet"
      description="You haven't earned any NFT rewards yet. Complete group susu cycles and achieve milestones to earn rewards!"
      action={{
        label: "Explore Groups",
        href: "/explore",
      }}
    />
  );
}

export function EmptyReputationState() {
  return (
    <EmptyState
      icon="⭐"
      title="No Reputation History"
      description="You haven't earned any reputation points yet. Join a group susu and start contributing to build your reputation!"
      action={{
        label: "Join a Group",
        href: "/explore",
      }}
    />
  );
}

export function EmptyActivityState() {
  return (
    <EmptyState
      icon="📊"
      title="No Recent Activity"
      description="You don't have any recent transactions or activities yet. Start by creating a piggy bank or joining a group!"
    />
  );
}

export function EmptySearchState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔎"
      title="No Results Found"
      description={`We couldn't find any results for "${query}". Try a different search term.`}
    />
  );
}

export function ErrorState({ 
  title = "Something Went Wrong",
  description = "We encountered an error while loading this data. Please try again later.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
      } : undefined}
    />
  );
}
