import { NFTCard, NFTData } from "./NFTCard";
import { Trophy } from "lucide-react";
import { SkeletonNFT } from "../ui/SkeletonLoader";
import { EmptyNFTsState } from "../ui/EmptyState";

interface NFTGalleryProps {
  nfts: NFTData[];
  isLoading?: boolean;
  walrusAggregatorUrl?: string;
}

export function NFTGallery({ 
  nfts, 
  isLoading = false,
  walrusAggregatorUrl = "https://aggregator.walrus-testnet.walrus.space"
}: NFTGalleryProps) {
  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 w-fit">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">NFT Rewards</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Your earned achievement NFTs</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonNFT key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 w-fit">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">NFT Rewards</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Your earned achievement NFTs</p>
          </div>
        </div>
        <EmptyNFTsState />
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">NFT Rewards</h3>
            <p className="text-slate-400 text-xs sm:text-sm">Your earned achievement NFTs</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl sm:text-3xl font-bold text-white">{nfts.length}</div>
          <div className="text-xs text-slate-400">Total NFTs</div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {nfts.map((nft) => (
          <NFTCard 
            key={nft.id} 
            nft={nft} 
            walrusAggregatorUrl={walrusAggregatorUrl}
          />
        ))}
      </div>
    </div>
  );
}
