import { Text, Heading, Button } from "@radix-ui/themes";
import { memo } from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = memo(function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16 md:py-20">
      {/* Large animated emoji */}
      <div className="text-7xl sm:text-8xl md:text-9xl mb-4 sm:mb-6 md:mb-7 animate-bounce inline-block" aria-hidden="true">
        {icon}
      </div>
      
      {/* Title */}
      <Heading size="6" mb="4" className="text-white font-bold text-xl sm:text-2xl md:text-3xl">
        {title}
      </Heading>
      
      {/* Message */}
      <Text className="text-slate-400 text-base sm:text-lg md:text-xl max-w-md mx-auto block mb-6 sm:mb-8 md:mb-9 leading-relaxed px-4">
        {message}
      </Text>
      
      {/* Optional action button */}
      {actionLabel && onAction && (
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
          <Button
            size="3"
            onClick={onAction}
            aria-label={actionLabel}
            className="relative bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 border-none rounded-2xl px-6 sm:px-8 py-3 sm:py-4 font-bold shadow-2xl transform hover:scale-105 transition-all min-h-[44px]"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
});
