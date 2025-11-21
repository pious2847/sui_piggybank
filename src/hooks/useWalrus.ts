/**
 * React hooks for Walrus integration
 * 
 * Now using upgraded packages: @mysten/sui@1.45.0 and @mysten/dapp-kit@0.19.9
 * Provides hooks for uploading and fetching data from Walrus with React Query integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import {
  fetchFromWalrus,
  fetchJSONFromWalrus,
  fetchBlobFromWalrus,
  getWalrusUrl,
  WalrusError,
} from '../utils/walrus';

// Initialize Sui client for Walrus
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

/**
 * Hook to fetch text data from Walrus
 */
export function useWalrusData(
  blobId: string | undefined,
  options?: {
    enabled?: boolean;
    skipCache?: boolean;
  }
) {
  return useQuery({
    queryKey: ['walrus', 'data', blobId],
    queryFn: () => {
      if (!blobId) throw new Error('Blob ID is required');
      return fetchFromWalrus(blobId, { skipCache: options?.skipCache });
    },
    enabled: !!blobId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch and parse JSON data from Walrus
 */
export function useWalrusJSON<T = any>(
  blobId: string | undefined,
  options?: {
    enabled?: boolean;
    skipCache?: boolean;
  }
) {
  return useQuery<T, WalrusError>({
    queryKey: ['walrus', 'json', blobId],
    queryFn: () => {
      if (!blobId) throw new Error('Blob ID is required');
      return fetchJSONFromWalrus<T>(blobId, { skipCache: options?.skipCache });
    },
    enabled: !!blobId && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to fetch binary data (e.g., images) from Walrus
 */
export function useWalrusBlob(
  blobId: string | undefined,
  options?: {
    enabled?: boolean;
    skipCache?: boolean;
  }
) {
  return useQuery({
    queryKey: ['walrus', 'blob', blobId],
    queryFn: () => {
      if (!blobId) throw new Error('Blob ID is required');
      return fetchBlobFromWalrus(blobId, { skipCache: options?.skipCache });
    },
    enabled: !!blobId && (options?.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes for binary data
    retry: 2,
  });
}

/**
 * Hook to upload data to Walrus using the official SDK with wallet signing
 * 
 * This uses the WalrusClient from @mysten/walrus with proper wallet integration
 */
export function useWalrusUpload() {
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({
      data,
      epochs = 5,
    }: {
      data: string | Blob | Uint8Array | File;
      epochs?: number;
    }) => {
      if (!currentAccount) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      // Import Walrus SDK
      const { WalrusClient, WalrusFile } = await import('@mysten/walrus');
      
      // Create Walrus client
      const walrusClient = new WalrusClient({
        network: 'testnet' as any,
        suiClient: suiClient as any,
      });

      // Convert data to Uint8Array
      let contents: Uint8Array;
      let identifier = 'upload';

      if (data instanceof File) {
        contents = new Uint8Array(await data.arrayBuffer());
        identifier = data.name;
      } else if (typeof data === 'string') {
        contents = new TextEncoder().encode(data);
      } else if (data instanceof Blob) {
        contents = new Uint8Array(await data.arrayBuffer());
      } else {
        contents = data;
      }

      // Create WalrusFile
      const walrusFile = WalrusFile.from({
        contents,
        identifier,
      });

      // Create write flow for browser wallet integration
      const flow = walrusClient.writeFilesFlow({
        files: [walrusFile],
      });

      // Step 1: Encode the file
      await flow.encode();

      // Step 2: Register the blob on-chain (requires wallet signature)
      const registerTx = flow.register({
        epochs,
        owner: currentAccount.address,
        deletable: true,
      });

      const { digest } = await signAndExecuteTransaction({
        transaction: registerTx,
      });

      // Step 3: Upload to storage nodes
      await flow.upload({ digest });

      // Step 4: Certify the blob (requires wallet signature)
      const certifyTx = flow.certify();
      await signAndExecuteTransaction({
        transaction: certifyTx,
      });

      // Step 5: Get the uploaded files
      const files = await flow.listFiles();
      const blobId = files[0]?.blobId;

      if (!blobId) {
        throw new Error('No blob ID returned from upload');
      }

      return blobId;
    },
    onSuccess: (blobId) => {
      queryClient.invalidateQueries({ queryKey: ['walrus'] });
      console.log('Upload successful:', blobId);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });
}

/**
 * Hook to upload JSON data to Walrus with wallet signing
 */
export function useWalrusUploadJSON() {
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({
      data,
      epochs = 5,
    }: {
      data: any;
      epochs?: number;
    }) => {
      if (!currentAccount) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      // Import Walrus SDK
      const { WalrusClient, WalrusFile } = await import('@mysten/walrus');
      
      // Create Walrus client
      const walrusClient = new WalrusClient({
        network: 'testnet' as any,
        suiClient: suiClient as any,
      });

      // Convert JSON to Uint8Array
      const jsonString = JSON.stringify(data, null, 2);
      const contents = new TextEncoder().encode(jsonString);

      // Create WalrusFile
      const walrusFile = WalrusFile.from({
        contents,
        identifier: 'metadata.json',
      });

      // Create write flow for browser wallet integration
      const flow = walrusClient.writeFilesFlow({
        files: [walrusFile],
      });

      // Step 1: Encode the file
      await flow.encode();

      // Step 2: Register the blob on-chain (requires wallet signature)
      const registerTx = flow.register({
        epochs,
        owner: currentAccount.address,
        deletable: true,
      });

      const { digest } = await signAndExecuteTransaction({
        transaction: registerTx,
      });

      // Step 3: Upload to storage nodes
      await flow.upload({ digest });

      // Step 4: Certify the blob (requires wallet signature)
      const certifyTx = flow.certify();
      await signAndExecuteTransaction({
        transaction: certifyTx,
      });

      // Step 5: Get the uploaded files
      const files = await flow.listFiles();
      const blobId = files[0]?.blobId;

      if (!blobId) {
        throw new Error('No blob ID returned from upload');
      }

      return blobId;
    },
    onSuccess: (blobId) => {
      queryClient.invalidateQueries({ queryKey: ['walrus'] });
      console.log('JSON upload successful:', blobId);
    },
    onError: (error) => {
      console.error('JSON upload failed:', error);
    },
  });
}

/**
 * Hook to get a Walrus URL for direct use in img tags
 */
export function useWalrusUrl(blobId: string | undefined): string | undefined {
  if (!blobId) return undefined;
  return getWalrusUrl(blobId);
}

/**
 * Hook to fetch NFT metadata from Walrus
 * Specialized hook for NFT use case
 */
export function useNFTMetadata(metadataUrl: string | undefined) {
  return useQuery({
    queryKey: ['nft', 'metadata', metadataUrl],
    queryFn: () => {
      if (!metadataUrl) throw new Error('Metadata URL is required');
      return fetchJSONFromWalrus<{
        name: string;
        description: string;
        image: string;
        attributes?: Array<{
          trait_type: string;
          value: string | number;
        }>;
      }>(metadataUrl);
    },
    enabled: !!metadataUrl,
    staleTime: 15 * 60 * 1000, // 15 minutes - NFT metadata rarely changes
    retry: 2,
  });
}

/**
 * Hook to prefetch Walrus data
 * Useful for preloading data before it's needed
 */
export function usePrefetchWalrusData() {
  const queryClient = useQueryClient();

  return (blobId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['walrus', 'data', blobId],
      queryFn: () => fetchFromWalrus(blobId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook to prefetch multiple Walrus blobs
 */
export function usePrefetchWalrusBlobs() {
  const queryClient = useQueryClient();

  return (blobIds: string[]) => {
    blobIds.forEach((blobId) => {
      queryClient.prefetchQuery({
        queryKey: ['walrus', 'blob', blobId],
        queryFn: () => fetchBlobFromWalrus(blobId),
        staleTime: 10 * 60 * 1000,
      });
    });
  };
}
