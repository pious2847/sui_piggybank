/**
 * React hook for Walrus file uploads with wallet integration
 * Based on official Walrus SDK documentation
 */

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { uploadFileToWalrus, uploadMetadataToWalrus } from '../lib/walrusUpload';

interface UploadState {
  isUploading: boolean;
  progress: string;
  error: string | null;
}

export function useWalrusFileUpload() {
  const currentAccount = useCurrentAccount();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: '',
    error: null,
  });

  /**
   * Upload a file to Walrus
   * Note: This requires a wallet signer which may not be directly accessible
   * in the current dapp-kit version
   */
  const uploadFile = async (
    file: File,
    options?: {
      epochs?: number;
      deletable?: boolean;
    }
  ): Promise<string> => {
    if (!currentAccount) {
      throw new Error('No wallet connected');
    }

    setState({
      isUploading: true,
      progress: 'Preparing upload...',
      error: null,
    });

    try {
      // Note: Getting the signer from dapp-kit is tricky
      // This is a placeholder - actual implementation depends on wallet integration
      setState({ isUploading: true, progress: 'Uploading to Walrus...', error: null });
      
      // This will likely fail with current versions
      // The signer needs to be obtained from the wallet
      const result = await uploadFileToWalrus(file, null as any, options);

      setState({
        isUploading: false,
        progress: 'Upload complete!',
        error: null,
      });

      return result.blobId;
    } catch (error: any) {
      setState({
        isUploading: false,
        progress: '',
        error: error.message || 'Upload failed',
      });
      throw error;
    }
  };

  /**
   * Upload metadata JSON to Walrus
   */
  const uploadMetadata = async (
    metadata: any,
    options?: {
      epochs?: number;
      deletable?: boolean;
    }
  ): Promise<string> => {
    if (!currentAccount) {
      throw new Error('No wallet connected');
    }

    setState({
      isUploading: true,
      progress: 'Uploading metadata...',
      error: null,
    });

    try {
      const result = await uploadMetadataToWalrus(metadata, null as any, options);

      setState({
        isUploading: false,
        progress: 'Metadata uploaded!',
        error: null,
      });

      return result.blobId;
    } catch (error: any) {
      setState({
        isUploading: false,
        progress: '',
        error: error.message || 'Metadata upload failed',
      });
      throw error;
    }
  };

  const reset = () => {
    setState({
      isUploading: false,
      progress: '',
      error: null,
    });
  };

  return {
    uploadFile,
    uploadMetadata,
    reset,
    ...state,
  };
}
