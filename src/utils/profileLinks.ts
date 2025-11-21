/**
 * Utility functions for generating and handling shareable profile links
 */

/**
 * Generates a shareable profile link for a given Sui address
 * @param address - The Sui wallet address
 * @param baseUrl - Optional base URL (defaults to current origin)
 * @returns The full shareable profile URL
 */
export function generateProfileLink(address: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/profile/${address}`;
}

/**
 * Copies a profile link to the clipboard
 * @param address - The Sui wallet address
 * @returns Promise that resolves when copy is successful
 */
export async function copyProfileLink(address: string): Promise<void> {
  const link = generateProfileLink(address);
  await navigator.clipboard.writeText(link);
}

/**
 * Shares a profile link using the Web Share API (if available)
 * Falls back to copying to clipboard if Web Share is not supported
 * @param address - The Sui wallet address
 * @param userName - Optional user name for share text
 * @returns Promise that resolves when share/copy is complete
 */
export async function shareProfileLink(
  address: string,
  userName?: string
): Promise<void> {
  const link = generateProfileLink(address);
  const title = userName 
    ? `${userName}'s SuiVault Profile` 
    : "SuiVault Profile";
  const text = "Check out this reputation and achievements on SuiVault!";

  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url: link,
      });
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== "AbortError") {
        // Fallback to copy
        await copyProfileLink(address);
      }
    }
  } else {
    // Fallback to copy
    await copyProfileLink(address);
  }
}

/**
 * Formats a Sui address for display (shortened version)
 * @param address - The full Sui wallet address
 * @param prefixLength - Number of characters to show at start (default: 6)
 * @param suffixLength - Number of characters to show at end (default: 4)
 * @returns Formatted address string
 */
export function formatAddress(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Validates if a string is a valid Sui address format
 * @param address - The address string to validate
 * @returns True if the address appears to be valid
 */
export function isValidSuiAddress(address: string): boolean {
  // Sui addresses are 66 characters long and start with "0x"
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}
