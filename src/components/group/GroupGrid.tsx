import { GroupCard, GroupCardProps } from "./GroupCard";
import { SkeletonCard } from "../ui/SkeletonLoader";
import { EmptyState } from "../ui/EmptyState";

export interface GroupGridProps {
  groups: GroupCardProps[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function GroupGrid({ 
  groups, 
  isLoading = false,
  emptyMessage = "No groups found matching your criteria"
}: GroupGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No Groups Found"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {groups.map((group) => (
        <GroupCard key={group.id} {...group} />
      ))}
    </div>
  );
}
