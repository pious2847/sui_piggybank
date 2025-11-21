import {
  useSignAndExecuteTransaction,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useState, useCallback, useMemo, memo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import ClipLoader from "react-spinners/ClipLoader";
import { getPiggyBankFields } from "./PiggyBankDisplay";
import { actionValidationQueryConfig, getPiggyBankActionsQueryKey, getPiggyBankDetailsQueryKey } from "./queryConfig";
const SUI_CLOCK_OBJECT_ID = "0x6";

// Helper to convert SUI to MIST
const SUI_TO_MIST = 1_000_000_000;

const PiggyBankActions = memo(function PiggyBankActions({ bankId, onAction }: { bankId: string; onAction?: () => void }) {
  const queryClient = useQueryClient();

  const { data, isPending: isQueryPending } = useSuiClientQuery(
    "getObject",
    {
      id: bankId,
      options: { showContent: true, showOwner: true },
    },
    {
      ...actionValidationQueryConfig,
      // Use unique query key for proper cache isolation
      queryKey: getPiggyBankActionsQueryKey(bankId),
    }
  );

  // Memoize break bank validation logic
  const { canBreak, breakReason } = useMemo(() => {
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

    return { canBreak, breakReason };
  }, [data]);

  const counterPackageId = useNetworkVariable("counterPackageId");
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("1.0"); // Default deposit amount in SUI
  const [showConfirmBreak, setShowConfirmBreak] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [isBroken, setIsBroken] = useState(false); // Track if bank has been broken

  // Deposit: uses splitCoins to create a new coin of the specified amount
  const deposit = useCallback(() => {
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
        onSuccess: (result) => {
          console.log('Deposit successful!', {
            digest: result.digest,
            bankId,
            amount: depositAmount,
            explorerLink: `https://suiscan.xyz/testnet/tx/${result.digest}`,
          });
          
          // Show success message
          setDepositSuccess(true);
          setTimeout(() => setDepositSuccess(false), 3000);
          
          // Wait a bit for blockchain to update, then invalidate queries
          setTimeout(() => {
            console.log('Invalidating queries for bankId:', bankId);
            queryClient.invalidateQueries({ queryKey: getPiggyBankDetailsQueryKey(bankId) });
            queryClient.invalidateQueries({ queryKey: getPiggyBankActionsQueryKey(bankId) });
            onAction?.();
          }, 1500); // 1.5 second delay
          
          setDepositAmount("1.0"); // Reset to default
        },
        onError: (error) => {
          console.error('Deposit failed:', error);
          alert(`Deposit failed: ${error.message}`);
        },
        onSettled: () => {
          setPendingAction(null);
        }
      },
    );
  }, [depositAmount, bankId, counterPackageId, signAndExecute, onAction, queryClient]);

  // Break PiggyBank: uses the constant SUI_CLOCK_OBJECT_ID
  const breakBank = useCallback(() => {
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
        onSuccess: (result) => {
          console.log('Piggy bank broken successfully!', {
            digest: result.digest,
            bankId,
            explorerLink: `https://suiscan.xyz/testnet/tx/${result.digest}`,
          });
          
          // Mark as broken to prevent further actions
          setIsBroken(true);
          
          // Wait a bit before invalidating to allow blockchain to update
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: getPiggyBankDetailsQueryKey(bankId) });
            queryClient.invalidateQueries({ queryKey: getPiggyBankActionsQueryKey(bankId) });
            onAction?.();
          }, 1500);
        },
        onError: (error) => {
          console.error('Break bank failed:', error);
          // Check if error is because bank was already deleted
          if (error.message.includes('deleted') || error.message.includes('does not exist')) {
            setIsBroken(true);
            alert('This piggy bank has already been broken and no longer exists.');
          } else {
            alert(`Failed to break piggy bank: ${error.message}`);
          }
        },
        onSettled: () => {
          setPendingAction(null);
        }
      },
    );
  }, [bankId, counterPackageId, signAndExecute, onAction, queryClient]);

  const quickAmounts = useMemo(() => [0.1, 0.5, 1.0, 2.0, 5.0], []);

  // If bank is broken, show message
  if (isBroken) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-emerald-300 mb-2">
          Piggy Bank Broken!
        </h3>
        <Text className="text-slate-400 mb-4">
          Your funds have been withdrawn and the piggy bank has been destroyed.
        </Text>
        <Text className="text-slate-500 text-sm">
          This piggy bank no longer exists on the blockchain.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8">
      {/* Deposit Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 rounded-3xl p-4 sm:p-6 md:p-7 lg:p-8 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-4xl sm:text-5xl" aria-hidden="true">💰</div>
            <div>
              <Text size="5" weight="bold" className="text-white block mb-1 text-lg sm:text-xl">
                Deposit SUI
              </Text>
              <Text size="3" className="text-slate-400 text-sm sm:text-base">
                Add funds to your piggy bank
              </Text>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="mb-4 sm:mb-5 md:mb-6">
            <Text size="2" className="text-slate-400 block mb-3 font-semibold text-xs sm:text-sm md:text-base">
              Quick amounts:
            </Text>
            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-3">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDepositAmount(amount.toString())}
                  aria-label={`Quick deposit ${amount} SUI`}
                  aria-pressed={depositAmount === amount.toString()}
                  className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all transform hover:scale-105 min-h-[44px] ${depositAmount === amount.toString()
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/50'
                      : 'bg-white/5 text-slate-300 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                >
                  {amount} SUI
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-3 sm:space-y-4 md:space-y-4">
            <label className="block">
              <Text size="2" className="text-slate-400 font-semibold text-xs sm:text-sm md:text-base">
                Custom amount (SUI):
              </Text>
            </label>
            <div className="relative group/input">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
              <input
                type="number"
                placeholder="Enter SUI amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="0.000000001"
                step="0.1"
                className="relative w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-base sm:text-lg placeholder-white/40 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all min-h-[44px]"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 sm:pr-6">
                <span className="text-slate-400 font-semibold text-base sm:text-lg">SUI</span>
              </div>
            </div>
            <Text size="2" className="text-slate-500 text-xs sm:text-sm">
              ≈ {(parseFloat(depositAmount || "0") * SUI_TO_MIST).toLocaleString()} MIST
            </Text>
          </div>

          {/* Success Message */}
          {depositSuccess && (
            <div className="backdrop-blur-xl bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <Text className="text-emerald-300 font-semibold text-sm">
                    Deposit Successful!
                  </Text>
                  <Text className="text-emerald-400/80 text-xs">
                    Balance will update in a moment...
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Deposit Button */}
          <div className="relative group/button mt-4 sm:mt-6">
            <Button
              size="4"
              onClick={deposit}
              disabled={isPending || !depositAmount || parseFloat(depositAmount) <= 0}
              aria-label={`Deposit ${depositAmount} SUI to piggy bank`}
              className="relative w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700 border-none rounded-2xl py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl transform hover:scale-[1.02] transition-all min-h-[44px]"
            >
              {isPending && pendingAction === 'deposit' ? (
                <Flex align="center" gap="3">
                  <ClipLoader size={20} color="white" />
                  <span className="text-sm sm:text-base">Depositing...</span>
                </Flex>
              ) : (
                <Flex align="center" gap="3">
                  <span className="text-xl sm:text-2xl" aria-hidden="true">💳</span>
                  <span className="text-sm sm:text-base">Deposit {depositAmount} SUI</span>
                </Flex>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Break Bank Section */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-3xl p-4 sm:p-6 md:p-7 lg:p-8 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-4xl sm:text-5xl" aria-hidden="true">🔨</div>
            <div>
              <Text size="5" weight="bold" className="text-white block mb-1 text-lg sm:text-xl">
                Break Piggy Bank
              </Text>
              <Text size="3" className="text-slate-400 text-sm sm:text-base">
                Withdraw all funds and destroy the bank
              </Text>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-red-500/20 border border-red-500/40 rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl" aria-hidden="true">⚠️</span>
              <Text size="3" className="text-red-300 leading-relaxed text-sm sm:text-base">
                Warning: This action cannot be undone. All funds will be withdrawn and the piggy bank will be permanently destroyed.
              </Text>
            </div>
          </div>

          {!showConfirmBreak ? (
            <>
              <div className="relative group/button">
                <Button
                  size="4"
                  onClick={() => setShowConfirmBreak(true)}
                  disabled={isPending || !canBreak || isQueryPending}
                  aria-label="Break piggy bank and withdraw all funds"
                  aria-disabled={!canBreak}
                  className="relative w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-slate-700 disabled:to-slate-700 border-none rounded-2xl py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl transform hover:scale-[1.02] transition-all min-h-[44px]"
                  style={{ opacity: !canBreak ? 0.5 : 1 }}
                >
                  <Flex align="center" gap="3">
                    <span className="text-xl sm:text-2xl" aria-hidden="true">🔨</span>
                    <span className="text-sm sm:text-base">Break Piggy Bank</span>
                  </Flex>
                </Button>
              </div>
              {!canBreak && breakReason && (
                <div className="mt-3 sm:mt-4 backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4">
                  <Text size="2" className="text-red-400 text-center block text-xs sm:text-sm">
                    {breakReason}
                  </Text>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 text-center">
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3" aria-hidden="true">⚠️</div>
                <Text size="4" weight="bold" className="text-white block mb-2 text-base sm:text-lg">
                  Are you absolutely sure?
                </Text>
                <Text size="2" className="text-slate-400 text-xs sm:text-sm">
                  This will permanently destroy your piggy bank
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button
                  size="3"
                  variant="ghost"
                  onClick={() => setShowConfirmBreak(false)}
                  disabled={isPending}
                  aria-label="Cancel breaking piggy bank"
                  className="backdrop-blur-xl bg-white/5 text-white border-2 border-white/20 hover:bg-white/10 rounded-xl py-3 sm:py-4 font-semibold transition-all text-sm sm:text-base min-h-[44px]"
                >
                  Cancel
                </Button>
                <div className="relative group/confirm">
                  <Button
                    size="3"
                    onClick={breakBank}
                    disabled={isPending || !canBreak || isQueryPending}
                    aria-label="Confirm breaking piggy bank"
                    aria-disabled={!canBreak}
                    className="relative w-full bg-red-500 hover:bg-red-600 disabled:bg-slate-700 border-none rounded-xl py-3 sm:py-4 font-bold shadow-xl transition-all text-sm sm:text-base min-h-[44px]"
                    style={{ opacity: !canBreak ? 0.5 : 1 }}
                  >
                    {isPending && pendingAction === 'break' ? (
                      <ClipLoader size={18} color="white" />
                    ) : (
                      "Yes, Break It"
                    )}
                  </Button>
                </div>
              </div>
              {!canBreak && breakReason && (
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4">
                  <Text size="2" className="text-red-400 text-center block text-xs sm:text-sm">
                    {breakReason}
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export { PiggyBankActions };
export default PiggyBankActions;