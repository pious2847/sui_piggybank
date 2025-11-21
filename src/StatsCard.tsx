import { Text, Heading } from "@radix-ui/themes";
import { memo } from "react";

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  gradientFrom: string;
  gradientTo: string;
}

export const StatsCard = memo(function StatsCard({ icon, label, value, gradientFrom, gradientTo }: StatsCardProps) {
  return (
    <div className="group relative">
      {/* Hover glow effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      
      {/* Glass morphism card */}
      <div 
        className={`relative backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6 sm:p-7 md:p-8 shadow-2xl transition-all duration-300 hover:border-opacity-50 transform hover:-translate-y-1 hover:scale-[1.02]`}
        style={{
          borderColor: `rgba(255, 255, 255, 0.1)`,
        }}
      >
        <div className="text-center">
          {/* Icon with scale animation on hover */}
          <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 md:mb-4 transform transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
            {icon}
          </div>
          
          {/* Label */}
          <Text 
            size="2" 
            className="text-slate-400 uppercase tracking-wider text-xs md:text-sm font-semibold mb-2 block"
          >
            {label}
          </Text>
          
          {/* Value */}
          <Heading size="7" className="text-white font-bold text-xl sm:text-2xl md:text-2xl">
            {value}
          </Heading>
        </div>
      </div>
    </div>
  );
});
