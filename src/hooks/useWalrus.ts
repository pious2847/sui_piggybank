/**
 * React hooks for Walrus integration
 * 
 * Using WalrusService with HTTP API instead of SDK to avoid WASM issues
 * Provides hooks for uploading and fetching data from Walrus with React Query integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount } from '@mysten/dapp-kit';
import {
  fetchFromWalrus,
  fetchJSONFromWalrus,
  fetchBlobFromWalrus,
  getWalrusUrl,
  WalrusError,
} from '../utils/walrus';
import { WalrusService } from '../services/walrus.service';

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
 * Hook to upload data to Walrus using HTTP API
 * 
 * This uses the WalrusService which directly calls the Walrus HTTP endpoints
 */
export function useWalrusUpload() {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: string | Blob | Uint8Array | File;
    }) => {
      if (!currentAccount) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      // Convert data to File if needed
      let file: File;

      if (data instanceof File) {
        file = data;
      } else if (typeof data === 'string') {
        const blob = new Blob([data], { type: 'text/plain' });
        file = new File([blob], 'upload.txt', { type: 'text/plain' });
      } else if (data instanceof Blob) {
        file = new File([data], 'upload.bin', { type: 'application/octet-stream' });
      } else {
        // Convert Uint8Array by creating a new one to ensure proper type
        const uint8Array = new Uint8Array(data as Uint8Array);
        const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
        file = new File([blob], 'upload.bin', { type: 'application/octet-stream' });
      }

      // Upload using WalrusService
      const result = await WalrusService.uploadFile(file, currentAccount.address);

      return result.blobId;
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
 * Hook to upload JSON data to Walrus using HTTP API
 */
export function useWalrusUploadJSON() {
  const queryClient = useQueryClient();
  const currentAccount = useCurrentAccount();

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      data: any;
    }) => {
      if (!currentAccount) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      // Upload using WalrusService
      const result = await WalrusService.uploadMetadata(data, currentAccount.address);

      return result.blobId;
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
