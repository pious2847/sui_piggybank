import { useState } from "react";
import { Award, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface NFTData {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // Walrus blob ID
  metadataUrl: string; // Walrus blob ID
  achievementType: number;
  earnedAt: number;
  recipient: string;
}

interface NFTCardProps {
  nft: NFTData;
  walrusAggregatorUrl?: string;
}

export function NFTCard({ 
  nft, 
  walrusAggregatorUrl = "https://aggregator.walrus-testnet.walrus.space" 
}: NFTCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Get achievement type label and color
  const getAchievementInfo = (type: number) => {
    switch (type) {
      case 1:
        return { 
          label: "Cycle Completion", 
          color: "from-cyan-400 to-blue-500",
          emoji: "🏆"
        };
      case 2:
        return { 
          label: "5 Cycles Milestone", 
          color: "from-violet-400 to-purple-500",
          emoji: "⭐"
        };
      case 3:
        return { 
          label: "10 Cycles Milestone", 
          color: "from-yellow-400 to-orange-500",
          emoji: "⚡"
        };
      case 4:
        return { 
          label: "Perfect Attendance", 
          color: "from-emerald-400 to-green-500",
          emoji: "🎯"
        };
      default:
        return { 
          label: "Achievement", 
          color: "from-slate-400 to-slate-500",
          emoji: "🏅"
        };
    }
  };

  const achievementInfo = getAchievementInfo(nft.achievementType);

  // Construct Walrus image URL
  const imageUrl = nft.imageUrl 
    ? `${walrusAggregatorUrl}/v1/blobs/${nft.imageUrl}`
    : null;

  // Construct Walrus metadata URL
  const metadataUrl = nft.metadataUrl
    ? `${walrusAggregatorUrl}/v1/blobs/${nft.metadataUrl}`
    : null;

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div className="group backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
      {/* NFT Image */}
      <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        )}
        
        {imageError || !imageUrl ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4">{achievementInfo.emoji}</div>
            <p className="text-slate-400 text-sm text-center">
              {imageError ? "Image unavailable" : "No image"}
            </p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={nft.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        {/* Achievement Badge Overlay */}
        <div className="absolute top-3 right-3">
          <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${achievementInfo.color} backdrop-blur-sm text-xs font-semibold text-white shadow-lg`}>
            {achievementInfo.label}
          </div>
        </div>
      </div>

      {/* NFT Details */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
          {nft.name}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {nft.description}
        </p>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Earned {formatDistanceToNow(new Date(nft.earnedAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Award className="w-3.5 h-3.5" />
            <span className="truncate">ID: {nft.id.slice(0, 8)}...{nft.id.slice(-6)}</span>
          </div>
        </div>

        {/* View Metadata Link */}
        {metadataUrl && (
          <a
            href={metadataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/[0.1] hover:text-white transition-all group-hover:border-white/20"
          >
            <span>View Metadata</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
