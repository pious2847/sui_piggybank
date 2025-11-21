/**
 * Walrus Client Setup
 * 
 * Creates and configures the Walrus client using the official @mysten/walrus SDK
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';

/**
 * Create a Walrus client for file operations
 */
export function createWalrusClient() {
  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  const walrusClient = new WalrusClient({
    network: 'testnet',
    suiClient,
  });

  return walrusClient;
}

// Create a singleton instance
let walrusClientInstance: WalrusClient | null = null;

/**
 * Get the Walrus client instance (singleton)
 */
export function getWalrusClient(): WalrusClient {
  if (!walrusClientInstance) {
    walrusClientInstance = createWalrusClient();
  }
  return walrusClientInstance;
}

/**
 * Reset the Walrus client instance
 */
export function resetWalrusClient() {
  walrusClientInstance = null;
}
