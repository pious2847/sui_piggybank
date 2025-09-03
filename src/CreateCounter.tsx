import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import ClipLoader from "react-spinners/ClipLoader";

export function CreatePiggyBank({
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

  function create() {
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
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="space-y-6">
        {/* Goal Amount Input */}
        <div className="space-y-3">
          <label className="block">
            <Text weight="bold" size="3" style={{ color: "white" }}>
              🎯 Savings Goal (SUI)
            </Text>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              How much SUI do you want to save?
            </Text>
          </label>
          <div className="relative">
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={goalAmount}
              onChange={e => setGoalAmount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              placeholder="Enter goal amount"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-white/60 font-medium">SUI</span>
            </div>
          </div>
          <Text size="2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            ≈ {(goalAmount * SUI_TO_MIST).toLocaleString()} MIST
          </Text>
        </div>

        {/* Unlock Date Input */}
        <div className="space-y-3">
          <label className="block">
            <Text weight="bold" size="3" style={{ color: "white" }}>
              📅 Unlock Date
            </Text>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              When can you withdraw your savings?
            </Text>
          </label>
          <input
            type="datetime-local"
            value={unlockDate}
            onChange={e => setUnlockDate(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
          />
          <Text size="2" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            {new Date(unlockDate).toLocaleDateString()} at {new Date(unlockDate).toLocaleTimeString()}
          </Text>
        </div>

        {/* Preview Card */}
        <div className="bg-gradient-to-r from-pink-500/20 to-yellow-500/20 border border-white/30 rounded-xl p-4">
          <Text size="2" weight="bold" style={{ color: "white" }} className="block mb-2">
            📋 Summary
          </Text>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Goal:</span>
              <span className="text-white">{goalAmount} SUI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Unlocks:</span>
              <span className="text-white">{new Date(unlockDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Duration:</span>
              <span className="text-white">
                {Math.ceil((new Date(unlockDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          size="4"
          onClick={create}
          disabled={isSuccess || isPending || !goalAmount || goalAmount <= 0}
          style={{
            width: "100%",
            background: isPending 
              ? "rgba(255, 255, 255, 0.1)" 
              : "linear-gradient(45deg, #ff6b6b, #4ecdc4)",
            border: "none",
            borderRadius: "12px",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          {isPending ? (
            <Flex align="center" gap="2">
              <ClipLoader size={20} color="white" />
              <span>Creating Your Bank...</span>
            </Flex>
          ) : (
            <Flex align="center" gap="2">
              <span>🏗️</span>
              <span>Create Piggy Bank</span>
            </Flex>
          )}
        </Button>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <Text style={{ color: "#ff6b6b" }}>
              ❌ Error: {error.message}
            </Text>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <Text style={{ color: "#4ade80" }} weight="bold">
              Piggy Bank Created Successfully!
            </Text>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Your savings journey begins now!
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}