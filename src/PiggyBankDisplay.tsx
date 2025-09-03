import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Container, Flex, Text, Progress } from "@radix-ui/themes";

export function getPiggyBankFields(data: any) {
  if (data.content?.dataType !== "moveObject") return null;
  return data.content.fields as {
    owner: string;
    balance: string;
    goal_amount: string;
    unlock_timestamp_ms: string;
  };
}

export function PiggyBankDisplay({ bankId }: { bankId: string }) {
  const { data, isPending, error } = useSuiClientQuery("getObject", {
    id: bankId,
    options: { showContent: true, showOwner: true },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
        <Text style={{ color: "#ff6b6b" }}>Error: {error.message}</Text>
      </div>
    );
  }

  if (!data.data) {
    return (
      <div className="text-center py-8">
        <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>PiggyBank not found</Text>
      </div>
    );
  }

  const fields = getPiggyBankFields(data.data);
  if (!fields) {
    return (
      <div className="text-center py-8">
        <Text style={{ color: "rgba(255, 255, 255, 0.7)" }}>Invalid PiggyBank object</Text>
      </div>
    );
  }

  const SUI_TO_MIST = 1_000_000_000;
  const balanceSUI = Number(fields.balance) / SUI_TO_MIST;
  const goalSUI = Number(fields.goal_amount) / SUI_TO_MIST;
  const progressPercentage = Math.min((balanceSUI / goalSUI) * 100, 100);
  const unlockDate = new Date(Number(fields.unlock_timestamp_ms));
  const isUnlocked = Date.now() >= unlockDate.getTime();
  const daysUntilUnlock = Math.ceil((unlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 p-1">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-1">
                  {progressPercentage >= 100 ? '🎉' : progressPercentage >= 75 ? '🐷' : progressPercentage >= 50 ? '💰' : '🪙'}
                </div>
                <Text size="1" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {progressPercentage.toFixed(0)}%
                </Text>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 mb-6">
          <Text size="4" weight="bold" style={{ color: "white" }}>
            {balanceSUI.toFixed(4)} SUI
          </Text>
          <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)" }} className="block">
            of {goalSUI.toFixed(4)} SUI goal
          </Text>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-3 mb-4">
          <div 
            className="h-3 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">💰</div>
            <Text size="2" weight="bold" style={{ color: "white" }}>
              Current Balance
            </Text>
          </div>
          <Text size="4" weight="bold" style={{ color: "#4ade80" }}>
            {balanceSUI.toFixed(6)} SUI
          </Text>
          <Text size="1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            {Number(fields.balance).toLocaleString()} MIST
          </Text>
        </div>

        {/* Goal Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">🎯</div>
            <Text size="2" weight="bold" style={{ color: "white" }}>
              Savings Goal
            </Text>
          </div>
          <Text size="4" weight="bold" style={{ color: "#fbbf24" }}>
            {goalSUI.toFixed(6)} SUI
          </Text>
          <Text size="1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            {Number(fields.goal_amount).toLocaleString()} MIST
          </Text>
        </div>

        {/* Unlock Status Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{isUnlocked ? '🔓' : '🔒'}</div>
            <Text size="2" weight="bold" style={{ color: "white" }}>
              Lock Status
            </Text>
          </div>
          <Text size="3" weight="bold" style={{ 
            color: isUnlocked ? "#4ade80" : "#fbbf24" 
          }}>
            {isUnlocked ? 'Unlocked' : `${daysUntilUnlock} days left`}
          </Text>
          <Text size="1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            {unlockDate.toLocaleDateString()}
          </Text>
        </div>

        {/* Owner Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">👤</div>
            <Text size="2" weight="bold" style={{ color: "white" }}>
              Owner
            </Text>
          </div>
          <Text size="2" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
            {fields.owner.slice(0, 6)}...{fields.owner.slice(-4)}
          </Text>
          <Text size="1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            Wallet Address
          </Text>
        </div>
      </div>

      {/* Bank ID */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">🆔</div>
          <Text size="2" weight="bold" style={{ color: "white" }}>
            Bank ID
          </Text>
        </div>
        <Text size="1" style={{ 
          color: "rgba(255, 255, 255, 0.6)",
          wordBreak: "break-all",
          fontFamily: "monospace"
        }}>
          {bankId}
        </Text>
      </div>

      {/* Achievement Badge */}
      {progressPercentage >= 100 && (
        <div className="bg-gradient-to-r from-pink-500/20 to-yellow-500/20 border border-white/30 rounded-xl p-6 text-center">
          <div className="text-6xl mb-3">🏆</div>
          <Text size="4" weight="bold" style={{ color: "white" }}>
            Goal Achieved!
          </Text>
          <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Congratulations! You've reached your savings goal.
          </Text>
        </div>
      )}
    </div>
  );
}