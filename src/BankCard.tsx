import { Flex, Text } from "@radix-ui/themes";
import { memo, useMemo } from "react";

interface BankCardProps {
  bankId: string;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const BANK_EMOJIS = ['🐷', '🏦', '💰', '🪙', '💎', '🎯'];

export const BankCard = memo(function BankCard({ bankId, index, isSelected, onClick }: BankCardProps) {
  const emoji = useMemo(() => BANK_EMOJIS[index % BANK_EMOJIS.length], [index]);
  
  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Bank ${index + 1}, ID ${bankId.slice(0, 8)}`}
      className={`group/item relative p-4 sm:p-5 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 min-h-[60px] ${
        isSelected
          ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-cyan-500/50 shadow-xl shadow-cyan-500/20'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg'
      }`}
    >
      {/* Gradient border effect for selected state */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-violet-500/30 blur-md -z-10 animate-pulse" />
      )}
      
      <Flex align="center" gap="3" className="sm:gap-4 md:gap-4">
        {/* Bank emoji icon */}
        <div 
          className={`text-2xl sm:text-3xl md:text-4xl transition-transform duration-300 group-hover/item:scale-110 ${
            isSelected ? 'animate-bounce' : ''
          }`}
        >
          {emoji}
        </div>
        
        {/* Bank info */}
        <div className="flex-1 min-w-0">
          <Text weight="bold" className="text-white text-base sm:text-lg md:text-xl block">
            Bank #{index + 1}
          </Text>
          <Text size="2" className="text-slate-400 font-mono truncate block text-xs sm:text-sm md:text-base">
            {bankId.slice(0, 8)}...
          </Text>
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full animate-pulse shadow-lg shadow-cyan-500/50" />
        )}
      </Flex>
    </div>
  );
});
