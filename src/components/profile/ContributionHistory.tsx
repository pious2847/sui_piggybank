import { useState } from "react";
import { LockIcon, UnlockIcon, AlertCircle, Loader2 } from "lucide-react";
import { 
  decryptSealData, 
  getUserPrivateKey, 
  SealEncryptionError,
  hasEncryptedData,
  formatSuiAmount,
  formatDate,
  type DecryptedUserData 
} from "../../utils/seal";

interface ContributionHistoryProps {
  encryptedData: number[] | null | undefined;
}

export function ContributionHistory({ encryptedData }: ContributionHistoryProps) {
  const [decryptedData, setDecryptedData] = useState<DecryptedUserData | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    setError(null);

    try {
      // Get user's private key from wallet
      const privateKey = await getUserPrivateKey();
      
      // Decrypt the data
      const decrypted = await decryptSealData(encryptedData || [], privateKey);
      setDecryptedData(decrypted);
    } catch (err) {
      if (err instanceof SealEncryptionError) {
        setError(err.message);
      } else {
        setError("Failed to decrypt data. Please try again.");
      }
      console.error("Decryption error:", err);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleLock = () => {
    setDecryptedData(null);
    setError(null);
  };

  // Check if there's encrypted data available
  const hasData = hasEncryptedData(encryptedData);

  if (!hasData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 text-slate-400">
          <LockIcon className="w-5 h-5" />
          <p>No encrypted contribution history available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          {decryptedData ? (
            <>
              <UnlockIcon className="w-5 h-5 text-green-400" />
              Contribution History (Decrypted)
            </>
          ) : (
            <>
              <LockIcon className="w-5 h-5 text-amber-400" />
              Contribution History (Encrypted)
            </>
          )}
        </h3>

        {!decryptedData ? (
          <button
            onClick={handleDecrypt}
            disabled={isDecrypting}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            {isDecrypting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <UnlockIcon className="w-4 h-4" />
                Decrypt Data
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleLock}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <LockIcon className="w-4 h-4" />
            Lock Data
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Decryption Error</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {!decryptedData ? (
        <div className="text-center py-8">
          <LockIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2">Your contribution history is encrypted</p>
          <p className="text-slate-500 text-sm">
            Click "Decrypt Data" to view your detailed contribution history
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          {decryptedData.contributionHistory && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Total Contributed</p>
                <p className="text-2xl font-bold text-white">
                  {formatSuiAmount(decryptedData.contributionHistory.totalAmount)} SUI
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Average Amount</p>
                <p className="text-2xl font-bold text-white">
                  {formatSuiAmount(decryptedData.contributionHistory.averageAmount)} SUI
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                <p className="text-slate-400 text-sm mb-1">Total Contributions</p>
                <p className="text-2xl font-bold text-white">
                  {decryptedData.contributionHistory.contributions.length}
                </p>
              </div>
            </div>
          )}

          {/* Contribution List */}
          {decryptedData.contributionHistory && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Recent Contributions</h4>
              <div className="space-y-3">
                {decryptedData.contributionHistory.contributions.map((contribution, index) => (
                  <div
                    key={index}
                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">
                            {formatSuiAmount(contribution.amount)} SUI
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              contribution.status === 'on-time'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {contribution.status === 'on-time' ? 'On Time' : 'Late'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          Group: {contribution.groupId.slice(0, 8)}...{contribution.groupId.slice(-6)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">
                          {formatDate(contribution.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Notes */}
          {decryptedData.personalNotes && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
              <h4 className="text-lg font-semibold text-white mb-2">Personal Notes</h4>
              <p className="text-slate-300">{decryptedData.personalNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
