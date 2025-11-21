import { useState } from "react";
import { Button, Flex } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecute, getTransactionErrorMessage } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { useNetworkVariable } from "../../networkConfig";
import { mintRewardTx } from "../../utils/transactions";

export interface MintNFTButtonProps {
  adminCapId: string;
  collectionId: string;
  recipient: string;
  recipientName: string;
  achievementType: "contribution" | "cycle_complete" | "milestone";
  onSuccess?: () => void;
}

/**
 * Button component for minting NFT rewards (admin only)
 * Demonstrates admin-only transactions with capability objects
 */
export function MintNFTButton({
  adminCapId,
  collectionId,
  recipient,
  recipientName,
  achievementType,
  onSuccess,
}: MintNFTButtonProps) {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);

  // Achievement type mapping
  const achievementConfig = {
    contribution: {
      type: 1,
      name: "Consistent Contributor",
      description: "Made timely contributions to group susu",
      emoji: "⭐",
    },
    cycle_complete: {
      type: 2,
      name: "Cycle Completion Champion",
      description: "Successfully completed a group susu cycle",
      emoji: "🏆",
    },
    milestone: {
      type: 3,
      name: "Milestone Achievement",
      description: "Reached a significant platform milestone",
      emoji: "🎯",
    },
  };

  const config = achievementConfig[achievementType];

  const handleMintNFT = () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    // Build the transaction
    const tx = mintRewardTx(
      counterPackageId,
      adminCapId,
      collectionId,
      recipient,
      config.name,
      config.description,
      "walrus://placeholder_image", // TODO: Upload to Walrus first
      "walrus://placeholder_metadata", // TODO: Upload to Walrus first
      config.type
    );

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      // Invalidate relevant queries on success
      invalidateQueries: [
        ["userNFTs", recipient],
        ["pendingRewards"],
        ["platformStats"],
      ],
      successMessage: `NFT minted for ${recipientName}!`,
      errorMessage: `Failed to mint NFT`,
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
    handleMintNFT();
  };

  return (
    <>
      <Button
        size="2"
        onClick={handleMintNFT}
        disabled={!currentAccount || status === "pending"}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-700 disabled:to-slate-700"
      >
        <Flex align="center" gap="2">
          <span>{config.emoji}</span>
          <span>{status === "pending" ? "Minting..." : "Mint NFT"}</span>
        </Flex>
      </Button>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title={`Mint ${config.name}`}
        description={
          status === "success"
            ? `NFT "${config.name}" has been minted and sent to ${recipientName}!`
            : status === "error"
            ? getTransactionErrorMessage(error)
            : `Minting NFT for ${recipientName}...`
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
