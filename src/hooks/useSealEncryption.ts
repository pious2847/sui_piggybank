import { useState, useCallback } from "react";
import { 
  decryptSealData, 
  getUserPrivateKey, 
  SealEncryptionError,
  type DecryptedUserData 
} from "../utils/seal";

export interface UseSealEncryptionResult {
  decryptedData: DecryptedUserData | null;
  isDecrypting: boolean;
  error: string | null;
  decrypt: () => Promise<void>;
  lock: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing Seal encryption/decryption state
 * 
 * @param encryptedData - The encrypted data from the blockchain
 * @returns Object with decryption state and control functions
 * 
 * @example
 * ```tsx
 * const { decryptedData, isDecrypting, error, decrypt, lock } = useSealEncryption(profile.encryptedData);
 * 
 * // Decrypt data
 * await decrypt();
 * 
 * // Lock data again
 * lock();
 * ```
 */
export function useSealEncryption(
  encryptedData: number[] | null | undefined
): UseSealEncryptionResult {
  const [decryptedData, setDecryptedData] = useState<DecryptedUserData | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decrypt = useCallback(async () => {
    if (!encryptedData || encryptedData.length === 0) {
      setError("No encrypted data available");
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      // Get user's private key from wallet
      const privateKey = await getUserPrivateKey();
      
      // Decrypt the data using Seal
      const decrypted = await decryptSealData(encryptedData, privateKey);
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
  }, [encryptedData]);

  const lock = useCallback(() => {
    setDecryptedData(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    decryptedData,
    isDecrypting,
    error,
    decrypt,
    lock,
    clearError,
  };
}
