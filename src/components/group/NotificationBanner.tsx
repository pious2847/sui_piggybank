interface NotificationBannerProps {
  type: "info" | "warning" | "success" | "error";
  message: string;
  onDismiss?: () => void;
}

export function NotificationBanner({ type, message, onDismiss }: NotificationBannerProps) {
  const getStyles = () => {
    switch (type) {
      case "info":
        return "bg-cyan-500/20 border-cyan-500/30 text-cyan-300";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/30 text-yellow-300";
      case "success":
        return "bg-emerald-500/20 border-emerald-500/30 text-emerald-300";
      case "error":
        return "bg-red-500/20 border-red-500/30 text-red-300";
      default:
        return "bg-slate-500/20 border-slate-500/30 text-slate-300";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "•";
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border ${getStyles()}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <p className="font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
