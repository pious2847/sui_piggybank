import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig";
import { NFTData } from "../components/nft/NFTCard";
import { nftQueryConfig, getUserNFTsQueryKey, getNFTMintEventsQueryKey } from "../queryConfig";

/**
 * Hook to fetch all NFT rewards owned by a user
 * Queries the blockchain for NFTReward objects owned by the address
 */
export function useUserNFTs(address: string | undefined) {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: getUserNFTsQueryKey(address || "", counterPackageId),
    queryFn: async () => {
      if (!address || !counterPackageId) return [];

      try {
        console.log('Fetching NFTs for address:', address);
        console.log('Using package ID:', counterPackageId);
        console.log('Looking for type:', `${counterPackageId}::nft_rewards::NFTReward`);
        
        // Query for NFTReward objects owned by the user
        const { data } = await suiClient.getOwnedObjects({
          owner: address,
          filter: {
            StructType: `${counterPackageId}::nft_rewards::NFTReward`,
          },
          options: {
            showContent: true,
            showType: true,
          },
        });

        console.log('NFT query response:', data);
        console.log('Found', data.length, 'NFT objects');

        // Parse NFT data from the response
        const nfts: NFTData[] = data
          .map((obj) => {
            const content = obj.data?.content;
            if (content && "fields" in content) {
              const fields = content.fields as any;
              console.log('NFT fields:', fields);
              
              return {
                id: obj.data?.objectId || "",
                name: fields.name || "Unknown NFT",
                description: fields.description || "",
                imageUrl: fields.image_url || "",
                metadataUrl: fields.metadata_url || "",
                achievementType: Number(fields.achievement_type || 0),
                earnedAt: Number(fields.earned_at || 0),
                recipient: fields.recipient || address,
              } as NFTData;
            }
            return null;
          })
          .filter((nft): nft is NFTData => nft !== null);

        // Sort by earned date (most recent first)
        nfts.sort((a, b) => b.earnedAt - a.earnedAt);

        console.log('Parsed NFTs:', nfts);
        return nfts;
      } catch (error) {
        console.error("Error fetching user NFTs:", error);
        return [];
      }
    },
    enabled: !!address,
    ...nftQueryConfig,
  });
}

/**
 * Hook to fetch NFT minting events for a user
 * This can be used as an alternative or supplement to owned objects query
 */
export function useNFTMintEvents(address: string | undefined) {
  const suiClient = useSuiClient();
  const counterPackageId = useNetworkVariable("counterPackageId");

  return useQuery({
    queryKey: getNFTMintEventsQueryKey(address || "", counterPackageId),
    queryFn: async () => {
      if (!address || !counterPackageId) return [];

      try {
        // Query for NFTMintedEvent events
        const events = await suiClient.queryEvents({
          query: {
            MoveEventType: `${counterPackageId}::nft_rewards::NFTMintedEvent`,
          },
          limit: 50,
          order: "descending",
        });

        // Filter events for this specific user
        const userEvents = events.data
          .filter((event) => {
            const parsedJson = event.parsedJson as any;
            return parsedJson?.recipient === address;
          })
          .map((event) => {
            const parsedJson = event.parsedJson as any;
            return {
              nftId: parsedJson.nft_id,
              recipient: parsedJson.recipient,
              name: parsedJson.name,
              achievementType: Number(parsedJson.achievement_type),
              imageUrl: parsedJson.image_url,
              metadataUrl: parsedJson.metadata_url,
              earnedAt: Number(parsedJson.earned_at),
            };
          });

        return userEvents;
      } catch (error) {
        console.error("Error fetching NFT mint events:", error);
        return [];
      }
    },
    enabled: !!address,
    ...nftQueryConfig,
  });
}

/**
 * Utility function to fetch NFT metadata from Walrus
 * This can be used to get additional metadata stored on Walrus
 */
export async function fetchNFTMetadataFromWalrus(
  blobId: string,
  walrusAggregatorUrl: string = "https://aggregator.walrus-testnet.walrus.space"
): Promise<any> {
  try {
    const response = await fetch(`${walrusAggregatorUrl}/v1/${blobId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching NFT metadata from Walrus:", error);
    throw error;
  }
}
