module counter::group_susu {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::Clock;
    use sui::table::{Self, Table};
    use sui::hash;
    use sui::bcs;
    use sui::event;
    use std::string::String;

    // --- Error Constants ---
    const E_NOT_PARTICIPANT: u64 = 1;
    const E_GROUP_FULL: u64 = 2;
    const E_INVALID_CONTRIBUTION_AMOUNT: u64 = 3;
    const E_ROUND_NOT_COMPLETE: u64 = 4;
    const E_CYCLE_ALREADY_COMPLETE: u64 = 5;
    const E_ALREADY_PARTICIPANT: u64 = 6;
    const E_INVALID_PARAMETERS: u64 = 7;
    const E_UNAUTHORIZED: u64 = 9;
    const E_DECRYPTION_FAILED: u64 = 10;
    const E_INVALID_PUBLIC_KEY: u64 = 11;

    // --- Data Structures ---

    /// Represents a participant in a group susu
    #[allow(unused_field)]
    public struct ParticipantInfo has store, drop, copy {
        address: address,
        contributions_made: u64,
        has_received_payout: bool,
        join_timestamp: u64,
    }

    // --- Events ---

    /// Event emitted when a participant makes a contribution
    /// Used to trigger reputation point awards
    public struct ContributionMadeEvent has copy, drop {
        /// Address of the participant who contributed
        participant: address,
        /// Group ID where contribution was made
        group_id: ID,
        /// Amount contributed
        amount: u64,
        /// Whether the contribution was on time
        is_on_time: bool,
        /// Timestamp of the contribution
        timestamp: u64,
    }

    /// Event emitted when a cycle completes
    /// Used to trigger NFT reward eligibility and reputation bonuses
    public struct CycleCompletedEvent has copy, drop {
        /// Group ID where cycle completed
        group_id: ID,
        /// List of all participants who completed the cycle
        participants: vector<address>,
        /// Timestamp when cycle completed
        timestamp: u64,
    }

    /// Event emitted when a round is distributed
    /// Used for tracking payout history
    public struct RoundDistributedEvent has copy, drop {
        /// Group ID where distribution occurred
        group_id: ID,
        /// Recipient of the round payout
        recipient: address,
        /// Amount distributed
        amount: u64,
        /// Round number
        round: u64,
        /// Timestamp of distribution
        timestamp: u64,
    }

    /// Event emitted when a new group is created
    /// Used for discovering and listing groups
    public struct GroupCreatedEvent has copy, drop {
        /// ID of the newly created group
        group_id: ID,
        /// Name of the group
        name: String,
        /// Address of the group creator
        creator: address,
        /// Contribution amount per round
        contribution_amount: u64,
        /// Contribution frequency in milliseconds
        contribution_frequency_ms: u64,
        /// Maximum number of participants
        max_participants: u64,
        /// Timestamp when group was created
        timestamp: u64,
    }

    /// Main Group Susu object representing a rotating savings pool
    /// This is a shared object that multiple participants can interact with
    public struct GroupSusu has key, store {
        id: UID,
        /// Name of the group
        name: String,
        /// Address of the group creator
        creator: address,
        /// Fixed contribution amount per round (in MIST)
        contribution_amount: u64,
        /// Time between contributions (in milliseconds)
        contribution_frequency_ms: u64,
        /// Maximum number of participants allowed
        max_participants: u64,
        /// List of participant addresses
        participants: vector<address>,
        /// Current number of participants
        participant_count: u64,
        /// Pool balance holding all contributions
        balance: Balance<SUI>,
        /// Current round number (0-indexed)
        current_round: u64,
        /// Total number of rounds in a complete cycle
        total_rounds: u64,
        /// Ordered list of recipients for each round
        round_recipients: vector<address>,
        /// Tracks the last contribution time for each participant
        last_contribution_time: Table<address, u64>,
        /// Whether the current cycle is complete
        cycle_complete: bool,
        /// Timestamp when the group was created (in milliseconds)
        created_at: u64,
        /// Seal-encrypted participant contribution data
        /// Maps participant address to encrypted contribution details
        encrypted_participant_data: Table<address, vector<u8>>,
    }

    // --- Seal Encryption Helper Functions ---

    /// Encrypts participant contribution data using a simplified encryption approach
    /// In production, this would use Seal protocol with proper key management
    /// 
    /// Parameters:
    /// - data: The sensitive contribution data to encrypt (serialized as bytes)
    /// - public_key: The recipient's public key for encryption
    /// 
    /// Returns: Encrypted data as a byte vector
    fun encrypt_contribution_data(
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
        // In production, this would use proper Seal encryption
        let mut encrypted = hash::blake2b256(&combined);
        
        // Append original data length for decryption validation
        let data_len = data.length();
        encrypted.push_back((data_len % 256) as u8);
        
        encrypted
    }

    /// Decrypts participant contribution data with authorization checks
    /// Only authorized users (participant or group creator) can decrypt
    /// 
    /// Parameters:
    /// - encrypted_data: The encrypted data to decrypt
    /// - private_key: The private key for decryption
    /// - authorized_address: The address authorized to decrypt
    /// - ctx: Transaction context for authorization verification
    /// 
    /// Returns: Decrypted data as a byte vector
    fun decrypt_contribution_data(
        encrypted_data: vector<u8>,
        private_key: vector<u8>,
        authorized_address: address,
        ctx: &TxContext
    ): vector<u8> {
        // Verify caller is authorized
        assert!(ctx.sender() == authorized_address, E_UNAUTHORIZED);
        
        // Validate encrypted data is not empty
        assert!(encrypted_data.length() > 0, E_DECRYPTION_FAILED);
        
        // In production, this would use proper Seal decryption
        
        // Combine private key with encrypted data for verification
        let mut combined = vector::empty<u8>();
        combined.append(encrypted_data);
        combined.append(private_key);
        
        // Hash to verify decryption capability
        let decrypted = hash::blake2b256(&combined);
        
        decrypted
    }

    // --- Public Functions ---

    /// Creates a new Group Susu with specified parameters
    /// The creator becomes the first participant
    public fun create_group_susu(
        name: String,
        contribution_amount: u64,
        contribution_frequency_ms: u64,
        max_participants: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate parameters
        assert!(contribution_amount > 0, E_INVALID_PARAMETERS);
        assert!(contribution_frequency_ms > 0, E_INVALID_PARAMETERS);
        assert!(max_participants > 1, E_INVALID_PARAMETERS);

        let creator = ctx.sender();
        let created_at = clock.timestamp_ms();
        
        // Initialize participants vector with creator
        let mut participants = vector::empty<address>();
        participants.push_back(creator);

        // Initialize round recipients with creator
        let mut round_recipients = vector::empty<address>();
        round_recipients.push_back(creator);

        // Create last contribution time table
        let mut last_contribution_time = table::new<address, u64>(ctx);
        table::add(&mut last_contribution_time, creator, 0);

        // Create encrypted participant data table
        let encrypted_participant_data = table::new<address, vector<u8>>(ctx);

        let group_susu = GroupSusu {
            id: object::new(ctx),
            name,
            creator,
            contribution_amount,
            contribution_frequency_ms,
            max_participants,
            participants,
            participant_count: 1,
            balance: balance::zero<SUI>(),
            current_round: 0,
            total_rounds: max_participants,
            round_recipients,
            last_contribution_time,
            cycle_complete: false,
            created_at,
            encrypted_participant_data,
        };

        // Emit group created event for discovery
        event::emit(GroupCreatedEvent {
            group_id: object::id(&group_susu),
            name,
            creator,
            contribution_amount,
            contribution_frequency_ms,
            max_participants,
            timestamp: created_at,
        });

        // Share the object so multiple participants can interact with it
        transfer::share_object(group_susu);
    }

    /// Allows a user to join an existing Group Susu
    /// Validates that the group is not full and the user is not already a participant
    public fun join_group(
        group: &mut GroupSusu,
        _clock: &Clock,
        ctx: &mut TxContext
    ) {
        let participant = ctx.sender();
        
        // Check if group is full
        assert!(group.participant_count < group.max_participants, E_GROUP_FULL);
        
        // Check if user is already a participant
        assert!(!group.participants.contains(&participant), E_ALREADY_PARTICIPANT);

        // Add participant to the group
        group.participants.push_back(participant);
        group.round_recipients.push_back(participant);
        group.participant_count = group.participant_count + 1;
        
        // Initialize last contribution time for new participant
        table::add(&mut group.last_contribution_time, participant, 0);
    }

    /// Allows a participant to contribute to the group pool
    /// Validates contribution amount and updates balance
    /// Encrypts individual contribution details while keeping aggregates public
    /// Emits ContributionMadeEvent for reputation tracking
    public fun contribute(
        group: &mut GroupSusu,
        payment: Coin<SUI>,
        public_key: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let participant = ctx.sender();
        
        // Verify participant is a member
        assert!(group.participants.contains(&participant), E_NOT_PARTICIPANT);
        
        // Verify cycle is not complete
        assert!(!group.cycle_complete, E_CYCLE_ALREADY_COMPLETE);
        
        // Verify contribution amount is correct
        let contribution_value = payment.value();
        assert!(contribution_value == group.contribution_amount, E_INVALID_CONTRIBUTION_AMOUNT);
        
        // Add contribution to group balance
        let contribution_balance = payment.into_balance();
        group.balance.join(contribution_balance);
        
        // Update last contribution time
        let current_time = clock.timestamp_ms();
        
        // Determine if contribution is on time
        // For simplicity, we consider a contribution on time if it's made within the frequency window
        let last_contribution = if (table::contains(&group.last_contribution_time, participant)) {
            *table::borrow(&group.last_contribution_time, participant)
        } else {
            0
        };
        
        let expected_time = if (last_contribution == 0) {
            group.created_at + group.contribution_frequency_ms
        } else {
            last_contribution + group.contribution_frequency_ms
        };
        
        // Consider on time if within 10% grace period of the frequency
        let grace_period = group.contribution_frequency_ms / 10;
        let is_on_time = current_time <= (expected_time + grace_period);
        
        if (table::contains(&group.last_contribution_time, participant)) {
            table::remove(&mut group.last_contribution_time, participant);
        };
        table::add(&mut group.last_contribution_time, participant, current_time);
        
        // Encrypt individual contribution details
        if (public_key.length() > 0) {
            let mut contribution_data = vector::empty<u8>();
            
            // Serialize contribution details
            let amount_bytes = bcs::to_bytes(&contribution_value);
            contribution_data.append(amount_bytes);
            
            let timestamp_bytes = bcs::to_bytes(&current_time);
            contribution_data.append(timestamp_bytes);
            
            let round_bytes = bcs::to_bytes(&group.current_round);
            contribution_data.append(round_bytes);
            
            // Get existing encrypted data if any
            let existing_data = if (table::contains(&group.encrypted_participant_data, participant)) {
                table::remove(&mut group.encrypted_participant_data, participant)
            } else {
                vector::empty<u8>()
            };
            
            // Append to existing data
            contribution_data.append(existing_data);
            
            // Encrypt and store
            let encrypted = encrypt_contribution_data(contribution_data, public_key);
            table::add(&mut group.encrypted_participant_data, participant, encrypted);
        };
        
        // Emit event for reputation tracking
        event::emit(ContributionMadeEvent {
            participant,
            group_id: object::id(group),
            amount: contribution_value,
            is_on_time,
            timestamp: current_time,
        });
    }

    /// Distributes the pooled funds to the current round recipient
    /// Implements round-robin payout distribution
    /// Emits events for reputation tracking and NFT eligibility
    public fun distribute_round(
        group: &mut GroupSusu,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify cycle is not complete
        assert!(!group.cycle_complete, E_CYCLE_ALREADY_COMPLETE);
        
        // Verify round is complete (all participants have contributed)
        assert!(is_round_complete_internal(group), E_ROUND_NOT_COMPLETE);
        
        // Calculate payout amount (contribution_amount * participant_count)
        let payout_amount = group.contribution_amount * group.participant_count;
        
        // Get current round recipient
        let recipient_index = (group.current_round % group.participant_count);
        let recipient = *group.round_recipients.borrow(recipient_index);
        
        let current_time = clock.timestamp_ms();
        let current_round = group.current_round;
        
        // Transfer funds to recipient
        let payout = coin::take(&mut group.balance, payout_amount, ctx);
        transfer::public_transfer(payout, recipient);
        
        // Emit round distribution event
        event::emit(RoundDistributedEvent {
            group_id: object::id(group),
            recipient,
            amount: payout_amount,
            round: current_round,
            timestamp: current_time,
        });
        
        // Increment round counter
        group.current_round = group.current_round + 1;
        
        // Check if cycle is complete (all participants have received payout once)
        if (group.current_round >= group.participant_count) {
            group.cycle_complete = true;
            
            // Emit cycle completion event for NFT eligibility and reputation bonuses
            event::emit(CycleCompletedEvent {
                group_id: object::id(group),
                participants: group.participants,
                timestamp: current_time,
            });
        };
    }

    /// Marks a cycle as complete
    /// This function can be called to explicitly complete a cycle
    public fun complete_cycle(
        group: &mut GroupSusu,
        _ctx: &mut TxContext
    ) {
        // Verify all participants have received payout
        assert!(group.current_round >= group.participant_count, E_ROUND_NOT_COMPLETE);
        
        group.cycle_complete = true;
    }

    // --- Decryption Access Functions ---

    /// Allows authorized users to decrypt their contribution data
    /// Only the participant or group creator can decrypt
    public fun get_decrypted_contribution_data(
        group: &GroupSusu,
        participant: address,
        private_key: vector<u8>,
        ctx: &TxContext
    ): vector<u8> {
        let caller = ctx.sender();
        
        // Verify caller is either the participant or the group creator
        assert!(
            caller == participant || caller == group.creator,
            E_UNAUTHORIZED
        );
        
        // Get encrypted data
        if (!table::contains(&group.encrypted_participant_data, participant)) {
            return vector::empty<u8>()
        };
        
        let encrypted_data = table::borrow(&group.encrypted_participant_data, participant);
        
        // Decrypt and return
        decrypt_contribution_data(*encrypted_data, private_key, caller, ctx)
    }

    /// Retrieves encrypted contribution data (for off-chain decryption)
    public fun get_encrypted_contribution_data(
        group: &GroupSusu,
        participant: address,
    ): vector<u8> {
        if (!table::contains(&group.encrypted_participant_data, participant)) {
            return vector::empty<u8>()
        };
        
        *table::borrow(&group.encrypted_participant_data, participant)
    }

    // --- Query Functions ---

    /// Retrieves comprehensive information about a group
    public fun get_group_info(group: &GroupSusu): (
        String,           // name
        address,          // creator
        u64,              // contribution_amount
        u64,              // contribution_frequency_ms
        u64,              // max_participants
        u64,              // participant_count
        u64,              // balance
        u64,              // current_round
        bool,             // cycle_complete
        u64               // created_at
    ) {
        (
            group.name,
            group.creator,
            group.contribution_amount,
            group.contribution_frequency_ms,
            group.max_participants,
            group.participant_count,
            group.balance.value(),
            group.current_round,
            group.cycle_complete,
            group.created_at
        )
    }

    /// Retrieves status information for a specific participant
    public fun get_participant_status(
        group: &GroupSusu,
        participant: address
    ): (bool, u64, u64) {
        // Check if participant is a member
        let is_participant = group.participants.contains(&participant);
        
        if (!is_participant) {
            return (false, 0, 0)
        };
        
        // Get last contribution time
        let last_contribution = if (table::contains(&group.last_contribution_time, participant)) {
            *table::borrow(&group.last_contribution_time, participant)
        } else {
            0
        };
        
        // Find participant's position in round recipients
        let mut position = 0;
        let mut i = 0;
        while (i < group.round_recipients.length()) {
            if (*group.round_recipients.borrow(i) == participant) {
                position = i;
                break
            };
            i = i + 1;
        };
        
        (is_participant, last_contribution, position)
    }

    /// Public helper to check if the current round is complete
    public fun is_round_complete(group: &GroupSusu): bool {
        is_round_complete_internal(group)
    }

    // --- Helper Functions ---

    /// Internal helper to check if the current round is complete
    /// A round is complete when all participants have contributed
    fun is_round_complete_internal(group: &GroupSusu): bool {
        let mut i = 0;
        let mut contributions_this_round = 0;
        
        while (i < group.participant_count) {
            let participant = *group.participants.borrow(i);
            if (table::contains(&group.last_contribution_time, participant)) {
                let last_time = *table::borrow(&group.last_contribution_time, participant);
                // Check if participant has contributed (last_time > 0)
                if (last_time > 0) {
                    contributions_this_round = contributions_this_round + 1;
                };
            };
            i = i + 1;
        };
        
        contributions_this_round == group.participant_count
    }
}
