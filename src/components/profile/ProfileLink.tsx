import { Link } from "react-router-dom";
import { User, ExternalLink } from "lucide-react";
import { formatAddress } from "../../utils/profileLinks";

interface ProfileLinkProps {
  address: string;
  displayName?: string;
  showIcon?: boolean;
  showExternalIcon?: boolean;
  className?: string;
  variant?: "default" | "compact" | "badge";
}

/**
 * ProfileLink Component
 * 
 * A reusable component for linking to user profiles throughout the app.
 * Can be used in group participant lists, leaderboards, etc.
 * 
 * @param address - The Sui wallet address to link to
 * @param displayName - Optional display name (defaults to formatted address)
 * @param showIcon - Whether to show the user icon (default: true)
 * @param showExternalIcon - Whether to show external link icon (default: false)
 * @param className - Additional CSS classes
 * @param variant - Display variant (default, compact, or badge)
 */
export function ProfileLink({
  address,
  displayName,
  showIcon = true,
  showExternalIcon = false,
  className = "",
  variant = "default",
}: ProfileLinkProps) {
  const formattedAddress = formatAddress(address);
  const displayText = displayName || formattedAddress;

  if (variant === "badge") {
    return (
      <Link
        to={`/profile/${address}`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/10 text-slate-300 hover:bg-white/[0.1] hover:text-white hover:border-cyan-500/50 transition-all ${className}`}
        title={`View ${displayText}'s profile`}
      >
        {showIcon && <User className="w-3.5 h-3.5" />}
        <span className="text-sm font-medium">{displayText}</span>
        {showExternalIcon && <ExternalLink className="w-3 h-3" />}
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/profile/${address}`}
        className={`inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors ${className}`}
        title={`View ${displayText}'s profile`}
      >
        {showIcon && <User className="w-4 h-4" />}
        <span className="text-sm font-medium">{displayText}</span>
        {showExternalIcon && <ExternalLink className="w-3 h-3" />}
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={`/profile/${address}`}
      className={`inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors ${className}`}
      title={`View ${displayText}'s profile`}
    >
      {showIcon && <User className="w-4 h-4" />}
      <span className="font-medium">{displayText}</span>
      {showExternalIcon && <ExternalLink className="w-4 h-4" />}
    </Link>
  );
}
