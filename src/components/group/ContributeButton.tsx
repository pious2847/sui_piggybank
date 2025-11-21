import { useState } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecute, getTransactionErrorMessage } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { useNetworkVariable } from "../../networkConfig";
import { contributeTx } from "../../utils/transactions";

export interface ContributeButtonProps {
  groupId: string;
  groupName: string;
  contributionAmount: number; // in MIST
  onSuccess?: () => void;
}

/**
 * Button component for making a contribution to a group susu
 * Demonstrates transaction with amount parameter and cache invalidation
 */
export function ContributeButton({
  groupId,
  groupName,
  contributionAmount,
  onSuccess,
}: ContributeButtonProps) {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);

  // Convert MIST to SUI for display
  const contributionInSui = contributionAmount / 1_000_000_000;

  const handleContribute = () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    // Build the transaction with the contribution amount
    const tx = contributeTx(counterPackageId, groupId, BigInt(contributionAmount));

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      // Invalidate relevant queries on success
      invalidateQueries: [
        ["groupSusu", groupId],
        ["groupParticipants", groupId],
        ["reputationProfile", currentAccount.address],
        ["userGroups", currentAccount.address],
      ],
      successMessage: `Contribution of ${contributionInSui} SUI made successfully!`,
      errorMessage: `Failed to make contribution`,
      onSuccess: () => {
        // Call optional success callback
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
    handleContribute();
  };

  return (
    <>
      <Button
        size="4"
        onClick={handleContribute}
        disabled={!currentAccount || status === "pending"}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-700 disabled:to-slate-700 py-4"
      >
        <Flex align="center" gap="2">
          <span className="text-xl">💳</span>
          <span>
            {status === "pending"
              ? "Contributing..."
              : `Contribute ${contributionInSui.toFixed(2)} SUI`}
          </span>
        </Flex>
      </Button>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title={`Contribute to ${groupName}`}
        description={
          status === "success"
            ? `Your contribution of ${contributionInSui.toFixed(2)} SUI has been recorded. You've earned reputation points!`
            : status === "error"
            ? getTransactionErrorMessage(error)
            : `Processing your contribution of ${contributionInSui.toFixed(2)} SUI...`
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
