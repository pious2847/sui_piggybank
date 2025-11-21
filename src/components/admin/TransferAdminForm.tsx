import { useState } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecute, getTransactionErrorMessage } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { transferAdminCapTx } from "../../utils/transactions";
import { PLATFORM_CONFIG_ID } from "../../constants";
import { useNetworkVariable } from "../../networkConfig";

export interface TransferAdminFormProps {
  adminCapId: string;
}

/**
 * Form for transferring admin capabilities to a new address
 * This is a critical operation that should be used with caution
 */
export function TransferAdminForm({ adminCapId }: TransferAdminFormProps) {
  const currentAccount = useCurrentAccount();
  const counterPackageId = useNetworkVariable("counterPackageId");
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [confirmAddress, setConfirmAddress] = useState("");

  const handleTransferAdmin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount || !adminCapId) {
      alert("Admin access required");
      return;
    }

    // Validate addresses
    if (!newAdminAddress.startsWith("0x") || newAdminAddress.length !== 66) {
      alert("Please enter a valid Sui address (0x followed by 64 hex characters)");
      return;
    }

    if (newAdminAddress !== confirmAddress) {
      alert("Addresses do not match. Please confirm the new admin address.");
      return;
    }

    if (newAdminAddress === currentAccount.address) {
      alert("You are already the admin. Please enter a different address.");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmTransfer = () => {
    setShowConfirmation(false);

    // Build the transaction
    const tx = transferAdminCapTx(
      counterPackageId,
      adminCapId,
      PLATFORM_CONFIG_ID,
      newAdminAddress
    );

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      invalidateQueries: [["adminCap"], ["platformConfig"]],
      successMessage: "Admin capabilities transferred successfully!",
      errorMessage: "Failed to transfer admin capabilities",
      onSuccess: () => {
        // Reset form
        setNewAdminAddress("");
        setConfirmAddress("");
      },
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const handleRetry = () => {
    reset();
    handleConfirmTransfer();
  };

  return (
    <>
      <div className="backdrop-blur-xl bg-white/[0.07] border border-red-500/20 rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center gap-2">
            <span>🔐</span>
            Transfer Admin Access
          </h2>
          <Text className="text-slate-400 text-sm">
            Transfer admin capabilities to a new address
          </Text>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-300 text-sm font-semibold mb-2">⚠️ Critical Operation</p>
          <ul className="text-red-300 text-xs space-y-1 list-disc list-inside">
            <li>This action is irreversible</li>
            <li>You will lose all admin privileges</li>
            <li>The new admin will have full control</li>
            <li>Double-check the address before confirming</li>
          </ul>
        </div>

        <form onSubmit={handleTransferAdmin} className="space-y-6">
          {/* Current Admin Display */}
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-slate-400 text-sm mb-1">Current Admin</p>
            <p className="text-slate-200 font-mono text-sm break-all">
              {currentAccount?.address || "Not connected"}
            </p>
          </div>

          {/* New Admin Address */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                New Admin Address
              </Text>
              <Text size="1" className="text-slate-400 block mt-1">
                Enter the Sui address of the new admin
              </Text>
            </label>
            <input
              type="text"
              value={newAdminAddress}
              onChange={(e) => setNewAdminAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          {/* Confirm Address */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                Confirm New Admin Address
              </Text>
              <Text size="1" className="text-slate-400 block mt-1">
                Re-enter the address to confirm
              </Text>
            </label>
            <input
              type="text"
              value={confirmAddress}
              onChange={(e) => setConfirmAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="4"
            disabled={!currentAccount || status === "pending" || !newAdminAddress || !confirmAddress}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-slate-700 disabled:to-slate-700"
          >
            Transfer Admin Access
          </Button>
        </form>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-slate-900/95 border border-red-500/30 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-red-400 mb-4">⚠️ Confirm Transfer</h3>
            <p className="text-slate-300 mb-4">
              Are you absolutely sure you want to transfer admin access to:
            </p>
            <p className="text-cyan-400 font-mono text-sm break-all mb-6 p-3 bg-white/5 rounded-lg">
              {newAdminAddress}
            </p>
            <p className="text-red-300 text-sm mb-6">
              This action cannot be undone. You will lose all admin privileges immediately.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                size="3"
                className="flex-1 bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmTransfer}
                size="3"
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Confirm Transfer
              </Button>
            </div>
          </div>
        </div>
      )}

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title="Transfer Admin Access"
        description={
          status === "success"
            ? `Admin access has been transferred to ${newAdminAddress}. You no longer have admin privileges.`
            : status === "error"
            ? getTransactionErrorMessage(error)
            : "Transferring admin access..."
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
