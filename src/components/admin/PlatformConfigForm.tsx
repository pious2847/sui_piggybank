import { useState, useEffect } from "react";
import { Button, Text } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSignAndExecute, getTransactionErrorMessage } from "../../hooks/useSignAndExecute";
import { TransactionConfirmationModal } from "../TransactionConfirmationModal";
import { usePlatformConfig } from "../../hooks/usePlatformConfig";
import { updatePlatformConfigTx } from "../../utils/transactions";
import { DEVNET_COUNTER_PACKAGE_ID, PLATFORM_CONFIG_ID } from "../../constants";

export interface PlatformConfigFormProps {
  adminCapId: string;
}

/**
 * Form for updating platform configuration settings
 * Only accessible to admin with AdminCap
 */
export function PlatformConfigForm({ adminCapId }: PlatformConfigFormProps) {
  const currentAccount = useCurrentAccount();
  const { data: config, isLoading: isLoadingConfig } = usePlatformConfig();
  const { execute, status, result, error, reset } = useSignAndExecute();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [nftMintingEnabled, setNftMintingEnabled] = useState(true);
  const [minReputation, setMinReputation] = useState("100");

  // Load current config values
  useEffect(() => {
    if (config) {
      setNftMintingEnabled(config.nftMintingEnabled);
      setMinReputation(config.minReputationForRewards.toString());
    }
  }, [config]);

  const handleUpdateConfig = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount || !adminCapId) {
      alert("Admin access required");
      return;
    }

    // Validate inputs
    const minReputationValue = parseInt(minReputation);
    if (isNaN(minReputationValue) || minReputationValue < 0) {
      alert("Please enter a valid reputation score");
      return;
    }

    // Build the transaction
    const tx = updatePlatformConfigTx(
      DEVNET_COUNTER_PACKAGE_ID,
      adminCapId,
      PLATFORM_CONFIG_ID,
      nftMintingEnabled,
      BigInt(minReputationValue)
    );

    // Show modal and execute transaction
    setShowModal(true);
    execute(tx, {
      invalidateQueries: [["platformConfig"], ["platformStats"]],
      successMessage: "Platform configuration updated successfully!",
      errorMessage: "Failed to update platform configuration",
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const handleRetry = () => {
    reset();
    handleUpdateConfig(new Event("submit") as any);
  };

  if (isLoadingConfig) {
    return (
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <p className="text-slate-400 text-center">Loading configuration...</p>
      </div>
    );
  }

  return (
    <>
      <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-200 mb-2 flex items-center gap-2">
            <span>⚙️</span>
            Platform Configuration
          </h2>
          <Text className="text-slate-400 text-sm">
            Manage global platform settings and parameters
          </Text>
        </div>

        <form onSubmit={handleUpdateConfig} className="space-y-6">
          {/* Current Config Display */}
          {config && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl space-y-2">
              <p className="text-blue-300 text-sm font-semibold">Current Settings:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">NFT Minting:</span>
                  <span className={`ml-2 font-semibold ${config.nftMintingEnabled ? 'text-emerald-400' : 'text-red-400'}`}>
                    {config.nftMintingEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Min Reputation:</span>
                  <span className="ml-2 font-semibold text-cyan-400">{config.minReputationForRewards}</span>
                </div>
              </div>
            </div>
          )}

          {/* NFT Minting Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={nftMintingEnabled}
                onChange={(e) => setNftMintingEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
              />
              <div>
                <Text size="2" weight="bold" className="text-slate-300">
                  Enable NFT Minting
                </Text>
                <Text size="1" className="text-slate-400 block">
                  Allow minting of achievement NFT rewards
                </Text>
              </div>
            </label>
          </div>

          {/* Minimum Reputation */}
          <div>
            <label className="block mb-2">
              <Text size="2" weight="bold" className="text-slate-300">
                Minimum Reputation for Rewards
              </Text>
              <Text size="1" className="text-slate-400 block mt-1">
                Users must have at least this reputation score to be eligible for NFT rewards
              </Text>
            </label>
            <input
              type="number"
              value={minReputation}
              onChange={(e) => setMinReputation(e.target.value)}
              min="0"
              step="10"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              required
            />
          </div>

          {/* Info Box */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-300 text-xs">
              ⚠️ Changes will affect all users immediately. Use caution when modifying these settings.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="4"
            disabled={!currentAccount || status === "pending"}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 disabled:from-slate-700 disabled:to-slate-700"
          >
            {status === "pending" ? "Updating..." : "Update Configuration"}
          </Button>
        </form>
      </div>

      <TransactionConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        status={status}
        title="Update Platform Configuration"
        description={
          status === "success"
            ? "Platform configuration has been updated successfully!"
            : status === "error"
            ? getTransactionErrorMessage(error)
            : "Updating platform configuration..."
        }
        transactionDigest={result?.digest}
        error={error}
        onRetry={handleRetry}
      />
    </>
  );
}
