import { useState } from "react";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { NFT_COLLECTION_ID } from "../../constants";
import { useNetworkVariable } from "../../networkConfig";
import { LoadingSpinner } from "../../LoadingSpinner";
import { useWalrusUpload, useWalrusUploadJSON } from "../../hooks/useWalrus";
import { getWalrusUrl } from "../../utils/walrus";

interface MintNFTFormProps {
  selectedUser: string | null;
  eligibleRewards: string[];
  adminCapId: string;
  onSuccess: () => void;
}

// Achievement type mapping
const ACHIEVEMENT_TYPES: Record<string, number> = {
  "Cycle Completion Champion": 1,
  "5 Cycles Milestone": 2,
  "10 Cycles Milestone": 3,
  "Perfect Attendance": 4,
};

export function MintNFTForm({
  selectedUser,
  eligibleRewards,
  adminCapId,
  onSuccess,
}: MintNFTFormProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [mintStatus, setMintStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const counterPackageId = useNetworkVariable("counterPackageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { mutateAsync: uploadFile } = useWalrusUpload();
  const { mutateAsync: uploadJSON } = useWalrusUploadJSON();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMint = async () => {
    if (!selectedUser || !selectedAchievement || !imageFile) {
      setErrorMessage("Please select a user, achievement, and upload an image");
      setMintStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Uploading image to Walrus...");
    setMintStatus("idle");
    setErrorMessage("");

    try {
      // 1. Upload image to Walrus using the hook
      const imageBlobId = await uploadFile({ data: imageFile });
      setUploadStatus(`Image uploaded: ${imageBlobId.slice(0, 8)}...`);

      // 2. Create and upload metadata JSON to Walrus
      const metadata = {
        name: selectedAchievement,
        description: `Awarded for ${selectedAchievement.toLowerCase()}`,
        image: getWalrusUrl(imageBlobId),
        attributes: [
          {
            trait_type: "Achievement",
            value: selectedAchievement,
          },
          {
            trait_type: "Earned Date",
            value: new Date().toISOString().split("T")[0],
          },
        ],
      };

      setUploadStatus("Uploading metadata to Walrus...");
      const metadataBlobId = await uploadJSON({ data: metadata });
      setUploadStatus(`Metadata uploaded: ${metadataBlobId.slice(0, 8)}...`);

      // 3. Create transaction to mint NFT
      setUploadStatus("Preparing transaction...");
      const tx = new Transaction();
      const achievementType = ACHIEVEMENT_TYPES[selectedAchievement];
      const earnedAt = Date.now();

      // Use the NFT_COLLECTION_ID constant (shared object)
      tx.moveCall({
        target: `${counterPackageId}::nft_rewards::mint_reward`,
        arguments: [
          tx.object(adminCapId),
          tx.object(NFT_COLLECTION_ID),
          tx.pure.address(selectedUser),
          tx.pure.u8(achievementType),
          tx.pure.string(imageBlobId),
          tx.pure.string(metadataBlobId),
          tx.pure.u64(earnedAt),
        ],
      });

      setUploadStatus("Minting NFT...");

      // 4. Sign and execute transaction
      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            setMintStatus("success");
            setUploadStatus("NFT minted successfully!");
            setIsUploading(false);
            
            // Reset form
            setTimeout(() => {
              setSelectedAchievement("");
              setImageFile(null);
              setImagePreview("");
              setUploadStatus("");
              setMintStatus("idle");
              onSuccess();
            }, 3000);
          },
          onError: (error) => {
            console.error("Mint transaction error:", error);
            setErrorMessage(`Transaction failed: ${error.message}`);
            setMintStatus("error");
            setIsUploading(false);
          },
        }
      );
    } catch (error: any) {
      console.error("Mint error:", error);
      setErrorMessage(error.message || "Failed to mint NFT");
      setMintStatus("error");
      setIsUploading(false);
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.07] border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          Mint NFT Reward
        </h3>
        <p className="text-sm text-slate-400">
          Upload artwork and mint an NFT reward for the selected user
        </p>
      </div>

      {!selectedUser ? (
        <div className="text-center py-8">
          <div className="text-5xl mb-3">👈</div>
          <p className="text-slate-400">Select a user from the eligible list</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected User */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-xs text-slate-400 mb-1">Minting for:</p>
            <p className="text-sm font-mono text-cyan-300">
              {truncateAddress(selectedUser)}
            </p>
          </div>

          {/* Achievement Selection */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Select Achievement
            </label>
            <select
              value={selectedAchievement}
              onChange={(e) => setSelectedAchievement(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
              disabled={isUploading}
            >
              <option value="">Choose an achievement...</option>
              {eligibleRewards.map((reward) => (
                <option key={reward} value={reward}>
                  {reward}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Upload NFT Image
            </label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="NFT Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="text-sm text-red-400 hover:text-red-300"
                    disabled={isUploading}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="text-slate-400 mb-4">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-6 py-2 bg-white/[0.1] hover:bg-white/[0.15] rounded-lg cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <p className="text-sm text-cyan-300">{uploadStatus}</p>
            </div>
          )}

          {/* Success Message */}
          {mintStatus === "success" && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-emerald-300">
                  NFT minted successfully! The reward has been sent to the user.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {mintStatus === "error" && errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❌</span>
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={
              !selectedAchievement || !imageFile || isUploading
            }
            className="w-full px-6 py-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>🎨</span>
                <span>Mint NFT Reward</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
