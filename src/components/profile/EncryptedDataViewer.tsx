import { ReactNode } from "react";
import { LockIcon, UnlockIcon, AlertCircle, Loader2 } from "lucide-react";
import { useSealEncryption } from "../../hooks/useSealEncryption";
import { hasEncryptedData } from "../../utils/seal";

interface EncryptedDataViewerProps {
  encryptedData: number[] | null | undefined;
  title?: string;
  emptyMessage?: string;
  lockedMessage?: string;
  children: (decryptedData: any) => ReactNode;
}

/**
 * EncryptedDataViewer Component
 * 
 * A reusable component for displaying encrypted data with decrypt/lock functionality.
 * Handles the encryption state management and provides a consistent UI for encrypted content.
 * 
 * @example
 * ```tsx
 * <EncryptedDataViewer
 *   encryptedData={profile.encryptedData}
 *   title="Sensitive Information"
 * >
 *   {(data) => <div>{data.personalNotes}</div>}
 * </EncryptedDataViewer>
 * ```
 */
export function EncryptedDataViewer({
  encryptedData,
  title = "Encrypted Data",
  emptyMessage = "No encrypted data available yet.",
  lockedMessage = "This data is encrypted. Click 'Decrypt Data' to view.",
  children,
}: EncryptedDataViewerProps) {
  const { decryptedData, isDecrypting, error, decrypt, lock } = useSealEncryption(encryptedData);

  // Check if there's encrypted data available
  const hasData = hasEncryptedData(encryptedData);

  if (!hasData) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50">
        <div className="flex items-center gap-3 text-slate-400">
          <LockIcon className="w-5 h-5" />
          <p>{emptyMessage}</p>
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
              {title} (Decrypted)
            </>
          ) : (
            <>
              <LockIcon className="w-5 h-5 text-amber-400" />
              {title} (Encrypted)
            </>
          )}
        </h3>

        {!decryptedData ? (
          <button
            onClick={decrypt}
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
            onClick={lock}
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
          <p className="text-slate-400 mb-2">Data is encrypted for privacy</p>
          <p className="text-slate-500 text-sm">{lockedMessage}</p>
        </div>
      ) : (
        <div>{children(decryptedData)}</div>
      )}
    </div>
  );
}
