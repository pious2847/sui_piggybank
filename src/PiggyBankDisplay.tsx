import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Text } from "@radix-ui/themes";
import { LoadingSpinner } from "./LoadingSpinner";
import { memo, useMemo } from "react";
import { objectDetailsQueryConfig, getPiggyBankDetailsQueryKey } from "./queryConfig";

export function getPiggyBankFields(data: any) {
  if (!data || data.content?.dataType !== "moveObject") return null;
  const fields = data.content?.fields;
  if (!fields) return null;
  
  // Validate required fields exist
  if (!fields.owner || fields.balance === undefined || !fields.goal_amount || !fields.unlock_timestamp_ms) {
    console.warn('Missing required fields:', { fields });
    return null;
  }
  
  // Balance<SUI> is an object with a value property
  // Extract the actual balance value
  const balanceValue = typeof fields.balance === 'object' && fields.balance !== null
    ? fields.balance.value || '0'
    : fields.balance;
  
  return {
    owner: fields.owner,
    balance: balanceValue,
    goal_amount: fields.goal_amount,
    unlock_timestamp_ms: fields.unlock_timestamp_ms,
  } as {
    owner: string;
    balance: string;
    goal_amount: string;
    unlock_timestamp_ms: string;
  };
}

const PiggyBankDisplay = memo(function PiggyBankDisplay({ bankId }: { bankId: string }) {
  const { data, isPending, error } = useSuiClientQuery(
    "getObject",
    {
      id: bankId,
      options: { showContent: true, showOwner: true },
    },
    {
      ...objectDetailsQueryConfig,
      // Use unique query key for proper cache isolation
      queryKey: getPiggyBankDetailsQueryKey(bankId),
    }
  );

  // Extract fields safely
  const fields = data?.data ? getPiggyBankFields(data.data) : null;
  
  const SUI_TO_MIST = 1_000_000_000;
  
  // Memoize expensive calculations with error handling - MUST be called before any returns
  const { balanceSUI, goalSUI, progressPercentage, unlockDate, isUnlocked, daysUntilUnlock } = useMemo(() => {
    if (!fields) {
      return {
        balanceSUI: 0,
        goalSUI: 1,
        progressPercentage: 0,
        unlockDate: new Date(),
        isUnlocked: false,
        daysUntilUnlock: 0
      };
    }

    try {
      const balanceNum = Number(fields.balance || 0);
      const goalNum = Number(fields.goal_amount || 1);
      const timestampNum = Number(fields.unlock_timestamp_ms || Date.now());
      
      // Debug logging
      console.log('PiggyBank Debug:', {
        balanceRaw: fields.balance,
        balanceNum,
        goalRaw: fields.goal_amount,
        goalNum,
        timestampRaw: fields.unlock_timestamp_ms,
        timestampNum,
        currentTime: Date.now(),
      });
      
      const balanceSUI = balanceNum / SUI_TO_MIST;
      const goalSUI = goalNum / SUI_TO_MIST;
      const progressPercentage = goalSUI > 0 ? Math.min((balanceSUI / goalSUI) * 100, 100) : 0;
      const unlockDate = new Date(timestampNum);
      const isUnlocked = Date.now() >= unlockDate.getTime();
      const daysUntilUnlock = Math.max(0, Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      
      console.log('PiggyBank Calculated:', {
        balanceSUI,
        goalSUI,
        progressPercentage,
        unlockDate: unlockDate.toISOString(),
        isUnlocked,
        daysUntilUnlock,
      });
      
      return { balanceSUI, goalSUI, progressPercentage, unlockDate, isUnlocked, daysUntilUnlock };
    } catch (error) {
      console.error('Error calculating piggy bank values:', error);
      return {
        balanceSUI: 0,
        goalSUI: 1,
        progressPercentage: 0,
        unlockDate: new Date(),
        isUnlocked: false,
        daysUntilUnlock: 0
      };
    }
  }, [fields?.balance, fields?.goal_amount, fields?.unlock_timestamp_ms]);

  // Now we can safely do conditional returns after all hooks are called
  if (isPending) {
    return <LoadingSpinner size="lg" message="Loading bank details..." />;
  }

  if (error) {
    return (
      <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-6" role="alert" aria-live="assertive">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">⚠️</span>
          <Text className="text-red-400 font-semibold">Error: {error.message}</Text>
        </div>
      </div>
    );
  }

  if (!data || !data.data) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <Text className="text-slate-400 text-lg">PiggyBank not found</Text>
      </div>
    );
  }

  if (!fields) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❓</div>
        <Text className="text-slate-400 text-lg">Invalid PiggyBank object</Text>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      {/* Progress Section */}
      <div className="text-center">
        <div className="relative inline-block mb-4 sm:mb-5 md:mb-6">
          {/* Glow effect with pulse animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-30 animate-pulse"></div>
          
          {/* SVG Circular Progress Ring */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-40 lg:h-40">
            <svg className="w-32 h-32 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-40 lg:h-40 transform -rotate-90" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - Math.max(0, Math.min(100, progressPercentage)) / 100)}`}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))'
                }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl mb-1 sm:mb-2" aria-hidden="true">
                  {progressPercentage >= 100 ? '🎉' : progressPercentage >= 75 ? '🐷' : progressPercentage >= 50 ? '💰' : '🪙'}
                </div>
                <Text size="3" weight="bold" className="text-white text-base sm:text-lg">
                  {Math.max(0, Math.min(100, progressPercentage)).toFixed(0)}%
                </Text>
              </div>
            </div>
          </div>
        </div>
        
        {/* Current balance and goal below circle */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <Text size="7" weight="bold" className="text-white block mb-2 text-2xl sm:text-3xl md:text-4xl lg:text-3xl">
            {balanceSUI.toFixed(4)} SUI
          </Text>
          <Text size="3" className="text-slate-400 text-sm sm:text-base md:text-lg lg:text-base">
            of {goalSUI.toFixed(4)} SUI goal
          </Text>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-white/5 rounded-full h-3 sm:h-4 mb-2 overflow-hidden border border-white/10">
          <div 
            className="h-3 sm:h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-lg relative"
            style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <Text size="2" className="text-slate-500 text-xs sm:text-sm">
          {(goalSUI - balanceSUI).toFixed(4)} SUI remaining
        </Text>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Balance Card - Emerald Theme */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl" aria-hidden="true">💰</div>
              <div>
                <Text size="1" className="text-slate-400 uppercase tracking-wider block mb-1 text-xs">
                  Current Balance
                </Text>
              </div>
            </div>
            <Text size="6" weight="bold" className="text-emerald-400 block mb-2 text-lg sm:text-xl">
              {balanceSUI.toFixed(6)} SUI
            </Text>
            <Text size="2" className="text-slate-500 font-mono text-xs sm:text-sm">
              {Number(fields.balance).toLocaleString()} MIST
            </Text>
          </div>
        </div>

        {/* Goal Card - Amber Theme */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 hover:border-amber-500/50 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl" aria-hidden="true">🎯</div>
              <div>
                <Text size="1" className="text-slate-400 uppercase tracking-wider block mb-1 text-xs">
                  Savings Goal
                </Text>
              </div>
            </div>
            <Text size="6" weight="bold" className="text-amber-400 block mb-2 text-lg sm:text-xl">
              {goalSUI.toFixed(6)} SUI
            </Text>
            <Text size="2" className="text-slate-500 font-mono text-xs sm:text-sm">
              {Number(fields.goal_amount).toLocaleString()} MIST
            </Text>
          </div>
        </div>

        {/* Unlock Status Card - Violet/Emerald Theme */}
        <div className="group relative">
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            isUnlocked ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20' : 'bg-gradient-to-br from-violet-500/20 to-purple-500/20'
          }`} />
          <div className={`relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 hover:bg-white/10 transition-all duration-300 ${
            isUnlocked ? 'hover:border-emerald-500/50' : 'hover:border-violet-500/50'
          }`}>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl" aria-hidden="true">{isUnlocked ? '🔓' : '🔒'}</div>
              <div>
                <Text size="1" className="text-slate-400 uppercase tracking-wider block mb-1 text-xs">
                  Lock Status
                </Text>
              </div>
            </div>
            <Text size="5" weight="bold" className={`block mb-2 text-base sm:text-lg ${
              isUnlocked ? 'text-emerald-400' : 'text-violet-400'
            }`}>
              {isUnlocked ? 'Unlocked' : `${daysUntilUnlock} days left`}
            </Text>
            <Text size="2" className="text-slate-500 text-xs sm:text-sm">
              Unlocks: {unlockDate.toLocaleDateString()}
            </Text>
          </div>
        </div>

        {/* Owner Card - Cyan Theme */}
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
          <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="text-3xl sm:text-4xl" aria-hidden="true">👤</div>
              <div>
                <Text size="1" className="text-slate-400 uppercase tracking-wider block mb-1 text-xs">
                  Owner
                </Text>
              </div>
            </div>
            <Text size="4" weight="bold" className="text-cyan-400 font-mono block mb-2 break-all text-sm sm:text-base">
              {fields.owner.slice(0, 6)}...{fields.owner.slice(-4)}
            </Text>
            <Text size="2" className="text-slate-500 text-xs sm:text-sm">
              Wallet Address
            </Text>
          </div>
        </div>
      </div>

      {/* Bank ID - Full Width Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 md:p-6 hover:border-slate-500/50 hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="text-2xl sm:text-3xl" aria-hidden="true">🆔</div>
            <Text size="1" className="text-slate-400 uppercase tracking-wider text-xs">
              Bank ID
            </Text>
          </div>
          <Text size="2" className="text-slate-300 break-all font-mono leading-relaxed text-xs sm:text-sm">
            {bankId}
          </Text>
        </div>
      </div>

      {/* Achievement Badge - Only shown when goal is 100% complete */}
      {progressPercentage >= 100 && (
        <div className="relative group" role="status" aria-live="polite">
          {/* Strong glow effect with pulse animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-3xl opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
          
          {/* Achievement card with gradient background */}
          <div className="relative backdrop-blur-sm bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 md:p-10 text-center shadow-2xl hover:border-emerald-400/70 transition-all duration-300">
            {/* Trophy emoji with bounce animation */}
            <div className="text-6xl sm:text-7xl md:text-8xl mb-3 sm:mb-4 animate-bounce inline-block" aria-hidden="true">🏆</div>
            
            {/* Congratulatory message */}
            <Text size="6" weight="bold" className="text-white block mb-2 sm:mb-3 text-xl sm:text-2xl">
              Goal Achieved!
            </Text>
            <Text size="4" className="text-emerald-300 text-base sm:text-lg">
              Congratulations! You've reached your savings goal.
            </Text>
          </div>
        </div>
      )}
    </div>
  );
});

export { PiggyBankDisplay };
export default PiggyBankDisplay;