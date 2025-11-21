# Cross-Module Integration Documentation

This document describes how the different modules in the Group Susu Platform interact with each other.

## Module Dependencies

```
group_susu ──┐
             ├──> Events ──> reputation (via event listeners)
             │
             └──> Events ──> nft_rewards (via admin actions)

reputation ──> Events ──> nft_rewards (milestone triggers)

admin ──> nft_rewards (minting authorization)
```

## Event Flow

### 1. Contribution Flow

When a participant makes a contribution:

```
User calls: group_susu::contribute()
    ↓
Emits: ContributionMadeEvent {
    participant: address,
    group_id: ID,
    amount: u64,
    is_on_time: bool,
    timestamp: u64
}
    ↓
Frontend/Backend listens to event
    ↓
Calls: reputation::award_contribution_points()
    ↓
Emits: ReputationEvent {
    user: address,
    points_earned: u64,
    event_type: CONTRIBUTION,
    timestamp: u64
}
```

### 2. Round Distribution Flow

When a round is distributed:

```
Admin/User calls: group_susu::distribute_round()
    ↓
Transfers funds to recipient
    ↓
Emits: RoundDistributedEvent {
    group_id: ID,
    recipient: address,
    amount: u64,
    round: u64,
    timestamp: u64
}
    ↓
If cycle complete:
    Emits: CycleCompletedEvent {
        group_id: ID,
        participants: vector<address>,
        timestamp: u64
    }
```

### 3. Cycle Completion Flow

When a cycle completes:

```
CycleCompletedEvent emitted
    ↓
Frontend/Backend processes event
    ↓
For each participant:
    Calls: reputation::award_cycle_completion_bonus()
        ↓
    Emits: ReputationEvent (cycle complete)
        ↓
    Checks milestones:
        - 5 cycles completed?
        - 10 cycles completed?
        - Perfect attendance?
        ↓
    If milestone reached:
        Emits: MilestoneReachedEvent {
            user: address,
            milestone_type: u8,
            cycles_completed: u64,
            reputation_score: u64,
            timestamp: u64
        }
```

### 4. NFT Reward Flow

When a milestone is reached:

```
MilestoneReachedEvent emitted
    ↓
Admin Dashboard displays pending rewards
    ↓
Admin reviews and approves
    ↓
Admin calls: nft_rewards::mint_reward(
    admin_cap: &AdminCap,
    collection: &mut NFTCollection,
    recipient: address,
    achievement_type: u8,
    image_url: String,  // Walrus blob ID
    metadata_url: String,  // Walrus blob ID
    earned_at: u64
)
    ↓
Emits: NFTMintedEvent {
    nft_id: ID,
    recipient: address,
    name: String,
    achievement_type: u8,
    image_url: String,
    metadata_url: String,
    earned_at: u64
}
    ↓
NFT transferred to recipient
```

## Key Integration Points

### 1. Contribution Tracking

**group_susu.move:**
- Tracks contribution timing
- Determines if contribution is on-time (within 10% grace period)
- Emits `ContributionMadeEvent` with `is_on_time` flag

**reputation.move:**
- Listens for contribution events (via frontend/backend)
- Awards points based on timeliness:
  - On-time: +10 points
  - Late: +5 points
- Updates encrypted contribution history

### 2. Cycle Completion

**group_susu.move:**
- Detects when all participants have received payouts
- Sets `cycle_complete = true`
- Emits `CycleCompletedEvent` with all participant addresses

**reputation.move:**
- Awards +100 bonus points for cycle completion
- Increments `cycles_completed` counter
- Checks for milestone achievements
- Emits `MilestoneReachedEvent` when thresholds are met

### 3. Milestone Detection

**reputation.move** checks for these milestones:

1. **5 Cycles Milestone** (`cycles_completed == 5`)
   - Emits event with `milestone_type = 2`
   - Maps to `ACHIEVEMENT_MILESTONE_5_CYCLES` in nft_rewards

2. **10 Cycles Milestone** (`cycles_completed == 10`)
   - Emits event with `milestone_type = 3`
   - Maps to `ACHIEVEMENT_MILESTONE_10_CYCLES` in nft_rewards

3. **Perfect Attendance** (`on_time_contributions >= 10 && late_contributions == 0`)
   - Emits event with `milestone_type = 4`
   - Maps to `ACHIEVEMENT_PERFECT_ATTENDANCE` in nft_rewards

### 4. NFT Eligibility

**reputation.move** provides helper functions:
- `is_eligible_for_cycle_completion_nft()` - At least 1 cycle completed
- `is_eligible_for_5_cycles_nft()` - At least 5 cycles completed
- `is_eligible_for_10_cycles_nft()` - At least 10 cycles completed
- `is_eligible_for_perfect_attendance_nft()` - 10+ on-time, 0 late contributions

**nft_rewards.move:**
- Requires `AdminCap` for minting
- Validates achievement type exists in templates
- Stores Walrus blob IDs for metadata and images
- Emits `NFTMintedEvent` for indexer tracking

## Frontend Integration

The frontend should:

1. **Listen to Events:**
   - Subscribe to `ContributionMadeEvent`
   - Subscribe to `CycleCompletedEvent`
   - Subscribe to `MilestoneReachedEvent`
   - Subscribe to `NFTMintedEvent`

2. **Trigger Reputation Updates:**
   - When `ContributionMadeEvent` is detected, call `award_contribution_points()`
   - When `CycleCompletedEvent` is detected, call `award_cycle_completion_bonus()` for each participant

3. **Display NFT Eligibility:**
   - Query user's `ReputationProfile`
   - Use eligibility helper functions to show available rewards
   - Display pending rewards in admin dashboard

4. **Handle NFT Minting:**
   - Admin dashboard shows `MilestoneReachedEvent` events
   - Admin uploads metadata/images to Walrus
   - Admin calls `mint_reward()` with Walrus blob IDs
   - NFT is automatically transferred to recipient

## Security Considerations

1. **Authorization:**
   - Only profile owner can update their reputation
   - Only AdminCap holder can mint NFTs
   - Contribution events are trustless (emitted by smart contract)

2. **Data Privacy:**
   - Individual contribution details are encrypted using Seal
   - Aggregate group data remains public for transparency
   - Reputation scores are public, but detailed history is encrypted

3. **Event Integrity:**
   - All events are emitted by smart contracts, not user input
   - Events cannot be forged or manipulated
   - Indexer can verify event authenticity via blockchain

## Testing Recommendations

1. **End-to-End Flow:**
   - Create group → Join participants → Make contributions → Distribute rounds → Complete cycle
   - Verify events are emitted at each step
   - Verify reputation updates correctly
   - Verify milestone detection works

2. **Edge Cases:**
   - Late contributions (test grace period logic)
   - Multiple cycles in same group
   - Multiple groups for same user
   - Milestone reached across different groups

3. **Integration Tests:**
   - Test event listener → reputation update flow
   - Test milestone detection → NFT eligibility flow
   - Test admin minting → NFT transfer flow
