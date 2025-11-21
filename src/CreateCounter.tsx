import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useState, useCallback, memo } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";

const CreatePiggyBank = memo(function CreatePiggyBank({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isSuccess, isPending, error } = useSignAndExecuteTransaction();
  const [showSuccess, setShowSuccess] = useState(false);

  const [goalAmount, setGoalAmount] = useState(1); // 1 SUI
  const [unlockDate, setUnlockDate] = useState(() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });

  const SUI_TO_MIST = 1_000_000_000;

  const create = useCallback(() => {
    setShowSuccess(false);
    const tx = new Transaction();
    const unlockTimestampMs = new Date(unlockDate).getTime();
    const goalAmountMist = BigInt(goalAmount * SUI_TO_MIST);

    tx.moveCall({
      arguments: [tx.pure.u64(goalAmountMist.toString()), tx.pure.u64(unlockTimestampMs)],
      target: `${counterPackageId}::counter::create`,
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: async ({ digest }) => {
          const { effects } = await suiClient.waitForTransaction({
            digest,
            options: { showEffects: true },
          });
          setShowSuccess(true);
          onCreated(effects?.created?.[0]?.reference?.objectId!);
        },
      },
    );
  }, [goalAmount, unlockDate, counterPackageId, signAndExecute, suiClient, onCreated]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6 sm:space-y-7 md:space-y-8">
        {/* Goal Amount Input */}
        <div className="space-y-3 sm:space-y-4 md:space-y-4">
          <label className="block">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl md:text-3xl" aria-hidden="true">🎯</span>
              <Text weight="bold" size="4" className="text-white text-base sm:text-lg md:text-xl">
                Savings Goal
              </Text>
            </div>
            <Text size="2" className="text-slate-400 text-xs sm:text-sm md:text-base">
              How much SUI do you want to save?
            </Text>
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={goalAmount}
              onChange={e => setGoalAmount(Number(e.target.value))}
              aria-label="Savings goal amount in SUI"
              aria-describedby="goal-amount-helper"
              className="relative w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base sm:text-lg placeholder-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all min-h-[44px]"
              placeholder="Enter goal amount"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-6">
              <span className="text-slate-400 font-semibold text-base sm:text-lg">SUI</span>
            </div>
          </div>
          <Text size="2" className="text-slate-500 text-xs sm:text-sm" id="goal-amount-helper">
            ≈ {(goalAmount * SUI_TO_MIST).toLocaleString()} MIST
          </Text>
        </div>

        {/* Unlock Date Input */}
        <div className="space-y-3 sm:space-y-4 md:space-y-4">
          <label className="block">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl md:text-3xl" aria-hidden="true">📅</span>
              <Text weight="bold" size="4" className="text-white text-base sm:text-lg md:text-xl">
                Unlock Date
              </Text>
            </div>
            <Text size="2" className="text-slate-400 text-xs sm:text-sm md:text-base">
              When can you withdraw your savings?
            </Text>
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <input
              type="datetime-local"
              value={unlockDate}
              onChange={e => setUnlockDate(e.target.value)}
              aria-label="Unlock date and time"
              aria-describedby="unlock-date-helper"
              className="relative w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base sm:text-lg placeholder-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all min-h-[44px]"
            />
          </div>
          <Text size="2" className="text-slate-500 text-xs sm:text-sm" id="unlock-date-helper">
            {new Date(unlockDate).toLocaleDateString()} at {new Date(unlockDate).toLocaleTimeString()}
          </Text>
        </div>

        {/* Preview Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-white/20 rounded-2xl p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-5">
              <span className="text-xl sm:text-2xl md:text-3xl" aria-hidden="true">📋</span>
              <Text size="3" weight="bold" className="text-white text-base sm:text-lg md:text-xl">
                Summary
              </Text>
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-3">
              <div className="flex justify-between items-center p-2.5 sm:p-3 md:p-4 bg-white/5 rounded-xl">
                <span className="text-slate-400 text-sm sm:text-base md:text-base">Goal:</span>
                <span className="text-white font-bold text-base sm:text-lg md:text-xl">{goalAmount} SUI</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 md:p-4 bg-white/5 rounded-xl">
                <span className="text-slate-400 text-sm sm:text-base md:text-base">Unlocks:</span>
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">{new Date(unlockDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 sm:p-3 md:p-4 bg-white/5 rounded-xl">
                <span className="text-slate-400 text-sm sm:text-base md:text-base">Duration:</span>
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                  {Math.ceil((new Date(unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="relative group">
          <Button
            size="4"
            onClick={create}
            disabled={isSuccess || isPending || !goalAmount || goalAmount <= 0}
            aria-label="Create new piggy bank"
            className="relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700 border-none rounded-2xl py-4 sm:py-5 md:py-6 text-base sm:text-lg font-bold shadow-2xl transform hover:scale-[1.02] transition-all min-h-[44px]"
          >
            {isPending ? (
              <Flex align="center" gap="3">
                <ClipLoader size={20} color="white" />
                <span className="text-sm sm:text-base">Creating Your Bank...</span>
              </Flex>
            ) : (
              <Flex align="center" gap="3">
                <span className="text-xl sm:text-2xl" aria-hidden="true">🏗️</span>
                <span className="text-sm sm:text-base">Create Piggy Bank</span>
              </Flex>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-6 animate-fade-in" role="alert" aria-live="assertive">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl" aria-hidden="true">❌</span>
              <div>
                <Text className="text-red-400 font-semibold text-sm sm:text-base">
                  Error: {error.message}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-center animate-fade-in" role="status" aria-live="polite">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce" aria-hidden="true">🎉</div>
            <Text className="text-emerald-400 text-lg sm:text-xl font-bold mb-2">
              Piggy Bank Created Successfully!
            </Text>
            <Text size="3" className="text-slate-400 text-sm sm:text-base">
              Your savings journey begins now!
            </Text>
          </div>
        )}
      </div>
    </div>
  );
});

export { CreatePiggyBank };
export default CreatePiggyBank;