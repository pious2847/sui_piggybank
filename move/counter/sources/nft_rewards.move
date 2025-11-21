module counter::nft_rewards {
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::event;

    // --- Error Constants ---
    const E_INVALID_ADMIN_CAP: u64 = 3;

    // --- Achievement Type Constants ---
    const ACHIEVEMENT_CYCLE_COMPLETION: u8 = 1;
    const ACHIEVEMENT_MILESTONE_5_CYCLES: u8 = 2;
    const ACHIEVEMENT_MILESTONE_10_CYCLES: u8 = 3;
    const ACHIEVEMENT_PERFECT_ATTENDANCE: u8 = 4;

    // --- Data Structures ---

    /// Represents an NFT reward earned by a user
    /// Contains references to Walrus-stored metadata and images
    public struct NFTReward has key, store {
        id: UID,
        /// Name of the NFT reward
        name: String,
        /// Description of the achievement
        description: String,
        /// Walrus blob ID for the NFT image
        image_url: String,
        /// Walrus blob ID for full metadata JSON
        metadata_url: String,
        /// Type of achievement (1=cycle_completion, 2=milestone_5, etc.)
        achievement_type: u8,
        /// Timestamp when the NFT was earned (in milliseconds)
        earned_at: u64,
        /// Address of the recipient who earned this NFT
        recipient: address,
    }

    /// Collection object that tracks all NFT rewards on the platform
    /// This is a shared object that admins can use to mint new NFTs
    public struct NFTCollection has key {
        id: UID,
        /// Address of the admin who manages this collection
        admin: address,
        /// Total number of NFTs minted from this collection
        total_minted: u64,
        /// Templates for different reward types
        reward_types: Table<u8, RewardTemplate>,
    }

    /// Template for a specific type of reward
    /// Defines the base properties for NFTs of this achievement type
    public struct RewardTemplate has store, drop, copy {
        /// Name template for this reward type
        name: String,
        /// Description template for this reward type
        description: String,
        /// Base Walrus blob ID for the image (can be customized per mint)
        base_image_url: String,
        /// Achievement type identifier
        achievement_type: u8,
    }

    // --- Events ---

    /// Event emitted when an NFT reward is minted
    /// This event can be used to track all NFTs owned by a user via indexer
    public struct NFTMintedEvent has copy, drop {
        /// ID of the minted NFT
        nft_id: ID,
        /// Address of the recipient
        recipient: address,
        /// Name of the NFT
        name: String,
        /// Achievement type
        achievement_type: u8,
        /// Walrus blob ID for the image
        image_url: String,
        /// Walrus blob ID for metadata
        metadata_url: String,
        /// Timestamp when earned
        earned_at: u64,
    }

    // --- Initialization Function ---

    /// Initializes the NFT collection
    /// This is called during module deployment
    fun init(ctx: &mut TxContext) {
        let admin = ctx.sender();
        
        // Create reward templates table
        let mut reward_types = table::new<u8, RewardTemplate>(ctx);
        
        // Add default reward templates
        table::add(&mut reward_types, ACHIEVEMENT_CYCLE_COMPLETION, RewardTemplate {
            name: std::string::utf8(b"Cycle Completion Champion"),
            description: std::string::utf8(b"Completed a full group susu cycle"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_CYCLE_COMPLETION,
        });
        
        table::add(&mut reward_types, ACHIEVEMENT_MILESTONE_5_CYCLES, RewardTemplate {
            name: std::string::utf8(b"5 Cycles Milestone"),
            description: std::string::utf8(b"Completed 5 group susu cycles"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_MILESTONE_5_CYCLES,
        });
        
        table::add(&mut reward_types, ACHIEVEMENT_MILESTONE_10_CYCLES, RewardTemplate {
            name: std::string::utf8(b"10 Cycles Milestone"),
            description: std::string::utf8(b"Completed 10 group susu cycles"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_MILESTONE_10_CYCLES,
        });
        
        table::add(&mut reward_types, ACHIEVEMENT_PERFECT_ATTENDANCE, RewardTemplate {
            name: std::string::utf8(b"Perfect Attendance"),
            description: std::string::utf8(b"Made all contributions on time"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_PERFECT_ATTENDANCE,
        });
        
        let collection = NFTCollection {
            id: object::new(ctx),
            admin,
            total_minted: 0,
            reward_types,
        };
        
        // Share the collection so it can be accessed for minting
        transfer::share_object(collection);
    }

    // --- Admin Functions ---

    /// Initializes the NFT collection (can be called explicitly if needed)
    /// Creates a new NFT collection with default reward templates
    public fun init_nft_collection(ctx: &mut TxContext) {
        let admin = ctx.sender();
        
        // Create reward templates table
        let mut reward_types = table::new<u8, RewardTemplate>(ctx);
        
        // Add default reward templates
        table::add(&mut reward_types, ACHIEVEMENT_CYCLE_COMPLETION, RewardTemplate {
            name: std::string::utf8(b"Cycle Completion Champion"),
            description: std::string::utf8(b"Completed a full group susu cycle"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_CYCLE_COMPLETION,
        });
        
        table::add(&mut reward_types, ACHIEVEMENT_MILESTONE_5_CYCLES, RewardTemplate {
            name: std::string::utf8(b"5 Cycles Milestone"),
            description: std::string::utf8(b"Completed 5 group susu cycles"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_MILESTONE_5_CYCLES,
        });
        
        table::add(&mut reward_types, ACHIEVEMENT_MILESTONE_10_CYCLES, RewardTemplate {
            name: std::string::utf8(b"10 Cycles Milestone"),
            description: std::string::utf8(b"Completed 10 group susu cycles"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_MILESTONE_10_CYCLES,
        });
        
        table::add(&mut reward_types, ACHIEVEMENT_PERFECT_ATTENDANCE, RewardTemplate {
            name: std::string::utf8(b"Perfect Attendance"),
            description: std::string::utf8(b"Made all contributions on time"),
            base_image_url: std::string::utf8(b""),
            achievement_type: ACHIEVEMENT_PERFECT_ATTENDANCE,
        });
        
        let collection = NFTCollection {
            id: object::new(ctx),
            admin,
            total_minted: 0,
            reward_types,
        };
        
        // Share the collection so it can be accessed for minting
        transfer::share_object(collection);
    }

    /// Mints a new NFT reward for a user
    /// Requires AdminCap to authorize the minting operation
    /// Stores Walrus blob IDs for image and metadata
    public fun mint_reward(
        _admin_cap: &counter::admin::AdminCap,
        collection: &mut NFTCollection,
        recipient: address,
        achievement_type: u8,
        image_url: String,
        metadata_url: String,
        earned_at: u64,
        ctx: &mut TxContext
    ) {
        // Get the reward template for this achievement type
        assert!(table::contains(&collection.reward_types, achievement_type), E_INVALID_ADMIN_CAP);
        let template = table::borrow(&collection.reward_types, achievement_type);
        
        // Create the NFT reward
        let nft = NFTReward {
            id: object::new(ctx),
            name: template.name,
            description: template.description,
            image_url,
            metadata_url,
            achievement_type,
            earned_at,
            recipient,
        };
        
        // Get the NFT ID before transferring
        let nft_id = object::id(&nft);
        
        // Emit event for indexer to track user's NFTs
        event::emit(NFTMintedEvent {
            nft_id,
            recipient,
            name: template.name,
            achievement_type,
            image_url,
            metadata_url,
            earned_at,
        });
        
        // Increment total minted counter
        collection.total_minted = collection.total_minted + 1;
        
        // Transfer the NFT to the recipient
        transfer::public_transfer(nft, recipient);
    }

    /// Transfers an NFT reward to a new recipient
    /// Can be used to send NFTs between users
    public fun transfer_reward(
        nft: NFTReward,
        recipient: address,
        _ctx: &mut TxContext
    ) {
        transfer::public_transfer(nft, recipient);
    }

    // --- Query Functions ---

    // Note: To retrieve all NFTs for a user (get_user_nfts functionality),
    // use the Sui RPC/Indexer to query owned objects of type NFTReward.
    // Example using Sui TypeScript SDK:
    //   const nfts = await client.getOwnedObjects({
    //     owner: userAddress,
    //     filter: { StructType: `${packageId}::nft_rewards::NFTReward` }
    //   });
    // 
    // Alternatively, query NFTMintedEvent events filtered by recipient address
    // to get a historical list of all NFTs minted to a user.

    /// Retrieves the total number of NFTs minted
    public fun get_total_minted(collection: &NFTCollection): u64 {
        collection.total_minted
    }

    /// Retrieves the admin address
    public fun get_admin(collection: &NFTCollection): address {
        collection.admin
    }

    /// Retrieves NFT metadata
    public fun get_nft_metadata(nft: &NFTReward): (
        String,     // name
        String,     // description
        String,     // image_url
        String,     // metadata_url
        u8,         // achievement_type
        u64,        // earned_at
        address     // recipient
    ) {
        (
            nft.name,
            nft.description,
            nft.image_url,
            nft.metadata_url,
            nft.achievement_type,
            nft.earned_at,
            nft.recipient
        )
    }

    /// Checks if a reward template exists for a given achievement type
    public fun has_reward_template(collection: &NFTCollection, achievement_type: u8): bool {
        table::contains(&collection.reward_types, achievement_type)
    }

    /// Retrieves a reward template for a given achievement type
    public fun get_reward_template(collection: &NFTCollection, achievement_type: u8): (
        String,     // name
        String,     // description
        String,     // base_image_url
        u8          // achievement_type
    ) {
        let template = table::borrow(&collection.reward_types, achievement_type);
        (
            template.name,
            template.description,
            template.base_image_url,
            template.achievement_type
        )
    }

    /// Retrieves the Walrus blob IDs from an NFT
    /// Returns both the image URL and metadata URL for fetching from Walrus
    public fun get_walrus_references(nft: &NFTReward): (String, String) {
        (nft.image_url, nft.metadata_url)
    }

    /// Retrieves the recipient address of an NFT
    public fun get_recipient(nft: &NFTReward): address {
        nft.recipient
    }

    /// Retrieves the achievement type of an NFT
    public fun get_achievement_type(nft: &NFTReward): u8 {
        nft.achievement_type
    }

    /// Retrieves the earned timestamp of an NFT
    public fun get_earned_at(nft: &NFTReward): u64 {
        nft.earned_at
    }

    /// Retrieves the name of an NFT
    public fun get_name(nft: &NFTReward): String {
        nft.name
    }

    /// Retrieves the description of an NFT
    public fun get_description(nft: &NFTReward): String {
        nft.description
    }
}
