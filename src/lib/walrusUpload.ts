/**
 * Walrus Upload Utility
 * Based on official @mysten/walrus SDK documentation
 * 
 * This implementation attempts to use the official SDK pattern
 * with the current package versions.
 */

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

/**
 * Initialize Walrus-compatible Sui client
 */
export function createWalrusUploadClient() {
  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  return suiClient;
}

/**
 * Upload file to Walrus using the official SDK pattern
 * 
 * @param file - File to upload
 * @param signer - Wallet signer instance
 * @param options - Upload options
 * @returns Upload result with blob ID
 */
export async function uploadFileToWalrus(
  file: File,
  signer: any,
  options?: {
    epochs?: number;
    deletable?: boolean;
  }
): Promise<{ blobId: string; blobObject: any }> {
  try {
    // Import WalrusClient dynamically to handle version issues
    const { WalrusClient, WalrusFile } = await import('@mysten/walrus');
    
    const suiClient = createWalrusUploadClient();
    
    // Create Walrus client
    const walrusClient = new WalrusClient({
      network: 'testnet' as any,
      suiClient: suiClient as any,
    });

    // Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const contents = new Uint8Array(arrayBuffer);

    // Create WalrusFile
    const walrusFile = WalrusFile.from({
      contents,
      identifier: file.name,
    });

    // Upload with signer
    const results = await walrusClient.writeFiles({
      files: [walrusFile],
      epochs: options?.epochs || 3,
      deletable: options?.deletable !== false,
      signer,
    });

    // Extract blob ID from results
    const result = results[0];
    if (!result?.blobId) {
      throw new Error('No blob ID returned from upload');
    }

    return {
      blobId: result.blobId,
      blobObject: result.blobObject,
    };
  } catch (error: any) {
    console.error('Walrus upload error:', error);
    
    // Check if it's a version compatibility error
    if (error.message?.includes('$extend') || error.message?.includes('network')) {
      throw new Error(
        'Walrus SDK version incompatibility. Please upgrade @mysten/sui to v1.45.0+ or use Walrus CLI for uploads.'
      );
    }
    
    throw error;
  }
}

/**
 * Upload JSON metadata to Walrus
 * 
 * @param metadata - JSON metadata object
 * @param signer - Wallet signer instance
 * @param options - Upload options
 * @returns Upload result with blob ID
 */
export async function uploadMetadataToWalrus(
  metadata: any,
  signer: any,
  options?: {
    epochs?: number;
    deletable?: boolean;
  }
): Promise<{ blobId: string; blobObject: any }> {
  // Convert metadata to JSON string then to File
  const jsonString = JSON.stringify(metadata, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const file = new File([blob], 'metadata.json', { type: 'application/json' });

  return uploadFileToWalrus(file, signer, options);
}
