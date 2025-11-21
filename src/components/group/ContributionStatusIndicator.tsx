interface ContributionStatusIndicatorProps {
  status: "paid" | "pending" | "overdue";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ContributionStatusIndicator({ 
  status, 
  size = "md", 
  showLabel = true 
}: ContributionStatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case "paid":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "pending":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "overdue":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-slate-400 bg-slate-500/20 border-slate-500/30";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "paid":
        return "✓";
      case "pending":
        return "⏳";
      case "overdue":
        return "⚠";
      default:
        return "•";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "md":
        return "px-3 py-1 text-sm";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${getStatusColor()} ${getSizeClasses()}`}
    >
      <span>{getStatusIcon()}</span>
      {showLabel && <span>{status.toUpperCase()}</span>}
    </span>
  );
}
