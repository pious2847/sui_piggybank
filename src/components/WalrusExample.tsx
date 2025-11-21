/**
 * Example component demonstrating Walrus integration
 * This can be used as a reference for implementing Walrus functionality
 */

import { useState } from 'react';
import {
  useWalrusUploadJSON,
  useWalrusJSON,
  useWalrusUrl,
  useNFTMetadata,
} from '../hooks/useWalrus';
import { getWalrusConfig, checkWalrusHealth } from '../utils/walrus';

/**
 * Example: Upload JSON to Walrus
 */
export function WalrusUploadExample() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: upload, data: blobId, isPending, isSuccess } = useWalrusUploadJSON();

  const handleUpload = () => {
    const data = { name, description, timestamp: Date.now() };
    upload({ data });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Upload JSON to Walrus</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleUpload}
          disabled={isPending || !name}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isPending ? 'Uploading...' : 'Upload'}
        </button>
        {isSuccess && blobId && (
          <div className="p-2 bg-green-100 rounded">
            <p className="text-sm">Success! Blob ID:</p>
            <code className="text-xs break-all">{blobId}</code>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Fetch JSON from Walrus
 */
export function WalrusFetchExample({ blobId }: { blobId?: string }) {
  const [inputBlobId, setInputBlobId] = useState('');
  const [activeBlobId, setActiveBlobId] = useState<string | undefined>(blobId);

  const { data, isLoading, error } = useWalrusJSON(activeBlobId, {
    enabled: !!activeBlobId,
  });

  const handleFetch = () => {
    setActiveBlobId(inputBlobId);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Fetch JSON from Walrus</h3>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Enter Blob ID"
          value={inputBlobId}
          onChange={(e) => setInputBlobId(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleFetch}
          disabled={!inputBlobId}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Fetch
        </button>
        {isLoading && <div className="text-gray-500">Loading...</div>}
        {error && (
          <div className="p-2 bg-red-100 rounded text-red-700">
            Error: {error.message}
          </div>
        )}
        {data && (
          <div className="p-2 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: Display image from Walrus
 */
export function WalrusImageExample({ blobId }: { blobId: string }) {
  const imageUrl = useWalrusUrl(blobId);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Display Image from Walrus</h3>
      <img
        src={imageUrl}
        alt="Walrus content"
        className="max-w-full h-auto rounded"
        onError={(e) => {
          console.error('Failed to load image from Walrus');
          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
        }}
      />
      <p className="text-xs text-gray-500 mt-2 break-all">Blob ID: {blobId}</p>
    </div>
  );
}

/**
 * Example: NFT Metadata Display
 */
export function NFTMetadataExample({ metadataUrl }: { metadataUrl: string }) {
  const { data: metadata, isLoading, error } = useNFTMetadata(metadataUrl);
  const imageUrl = useWalrusUrl(metadata?.image);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse space-y-2">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50">
        <p className="text-red-700">Failed to load NFT metadata</p>
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="p-4 border rounded-lg">
      <img
        src={imageUrl}
        alt={metadata.name}
        className="w-full h-48 object-cover rounded mb-4"
      />
      <h3 className="text-lg font-semibold">{metadata.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{metadata.description}</p>
      {metadata.attributes && metadata.attributes.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">Attributes:</p>
          {metadata.attributes.map((attr, index) => (
            <div key={index} className="text-xs text-gray-600">
              <span className="font-medium">{attr.trait_type}:</span> {attr.value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example: Walrus Configuration Display
 */
export function WalrusConfigExample() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const config = getWalrusConfig();

  const handleHealthCheck = async () => {
    setChecking(true);
    const healthy = await checkWalrusHealth();
    setIsHealthy(healthy);
    setChecking(false);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Walrus Configuration</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Aggregator URL:</span>
          <br />
          <code className="text-xs bg-gray-100 p-1 rounded">{config.aggregatorUrl}</code>
        </div>
        <div>
          <span className="font-medium">Publisher URL:</span>
          <br />
          <code className="text-xs bg-gray-100 p-1 rounded">{config.publisherUrl}</code>
        </div>
        <div>
          <span className="font-medium">Epochs:</span> {config.epochs}
        </div>
        <div>
          <span className="font-medium">Cache Duration:</span> {config.cacheDuration / 1000}s
        </div>
        <div>
          <span className="font-medium">Max Cache Size:</span> {config.maxCacheSize}
        </div>
        <div className="pt-2">
          <button
            onClick={handleHealthCheck}
            disabled={checking}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Check Health'}
          </button>
          {isHealthy !== null && (
            <span className={`ml-2 ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
              {isHealthy ? '✓ Healthy' : '✗ Unavailable'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Combined example component
 */
export function WalrusExamples() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Walrus Integration Examples</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WalrusConfigExample />
        <WalrusUploadExample />
        <WalrusFetchExample />
      </div>
    </div>
  );
}
