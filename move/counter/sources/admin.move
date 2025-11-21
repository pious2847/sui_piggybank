module counter::admin {
    // --- Data Structures ---

    /// Administrative capability object
    /// Grants permission to perform admin-only operations like minting NFT rewards
    /// This is a key-only object that can be transferred
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Platform configuration settings
    /// Stores global platform parameters that can be modified by admin
    public struct PlatformConfig has key {
        id: UID,
        /// Address of the current admin
        admin: address,
        /// Whether NFT minting is currently enabled
        nft_minting_enabled: bool,
        /// Minimum reputation score required to be eligible for rewards
        min_reputation_for_rewards: u64,
    }

    // --- Initialization Function ---

    /// Initializes the admin module
    /// Creates AdminCap and PlatformConfig, transfers AdminCap to deployer
    /// This function is automatically called once when the module is published
    fun init(ctx: &mut TxContext) {
        let admin = ctx.sender();
        
        // Create AdminCap and transfer to deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, admin);
        
        // Create PlatformConfig with default settings
        let platform_config = PlatformConfig {
            id: object::new(ctx),
            admin,
            nft_minting_enabled: true,
            min_reputation_for_rewards: 100,
        };
        
        // Share the config so it can be read by anyone but modified only by admin
        transfer::share_object(platform_config);
    }

    // --- Admin Functions ---

    /// Updates the platform configuration settings
    /// Requires AdminCap to authorize the operation
    public fun update_platform_config(
        _admin_cap: &AdminCap,
        config: &mut PlatformConfig,
        nft_minting_enabled: bool,
        min_reputation_for_rewards: u64,
        _ctx: &mut TxContext
    ) {
        config.nft_minting_enabled = nft_minting_enabled;
        config.min_reputation_for_rewards = min_reputation_for_rewards;
    }

    /// Transfers the AdminCap to a new admin address
    /// This effectively changes who has admin privileges
    #[allow(lint(custom_state_change))]
    public fun transfer_admin_cap(
        admin_cap: AdminCap,
        new_admin: address,
        config: &mut PlatformConfig,
        _ctx: &mut TxContext
    ) {
        // Update the admin address in config
        config.admin = new_admin;
        
        // Transfer the AdminCap to the new admin
        transfer::transfer(admin_cap, new_admin);
    }

    // --- Query Functions ---

    /// Retrieves the current admin address from config
    public fun get_admin(config: &PlatformConfig): address {
        config.admin
    }

    /// Checks if NFT minting is currently enabled
    public fun is_nft_minting_enabled(config: &PlatformConfig): bool {
        config.nft_minting_enabled
    }

    /// Gets the minimum reputation required for rewards
    public fun get_min_reputation_for_rewards(config: &PlatformConfig): u64 {
        config.min_reputation_for_rewards
    }

    /// Retrieves all platform configuration settings
    public fun get_platform_config(config: &PlatformConfig): (
        address,    // admin
        bool,       // nft_minting_enabled
        u64         // min_reputation_for_rewards
    ) {
        (
            config.admin,
            config.nft_minting_enabled,
            config.min_reputation_for_rewards
        )
    }
}
