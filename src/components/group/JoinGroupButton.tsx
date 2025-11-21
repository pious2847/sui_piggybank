import { useState } from "react";
import { Button } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecute, getTransactionErrorMessage } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { useNetworkVariable } from "../../networkConfig";
import { joinGroupTx } from "../../utils/transactions";
import { useIsGroupParticipant } from "../../hooks/useGroupSusu";

export interface JoinGroupButtonProps {
  groupId: string;
  groupName: string;
  isFull: boolean;
  onSuccess?: () => void;
}

/**
 * Button component for joining a group susu
 * Demonstrates the complete transaction flow with modal and error handling
 */
export function JoinGroupButton({
  groupId,
  groupName,
  isFull,
  onSuccess,
}: JoinGroupButtonProps) {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);

  console.log("====".repeat(40), )
  // Check if user is already a participant
  const { isParticipant } = useIsGroupParticipant(groupId, currentAccount?.address);

  const handleJoinGroup = () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    // Build the transaction
    const tx = joinGroupTx(counterPackageId, groupId);

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      // Invalidate relevant queries on success
      invalidateQueries: [
        ["groupSusu", groupId],
        ["userGroups", currentAccount.address],
        ["allGroups"],
      ],
      successMessage: `Successfully joined ${groupName}!`,
      errorMessage: `Failed to join ${groupName}`,
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
    handleJoinGroup();
  };

  // Don't show button if user is already a participant
  if (isParticipant) {
    return (
      <Button disabled size="3" className="w-full bg-slate-700">
        Already Joined ✓
      </Button>
    );
  }

  return (
    <>
      <Button
        size="3"
        onClick={handleJoinGroup}
        disabled={isFull || !currentAccount || status === "pending"}
        className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 disabled:from-slate-700 disabled:to-slate-700"
      >
        {status === "pending" ? "Joining..." : isFull ? "Group Full" : "Join Group"}
      </Button>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title={`Join ${groupName}`}
        description={
          status === "success"
            ? `You have successfully joined ${groupName}! You can now make contributions.`
            : status === "error"
            ? getTransactionErrorMessage(error)
            : `Joining ${groupName}...`
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
