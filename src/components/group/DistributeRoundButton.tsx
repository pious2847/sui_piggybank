import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecute } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { useNetworkVariable } from "../../networkConfig";
import { useGroupSusu } from "../../hooks/useGroupSusu";
import { useQuery } from "@tanstack/react-query";

export interface DistributeRoundButtonProps {
  groupId: string;
  groupName: string;
  onSuccess?: () => void;
}

/**
 * Button component for distributing round payouts
 * Can be called by any participant when the round is complete
 */
export function DistributeRoundButton({
  groupId,
  groupName,
  onSuccess,
}: DistributeRoundButtonProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);
  const { data: groupData } = useGroupSusu(groupId);

  // Check if round is complete by calling the contract function
  const { data: isRoundComplete } = useQuery({
    queryKey: ["isRoundComplete", groupId, counterPackageId],
    queryFn: async () => {
      if (!counterPackageId || !groupId) return false;

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${counterPackageId}::group_susu::is_round_complete`,
          arguments: [tx.object(groupId)],
        });

        // Use devInspectTransactionBlock to read the result without executing
        const response = await suiClient.devInspectTransactionBlock({
          transactionBlock: tx,
          sender: currentAccount?.address || "0x0",
        });

        // Parse the result
        if (response.results && response.results[0]?.returnValues) {
          const returnValue = response.results[0].returnValues[0];
          // The first byte indicates true (1) or false (0)
          return returnValue[0][0] === 1;
        }

        return false;
      } catch (error) {
        console.error("Error checking round completion:", error);
        return false;
      }
    },
    enabled: !!counterPackageId && !!groupId,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const isCycleComplete = groupData?.cycleComplete;

  const handleDistributeRound = () => {
    if (!currentAccount || !counterPackageId) {
      alert("Please connect your wallet first");
      return;
    }

    if (isCycleComplete) {
      alert("This cycle is already complete");
      return;
    }

    // Build the transaction
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${counterPackageId}::group_susu::distribute_round`,
      arguments: [
        tx.object(groupId),
        tx.object("0x6"), // Clock object
      ],
    });

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      invalidateQueries: [
        ["groupSusu", groupId],
        ["allGroups"],
      ],
      successMessage: `Round distributed successfully!`,
      errorMessage: `Failed to distribute round`,
      onSuccess: () => {
        onSuccess?.();
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const handleRetry = () => {
    reset();
    handleDistributeRound();
  };

  if (isCycleComplete) {
    return (
      <Button disabled size="3" className="w-full bg-slate-700">
        Cycle Complete ✓
      </Button>
    );
  }

  // Show waiting message if round is not complete
  if (!isRoundComplete) {
    return (
      <div className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex items-center gap-2 text-amber-300">
          <span className="text-xl">⏳</span>
          <div>
            <p className="font-semibold text-sm">Waiting for Contributions</p>
            <p className="text-xs text-amber-400/80">
              All participants must contribute before distributing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Button
        size="3"
        onClick={handleDistributeRound}
        disabled={!currentAccount || status === "pending"}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700"
      >
        {status === "pending" ? "Distributing..." : "Distribute Round Payout 💰"}
      </Button>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title={`Distribute Round - ${groupName}`}
        description={
          status === "success"
            ? `Round payout has been distributed! The recipient has received their funds.`
            : status === "error"
            ? error?.message || "Transaction failed"
            : `Distributing round payout for ${groupName}...`
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
