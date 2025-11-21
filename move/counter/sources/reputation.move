module counter::reputation {
    use sui::hash;
    use sui::bcs;

    // --- Error Constants ---
    const E_UNAUTHORIZED: u64 = 3;
    const E_DECRYPTION_FAILED: u64 = 10;
    const E_INVALID_PUBLIC_KEY: u64 = 11;

    // --- Event Type Constants ---
    const EVENT_TYPE_CONTRIBUTION: u8 = 1;
    const EVENT_TYPE_CYCLE_COMPLETE: u8 = 2;
    #[allow(unused_const)]
    const EVENT_TYPE_MILESTONE: u8 = 3;

    // --- Milestone Constants ---
    const MILESTONE_5_CYCLES: u64 = 5;
    const MILESTONE_10_CYCLES: u64 = 10;
    const MILESTONE_PERFECT_ATTENDANCE_THRESHOLD: u64 = 10; // 10 on-time contributions

    // --- Data Structures ---

    /// Represents a user's reputation profile on the platform
    /// This is an owned object that tracks participation and achievements
    public struct ReputationProfile has key, store {
        id: UID,
        /// Owner of this reputation profile
        owner: address,
        /// Current reputation score
        reputation_score: u64,
        /// Number of complete cycles participated in
        cycles_completed: u64,
        /// Total number of contributions made
        total_contributions: u64,
        /// Number of on-time contributions
        on_time_contributions: u64,
        /// Number of late contributions
        late_contributions: u64,
        /// Timestamp when profile was created (in milliseconds)
        created_at: u64,
        /// Seal-encrypted sensitive user data
        encrypted_data: vector<u8>,
    }

    /// Event emitted when reputation changes occur
    /// Used for tracking reputation history and triggering rewards
    public struct ReputationEvent has copy, drop {
        /// User whose reputation changed
        user: address,
        /// Points earned in this event
        points_earned: u64,
        /// Type of event (1=contribution, 2=cycle_complete, 3=milestone)
        event_type: u8,
        /// Timestamp of the event (in milliseconds)
        timestamp: u64,
    }

    /// Event emitted when a user reaches a milestone
    /// Used to trigger NFT reward eligibility
    public struct MilestoneReachedEvent has copy, drop {
        /// User who reached the milestone
        user: address,
        /// Type of milestone (5_cycles, 10_cycles, perfect_attendance)
        milestone_type: u8,
        /// Current cycles completed
        cycles_completed: u64,
        /// Current reputation score
        reputation_score: u64,
        /// Timestamp when milestone was reached
        timestamp: u64,
    }

    // --- Seal Encryption Helper Functions ---

    /// Encrypts user data using a simplified encryption approach
    /// In production, this would use Seal protocol with proper key management
    /// For now, we use a hash-based encryption as a placeholder
    /// 
    /// Parameters:
    /// - data: The sensitive data to encrypt (serialized as bytes)
    /// - public_key: The recipient's public key for encryption
    /// 
    /// Returns: Encrypted data as a byte vector
    public fun encrypt_user_data(
        data: vector<u8>,
        public_key: vector<u8>,
    ): vector<u8> {
        // Validate public key is not empty
        assert!(public_key.length() > 0, E_INVALID_PUBLIC_KEY);
        
        // Create a combined vector for hashing
        let mut combined = vector::empty<u8>();
        combined.append(data);
        combined.append(public_key);
        
        // Use hash as a simple encryption mechanism
        // In production, this would use proper Seal encryption with BLS12-381
        let mut encrypted = hash::blake2b256(&combined);
        
        // Append original data length for decryption validation
        let data_len = data.length();
        encrypted.push_back((data_len % 256) as u8);
        
        encrypted
    }

    /// Decrypts user data with authorization checks
    /// Only authorized users (profile owner or admin) can decrypt
    /// 
    /// Parameters:
    /// - encrypted_data: The encrypted data to decrypt
    /// - private_key: The private key for decryption
    /// - authorized_address: The address authorized to decrypt
    /// - ctx: Transaction context for authorization verification
    /// 
    /// Returns: Decrypted data as a byte vector
    public fun decrypt_user_data(
        encrypted_data: vector<u8>,
        private_key: vector<u8>,
        authorized_address: address,
        ctx: &TxContext
    ): vector<u8> {
        // Verify caller is authorized
        assert!(ctx.sender() == authorized_address, E_UNAUTHORIZED);
        
        // Validate encrypted data is not empty
        assert!(encrypted_data.length() > 0, E_DECRYPTION_FAILED);
        
        // In production, this would use proper Seal decryption with BLS12-381
        // For now, we return a placeholder indicating successful authorization
        
        // Combine private key with encrypted data for verification
        let mut combined = vector::empty<u8>();
        combined.append(encrypted_data);
        combined.append(private_key);
        
        // Hash to verify decryption capability
        let decrypted = hash::blake2b256(&combined);
        
        decrypted
    }

    // --- Public Functions ---

    /// Creates a new reputation profile for a user
    /// Each user should only have one profile
    /// Sensitive fields are encrypted using Seal encryption
    #[allow(lint(self_transfer))]
    public fun create_reputation_profile(
        created_at: u64,
        public_key: vector<u8>,
        ctx: &mut TxContext
    ) {
        let owner = ctx.sender();
        
        // Prepare sensitive data for encryption
        // This includes initial profile metadata that should be private
        let mut sensitive_data = vector::empty<u8>();
        
        // Serialize owner address (convert to bytes)
        let owner_bytes = bcs::to_bytes(&owner);
        sensitive_data.append(owner_bytes);
        
        // Add timestamp
        let timestamp_bytes = bcs::to_bytes(&created_at);
        sensitive_data.append(timestamp_bytes);
        
        // Encrypt the sensitive data
        let encrypted_data = if (public_key.length() > 0) {
            encrypt_user_data(sensitive_data, public_key)
        } else {
            // If no public key provided, store empty encrypted data
            vector::empty<u8>()
        };
        
        let profile = ReputationProfile {
            id: object::new(ctx),
            owner,
            reputation_score: 0,
            cycles_completed: 0,
            total_contributions: 0,
            on_time_contributions: 0,
            late_contributions: 0,
            created_at,
            encrypted_data,
        };

        // Transfer ownership to the user
        transfer::transfer(profile, owner);
    }

    /// Awards reputation points for making a contribution
    /// Timely contributions earn more points than late ones
    /// Updates encrypted data with contribution history
    public fun award_contribution_points(
        profile: &mut ReputationProfile,
        is_on_time: bool,
        timestamp: u64,
        public_key: vector<u8>,
        ctx: &TxContext
    ) {
        // Verify caller is the profile owner
        assert!(ctx.sender() == profile.owner, E_UNAUTHORIZED);
        
        // Award points based on timeliness
        let points = if (is_on_time) {
            profile.on_time_contributions = profile.on_time_contributions + 1;
            10 // +10 points for timely contribution
        } else {
            profile.late_contributions = profile.late_contributions + 1;
            5 // +5 points for late contribution
        };
        
        profile.reputation_score = profile.reputation_score + points;
        profile.total_contributions = profile.total_contributions + 1;
        
        // Update encrypted data with new contribution details
        if (public_key.length() > 0) {
            let mut contribution_data = vector::empty<u8>();
            
            // Serialize contribution details
            let timestamp_bytes = bcs::to_bytes(&timestamp);
            contribution_data.append(timestamp_bytes);
            
            let points_bytes = bcs::to_bytes(&points);
            contribution_data.append(points_bytes);
            
            let is_on_time_bytes = bcs::to_bytes(&is_on_time);
            contribution_data.append(is_on_time_bytes);
            
            // Append to existing encrypted data
            let existing_data = profile.encrypted_data;
            contribution_data.append(existing_data);
            
            // Re-encrypt with updated data
            profile.encrypted_data = encrypt_user_data(contribution_data, public_key);
        };
        
        // Emit reputation event
        sui::event::emit(ReputationEvent {
            user: profile.owner,
            points_earned: points,
            event_type: EVENT_TYPE_CONTRIBUTION,
            timestamp,
        });
    }

    /// Awards bonus reputation points for completing a full cycle
    /// This is a significant achievement that earns substantial points
    /// Checks for milestone achievements and emits events for NFT eligibility
    public fun award_cycle_completion_bonus(
        profile: &mut ReputationProfile,
        timestamp: u64,
        ctx: &TxContext
    ) {
        // Verify caller is the profile owner
        assert!(ctx.sender() == profile.owner, E_UNAUTHORIZED);
        
        let bonus_points = 100; // +100 points for cycle completion
        
        profile.reputation_score = profile.reputation_score + bonus_points;
        profile.cycles_completed = profile.cycles_completed + 1;
        
        // Emit reputation event
        sui::event::emit(ReputationEvent {
            user: profile.owner,
            points_earned: bonus_points,
            event_type: EVENT_TYPE_CYCLE_COMPLETE,
            timestamp,
        });
        
        // Check for milestone achievements and emit events for NFT eligibility
        let cycles = profile.cycles_completed;
        
        // Check for 5 cycles milestone
        if (cycles == MILESTONE_5_CYCLES) {
            sui::event::emit(MilestoneReachedEvent {
                user: profile.owner,
                milestone_type: 2, // ACHIEVEMENT_MILESTONE_5_CYCLES from nft_rewards
                cycles_completed: cycles,
                reputation_score: profile.reputation_score,
                timestamp,
            });
        };
        
        // Check for 10 cycles milestone
        if (cycles == MILESTONE_10_CYCLES) {
            sui::event::emit(MilestoneReachedEvent {
                user: profile.owner,
                milestone_type: 3, // ACHIEVEMENT_MILESTONE_10_CYCLES from nft_rewards
                cycles_completed: cycles,
                reputation_score: profile.reputation_score,
                timestamp,
            });
        };
        
        // Check for perfect attendance milestone (10+ on-time contributions)
        if (profile.on_time_contributions >= MILESTONE_PERFECT_ATTENDANCE_THRESHOLD && 
            profile.late_contributions == 0) {
            sui::event::emit(MilestoneReachedEvent {
                user: profile.owner,
                milestone_type: 4, // ACHIEVEMENT_PERFECT_ATTENDANCE from nft_rewards
                cycles_completed: cycles,
                reputation_score: profile.reputation_score,
                timestamp,
            });
        };
    }

    /// Updates the encrypted data field with Seal-encrypted information
    /// Only the profile owner can update their encrypted data
    public fun update_encrypted_data(
        profile: &mut ReputationProfile,
        encrypted_data: vector<u8>,
        ctx: &TxContext
    ) {
        // Verify caller is the profile owner
        assert!(ctx.sender() == profile.owner, E_UNAUTHORIZED);
        
        profile.encrypted_data = encrypted_data;
    }

    // --- Query Functions ---

    /// Retrieves the current reputation score for a user
    public fun get_reputation_score(profile: &ReputationProfile): u64 {
        profile.reputation_score
    }

    /// Retrieves comprehensive profile information
    public fun get_profile_info(profile: &ReputationProfile): (
        address,    // owner
        u64,        // reputation_score
        u64,        // cycles_completed
        u64,        // total_contributions
        u64,        // on_time_contributions
        u64,        // late_contributions
        u64         // created_at
    ) {
        (
            profile.owner,
            profile.reputation_score,
            profile.cycles_completed,
            profile.total_contributions,
            profile.on_time_contributions,
            profile.late_contributions,
            profile.created_at
        )
    }

    /// Retrieves the encrypted data (for authorized decryption off-chain)
    public fun get_encrypted_data(profile: &ReputationProfile): vector<u8> {
        profile.encrypted_data
    }

    /// Checks if a profile belongs to a specific address
    public fun is_owner(profile: &ReputationProfile, address: address): bool {
        profile.owner == address
    }

    // --- NFT Eligibility Helper Functions ---

    /// Checks if a user is eligible for the cycle completion NFT
    public fun is_eligible_for_cycle_completion_nft(profile: &ReputationProfile): bool {
        profile.cycles_completed >= 1
    }

    /// Checks if a user is eligible for the 5 cycles milestone NFT
    public fun is_eligible_for_5_cycles_nft(profile: &ReputationProfile): bool {
        profile.cycles_completed >= MILESTONE_5_CYCLES
    }

    /// Checks if a user is eligible for the 10 cycles milestone NFT
    public fun is_eligible_for_10_cycles_nft(profile: &ReputationProfile): bool {
        profile.cycles_completed >= MILESTONE_10_CYCLES
    }

    /// Checks if a user is eligible for the perfect attendance NFT
    public fun is_eligible_for_perfect_attendance_nft(profile: &ReputationProfile): bool {
        profile.on_time_contributions >= MILESTONE_PERFECT_ATTENDANCE_THRESHOLD &&
        profile.late_contributions == 0
    }

    /// Gets the number of cycles completed
    public fun get_cycles_completed(profile: &ReputationProfile): u64 {
        profile.cycles_completed
    }

    /// Gets the number of on-time contributions
    public fun get_on_time_contributions(profile: &ReputationProfile): u64 {
        profile.on_time_contributions
    }

    /// Gets the number of late contributions
    public fun get_late_contributions(profile: &ReputationProfile): u64 {
        profile.late_contributions
    }
}
