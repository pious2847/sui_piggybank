import {
  useSignAndExecuteTransaction,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Text, TextField } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { getPiggyBankFields } from "./PiggyBankDisplay";
const SUI_CLOCK_OBJECT_ID = "0x6";

// Helper to convert SUI to MIST
const SUI_TO_MIST = 1_000_000_000;

export function PiggyBankActions({ bankId, onAction }: { bankId: string; onAction?: () => void }) {

    const { data, isPending: isQueryPending } = useSuiClientQuery("getObject", {
    id: bankId,
    options: { showContent: true, showOwner: true },
  });
  let canBreak = false;
  let breakReason = "";
  if (data?.data) {
  const fields = getPiggyBankFields(data.data);

    if (fields) {
      const balance = Number(fields.balance);
      const goal = Number(fields.goal_amount);
      const unlockTimestampMs = Number(fields.unlock_timestamp_ms);
      const now = Date.now();
      if (balance < goal) {
        breakReason = "Savings goal not met.";
      } else if (now < unlockTimestampMs) {
        breakReason = "Unlock date not reached.";
      } else {
        canBreak = true;
      }
    }
  }
  
    const counterPackageId = useNetworkVariable("counterPackageId");
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("1.0"); // Default deposit amount in SUI
  const [showConfirmBreak, setShowConfirmBreak] = useState(false);

  // Deposit: uses splitCoins to create a new coin of the specified amount
  function deposit() {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    
    setPendingAction("deposit");
    const tx = new Transaction();
    
    // Convert SUI string to MIST BigInt for accuracy
    const amountInMist = BigInt(Math.floor(parseFloat(depositAmount) * SUI_TO_MIST));

    // 1. Split the required amount from the user's gas coin.
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountInMist)]);

    // 2. Call the deposit function with the piggy bank and the new coin.
    tx.moveCall({
      arguments: [tx.object(bankId), coin],
      target: `${counterPackageId}::counter::deposit`,
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          onAction?.();
          setDepositAmount("1.0"); // Reset to default
        },
        onSettled: () => {
          setPendingAction(null);
        }
      },
    );
  }

  // Break PiggyBank: uses the constant SUI_CLOCK_OBJECT_ID
  function breakBank() {
    setPendingAction("break");
    setShowConfirmBreak(false);
    const tx = new Transaction();
    tx.moveCall({
      arguments: [tx.object(bankId), tx.object(SUI_CLOCK_OBJECT_ID)],
      target: `${counterPackageId}::counter::break_piggy_bank`,
    });
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          onAction?.();
        },
        onSettled: () => {
          setPendingAction(null);
        }
      },
    );
  }

  const quickAmounts = [0.1, 0.5, 1.0, 2.0, 5.0];

  return (
    <div className="space-y-6">
      {/* Deposit Section */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-white/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">💰</div>
          <div>
            <Text size="4" weight="bold" style={{ color: "white" }}>
              Deposit SUI
            </Text>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Add funds to your piggy bank
            </Text>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="mb-4">
          <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }} className="block mb-2">
            Quick amounts:
          </Text>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setDepositAmount(amount.toString())}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  depositAmount === amount.toString()
                    ? 'bg-white/20 text-white border border-white/40'
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/15'
                }`}
              >
                {amount} SUI
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-3">
          <label className="block">
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Custom amount (SUI):
            </Text>
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="Enter SUI amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="0.000000001"
              step="0.1"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <span className="text-white/60 font-medium">SUI</span>
            </div>
          </div>
          <Text size="1" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
            ≈ {(parseFloat(depositAmount || "0") * SUI_TO_MIST).toLocaleString()} MIST
          </Text>
        </div>

        {/* Deposit Button */}
        <Button
          size="3"
          onClick={deposit}
          disabled={isPending || !depositAmount || parseFloat(depositAmount) <= 0}
          style={{
            width: "100%",
            marginTop: "16px",
            background: isPending && pendingAction === 'deposit'
              ? "rgba(255, 255, 255, 0.1)"
              : "linear-gradient(45deg, #10b981, #3b82f6)",
            border: "none",
            borderRadius: "12px",
            padding: "12px",
          }}
        >
          {isPending && pendingAction === 'deposit' ? (
            <Flex align="center" gap="2">
              <ClipLoader size={16} color="white" />
              <span>Depositing...</span>
            </Flex>
          ) : (
            <Flex align="center" gap="2">
              <span>💳</span>
              <span>Deposit {depositAmount} SUI</span>
            </Flex>
          )}
        </Button>
      </div>

      {/* Break Bank Section */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🔨</div>
          <div>
            <Text size="4" weight="bold" style={{ color: "white" }}>
              Break Piggy Bank
            </Text>
            <Text size="2" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Withdraw all funds and destroy the bank
            </Text>
          </div>
        </div>

        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3 mb-4">
          <Text size="2" style={{ color: "#fca5a5" }}>
            ⚠️ Warning: This action cannot be undone. All funds will be withdrawn and the piggy bank will be permanently destroyed.
          </Text>
        </div>

           {!showConfirmBreak ? (
          <>
            <Button
              size="3"
              onClick={() => setShowConfirmBreak(true)}
              disabled={isPending || !canBreak || isQueryPending}
              style={{
                width: "100%",
                background: "linear-gradient(45deg, #ef4444, #f97316)",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                opacity: !canBreak ? 0.5 : 1,
              }}
            >
              <Flex align="center" gap="2">
                <span>🔨</span>
                <span>Break Piggy Bank</span>
              </Flex>
            </Button>
            {!canBreak && breakReason && (
              <Text size="2" style={{ color: "#fca5a5", marginTop: 8 }}>
                {breakReason}
              </Text>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <Text size="2" style={{ color: "white" }} className="block text-center">
              Are you absolutely sure?
            </Text>
        <div className="grid grid-cols-2 gap-3">
              <Button
                size="2"
                variant="ghost"
                onClick={() => setShowConfirmBreak(false)}
                disabled={isPending}
                style={{ color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Cancel
              </Button>
              <Button
                size="2"
                onClick={breakBank}
                disabled={isPending || !canBreak || isQueryPending}
                style={{
                  background: isPending && pendingAction === 'break'
                    ? "rgba(255, 255, 255, 0.1)"
                    : "#ef4444",
                  border: "none",
                  opacity: !canBreak ? 0.5 : 1,
                }}
              >
                {isPending && pendingAction === 'break' ? (
                  <ClipLoader size={14} color="white" />
                ) : (
                  "Yes, Break It"
                )}
              </Button>
            </div>
            {!canBreak && breakReason && (
              <Text size="2" style={{ color: "#fca5a5", marginTop: 8 }}>
                {breakReason}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
}