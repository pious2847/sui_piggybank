import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { TransactionStatus, formatTransactionDigest, getTransactionExplorerUrl } from "../hooks/useSignAndExecute";

export interface TransactionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: TransactionStatus;
  title: string;
  description?: string;
  transactionDigest?: string;
  error?: Error | null;
  onRetry?: () => void;
  network?: "mainnet" | "testnet" | "devnet";
}

/**
 * Modal component for displaying transaction confirmation and status
 * Shows pending, success, and error states with appropriate UI
 */
export function TransactionConfirmationModal({
  isOpen,
  onClose,
  status,
  title,
  description,
  transactionDigest,
  error,
  onRetry,
  network = "testnet",
}: TransactionConfirmationModalProps) {
  const explorerUrl = transactionDigest 
    ? getTransactionExplorerUrl(transactionDigest, network)
    : undefined;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md z-50 shadow-2xl">
          {/* Header */}
          <Dialog.Title asChild>
            <Flex align="center" gap="3" mb="4">
              {status === "pending" && (
                <>
                  <div className="animate-spin text-3xl">⏳</div>
                  <Text size="6" weight="bold" className="text-white">
                    Processing Transaction
                  </Text>
                </>
              )}
              {status === "success" && (
                <>
                  <div className="text-3xl">✅</div>
                  <Text size="6" weight="bold" className="text-white">
                    Transaction Successful
                  </Text>
                </>
              )}
              {status === "error" && (
                <>
                  <div className="text-3xl">❌</div>
                  <Text size="6" weight="bold" className="text-white">
                    Transaction Failed
                  </Text>
                </>
              )}
              {status === "idle" && (
                <>
                  <div className="text-3xl">⚠️</div>
                  <Text size="6" weight="bold" className="text-white">
                    {title}
                  </Text>
                </>
              )}
            </Flex>
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description asChild>
            <div className="mb-6">
              {status === "pending" && (
                <Text size="3" className="text-slate-400">
                  Please wait while your transaction is being processed...
                </Text>
              )}
              {status === "success" && (
                <Text size="3" className="text-slate-400">
                  {description || "Your transaction has been successfully completed."}
                </Text>
              )}
              {status === "error" && error && (
                <Text size="3" className="text-red-400">
                  {error.message}
                </Text>
              )}
              {status === "idle" && description && (
                <Text size="3" className="text-slate-400">
                  {description}
                </Text>
              )}
            </div>
          </Dialog.Description>

          {/* Transaction Details */}
          {status === "success" && transactionDigest && (
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Text size="2" weight="bold" className="text-slate-300">
                    Transaction ID:
                  </Text>
                  <Text size="2" className="text-slate-400 font-mono">
                    {formatTransactionDigest(transactionDigest)}
                  </Text>
                </Flex>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <span>View on Explorer</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </Flex>
            </div>
          )}

          {/* Error Details */}
          {status === "error" && error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <Text size="2" className="text-red-300">
                {error.message}
              </Text>
            </div>
          )}

          {/* Actions */}
          <Flex gap="3" justify="end">
            {status === "error" && onRetry && (
              <Button
                size="3"
                variant="soft"
                onClick={onRetry}
                className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
              >
                Retry
              </Button>
            )}
            <Button
              size="3"
              onClick={onClose}
              disabled={status === "pending"}
              className={
                status === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : status === "error"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }
            >
              {status === "pending" ? "Processing..." : "Close"}
            </Button>
          </Flex>

          {/* Close button */}
          {status !== "pending" && (
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
