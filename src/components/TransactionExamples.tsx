import { useState } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useSignAndExecute, getTransactionErrorMessage } from "../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "./TransactionConfirmationModal";
import { useNetworkVariable } from "../networkConfig";
import {
  createGroupSusuTx,
  joinGroupTx,
  contributeTx,
  createReputationProfileTx,
} from "../utils/transactions";

/**
 * Example component demonstrating how to use the transaction system
 * This shows the pattern for all transaction types in the application
 */
export function TransactionExamples() {
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);

  // Example 1: Create Group Susu
  const handleCreateGroup = () => {
    const tx = createGroupSusuTx(
      counterPackageId,
      "My Savings Group",
      BigInt(1_000_000_000), // 1 SUI
      BigInt(7 * 24 * 60 * 60 * 1000), // 1 week
      BigInt(10) // max 10 participants
    );

    setShowModal(true);
    execute(tx, {
      invalidateQueries: [["allGroups"], ["userGroups"]],
      successMessage: "Group created successfully!",
      errorMessage: "Failed to create group",
      onSuccess: () => {
        console.log("Group created!");
      },
    });
  };

  // Example 2: Join Group
  const handleJoinGroup = (groupId: string) => {
    const tx = joinGroupTx(counterPackageId, groupId);

    setShowModal(true);
    execute(tx, {
      invalidateQueries: [["groupSusu", groupId], ["userGroups"]],
      successMessage: "Joined group successfully!",
      errorMessage: "Failed to join group",
    });
  };

  // Example 3: Make Contribution
  const handleContribute = (groupId: string, amount: bigint) => {
    const tx = contributeTx(counterPackageId, groupId, amount);

    setShowModal(true);
    execute(tx, {
      invalidateQueries: [["groupSusu", groupId], ["reputationProfile"]],
      successMessage: "Contribution made successfully!",
      errorMessage: "Failed to make contribution",
    });
  };

  // Example 4: Create Reputation Profile
  const handleCreateProfile = () => {
    const tx = createReputationProfileTx(counterPackageId);

    setShowModal(true);
    execute(tx, {
      invalidateQueries: [["reputationProfile"]],
      successMessage: "Profile created successfully!",
      errorMessage: "Failed to create profile",
    });
  };

  // Example 5: Mint NFT Reward (Admin only)
  // This is demonstrated in the MintNFTButton component

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  return (
    <div className="p-6 space-y-4">
      <Text size="6" weight="bold" className="text-white">
        Transaction Examples
      </Text>

      <Flex direction="column" gap="3">
        <Button onClick={handleCreateGroup}>Create Group Susu</Button>
        <Button onClick={() => handleJoinGroup("0x123...")}>Join Group</Button>
        <Button onClick={() => handleContribute("0x123...", BigInt(1_000_000_000))}>
          Make Contribution
        </Button>
        <Button onClick={handleCreateProfile}>Create Reputation Profile</Button>
      </Flex>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title="Transaction"
        description={
          status === "success"
            ? "Your transaction was successful!"
            : status === "error"
            ? getTransactionErrorMessage(error)
            : "Processing your transaction..."
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={() => {
          // Retry logic would go here
          console.log("Retry transaction");
        }}
      />
    </div>
  );
}
