import { useState } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecute, getTransactionErrorMessage } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { useNetworkVariable } from "../../networkConfig";
import { createGroupSusuTx } from "../../utils/transactions";

/**
 * Form component for creating a new group susu
 * Demonstrates transaction with multiple parameters and form handling
 */
export function CreateGroupForm({ onSuccess }: { onSuccess?: () => void }) {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [groupName, setGroupName] = useState("");
  const [contributionAmount, setContributionAmount] = useState("1.0");
  const [frequencyDays, setFrequencyDays] = useState("7");
  const [maxParticipants, setMaxParticipants] = useState("10");

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    // Validate inputs
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    // Convert inputs to blockchain format
    const amountInMist = BigInt(Math.floor(parseFloat(contributionAmount) * 1_000_000_000));
    const frequencyMs = BigInt(parseInt(frequencyDays) * 24 * 60 * 60 * 1000);
    const maxParts = BigInt(parseInt(maxParticipants));

    // Build the transaction
    const tx = createGroupSusuTx(
      counterPackageId,
      groupName,
      amountInMist,
      frequencyMs,
      maxParts
    );

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      // Invalidate relevant queries on success
      invalidateQueries: [
        ["allGroups"],
        ["userGroups", currentAccount.address],
      ],
      successMessage: `Group "${groupName}" created successfully!`,
      errorMessage: `Failed to create group`,
      onSuccess: () => {
        // Reset form
        setGroupName("");
        setContributionAmount("1.0");
        setFrequencyDays("7");
        setMaxParticipants("10");
        
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
    handleCreateGroup(new Event("submit") as any);
  };

  return (
    <>
      <form onSubmit={handleCreateGroup} className="space-y-6">
        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                Group Name
              </Text>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="My Savings Group"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          {/* Contribution Amount */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                Contribution Amount (SUI)
              </Text>
            </label>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                Contribution Frequency (days)
              </Text>
            </label>
            <select
              value={frequencyDays}
              onChange={(e) => setFrequencyDays(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="1">Daily</option>
              <option value="7">Weekly</option>
              <option value="14">Bi-weekly</option>
              <option value="30">Monthly</option>
            </select>
          </div>

          {/* Max Participants */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                Maximum Participants
              </Text>
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              min="2"
              max="50"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          size="4"
          disabled={!currentAccount || status === "pending"}
          className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 disabled:from-slate-700 disabled:to-slate-700"
        >
          {status === "pending" ? "Creating..." : "Create Group"}
        </Button>
      </form>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title="Create Group Susu"
        description={
          status === "success"
            ? `Your group "${groupName}" has been created successfully! You can now invite participants.`
            : status === "error"
            ? getTransactionErrorMessage(error)
            : `Creating your group "${groupName}"...`
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
