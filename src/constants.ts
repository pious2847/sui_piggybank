// Counter Package IDs
export const DEVNET_COUNTER_PACKAGE_ID =
    import.meta.env.VITE_DEVNET_COUNTER_PACKAGE_ID;

export const TESTNET_COUNTER_PACKAGE_ID =
    import.meta.env.VITE_TESTNET_COUNTER_PACKAGE_ID;

export const MAINNET_COUNTER_PACKAGE_ID =
    import.meta.env.VITE_MAINNET_COUNTER_PACKAGE_ID;


// Deployed Object IDs (Testnet)
export const ADMIN_CAP_ID = import.meta.env.VITE_ADMIN_CAP_ID;
export const PLATFORM_CONFIG_ID = import.meta.env.VITE_PLATFORM_CONFIG_ID;
export const NFT_COLLECTION_ID = import.meta.env.VITE_NFT_COLLECTION_ID;


// Walrus Configuration (Testnet)
export const WALRUS_TESTNET_AGGREGATOR =
    import.meta.env.VITE_WALRUS_AGGREGATOR_URL;

export const WALRUS_TESTNET_PUBLISHER =
    import.meta.env.VITE_WALRUS_PUBLISHER_URL;


// Walrus Configuration (Mainnet)
export const WALRUS_MAINNET_AGGREGATOR =
    import.meta.env.VITE_WALRUS_MAINNET_AGGREGATOR;

export const WALRUS_MAINNET_PUBLISHER =
    import.meta.env.VITE_WALRUS_MAINNET_PUBLISHER;


// Default Epochs
export const DEFAULT_WALRUS_EPOCHS =
    Number(import.meta.env.VITE_DEFAULT_WALRUS_EPOCHS || 5);
