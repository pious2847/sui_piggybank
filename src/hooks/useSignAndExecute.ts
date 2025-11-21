import { useState, useCallback } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Transaction status types
 */
export type TransactionStatus = "idle" | "pending" | "success" | "error";

/**
 * Transaction result with detailed information
 */
export interface TransactionResult {
  digest?: string;
  effects?: any;
  error?: Error;
}

/**
 * Options for transaction execution
 */
export interface SignAndExecuteOptions {
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  invalidateQueries?: string[][]; // Query keys to invalidate on success
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Enhanced hook wrapper for signing and executing transactions
 * Provides status tracking, error handling, and cache invalidation
 */
export function useSignAndExecute() {
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState<TransactionStatus>("idle");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Execute a transaction with enhanced error handling and status tracking
   */
  const execute = useCallback(
    (transaction: Transaction, options: SignAndExecuteOptions = {}) => {
      const {
        onSuccess,
        onError,
        onSettled,
        invalidateQueries = [],
        successMessage,
        errorMessage,
      } = options;

      // Reset state
      setStatus("pending");
      setError(null);
      setResult(null);

      signAndExecute(
        { transaction },
        {
          onSuccess: async (result) => {
            setStatus("success");
            const txResult: TransactionResult = {
              digest: result.digest,
              effects: result.effects,
            };
            setResult(txResult);

            // Invalidate specified queries
            if (invalidateQueries.length > 0) {
              await Promise.all(
                invalidateQueries.map((key) =>
                  queryClient.invalidateQueries({ queryKey: key })
                )
              );
            }

            // Show success toast if enabled
            if (successMessage) {
              console.log("✅ Transaction successful:", successMessage);
            }

            // Call success callback
            onSuccess?.(txResult);
          },
          onError: (err) => {
            setStatus("error");
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);

            // Show error toast if enabled
            if (errorMessage) {
              console.error("❌ Transaction failed:", errorMessage, error);
            }

            // Call error callback
            onError?.(error);
          },
          onSettled: () => {
            // Call settled callback
            onSettled?.();
          },
        }
      );
    },
    [signAndExecute, queryClient]
  );

  /**
   * Reset the transaction state
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setResult(null);
  }, []);

  return {
    execute,
    reset,
    isPending,
    status,
    result,
    error,
    isSuccess: status === "success",
    isError: status === "error",
    isIdle: status === "idle",
  };
}

/**
 * Get user-friendly error message from transaction error
 */
export function getTransactionErrorMessage(error: Error | null): string {
  if (!error) return "";

  const errorMessage = error.message.toLowerCase();

  // Common error patterns and their user-friendly messages
  if (errorMessage.includes("insufficient") && errorMessage.includes("gas")) {
    return "Insufficient SUI balance to pay for gas fees. Please add more SUI to your wallet.";
  }

  if (errorMessage.includes("insufficient") && errorMessage.includes("balance")) {
    return "Insufficient balance for this transaction. Please check your wallet balance.";
  }

  if (errorMessage.includes("rejected") || errorMessage.includes("user denied")) {
    return "Transaction was rejected. Please try again if you want to proceed.";
  }

  if (errorMessage.includes("not found") || errorMessage.includes("object not found")) {
    return "The requested object was not found. It may have been deleted or moved.";
  }

  if (errorMessage.includes("unauthorized") || errorMessage.includes("permission")) {
    return "You don't have permission to perform this action.";
  }

  if (errorMessage.includes("group full") || errorMessage.includes("max participants")) {
    return "This group is full. Maximum number of participants has been reached.";
  }

  if (errorMessage.includes("already participant") || errorMessage.includes("duplicate")) {
    return "You are already a participant in this group.";
  }

  if (errorMessage.includes("invalid contribution")) {
    return "Invalid contribution amount. Please check the required amount.";
  }

  if (errorMessage.includes("round not complete")) {
    return "The current round is not complete yet. All participants must contribute first.";
  }

  if (errorMessage.includes("cycle already complete")) {
    return "This cycle has already been completed.";
  }

  if (errorMessage.includes("goal not met") || errorMessage.includes("unlock")) {
    return "Conditions not met. Check if the goal amount is reached and unlock date has passed.";
  }

  if (errorMessage.includes("network") || errorMessage.includes("timeout")) {
    return "Network error. Please check your connection and try again.";
  }

  if (errorMessage.includes("invalid admin")) {
    return "Invalid admin credentials. This action requires admin privileges.";
  }

  // Default error message
  return "Transaction failed. Please try again or contact support if the problem persists.";
}

/**
 * Format transaction digest for display
 */
export function formatTransactionDigest(digest: string): string {
  if (digest.length <= 16) return digest;
  return `${digest.slice(0, 8)}...${digest.slice(-8)}`;
}

/**
 * Get explorer URL for a transaction
 */
export function getTransactionExplorerUrl(digest: string, network: "mainnet" | "testnet" | "devnet" = "devnet"): string {
  const baseUrl = network === "mainnet" 
    ? "https://suiscan.xyz/mainnet/tx"
    : network === "testnet"
    ? "https://suiscan.xyz/testnet/tx"
    : "https://suiscan.xyz/devnet/tx";
  
  return `${baseUrl}/${digest}`;
}
