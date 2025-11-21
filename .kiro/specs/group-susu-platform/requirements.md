# Requirements Document

## Introduction

This document outlines the requirements for expanding the SuiVault platform from individual piggy banks to a comprehensive group susu (rotating savings and credit association) platform. The expansion includes group savings functionality, user reputation system, NFT rewards via Walrus integration, admin-controlled reward minting, Seal encryption for sensitive data, an explore page for discovering groups, and a revamped frontend with additional pages and features.

## Glossary

- **SuiVault**: The decentralized savings platform built on Sui blockchain
- **Susu**: A rotating savings and credit association where members contribute regularly and take turns receiving the pooled funds
- **Group Susu**: A smart contract object representing a group savings pool with multiple participants
- **Reputation System**: A mechanism that tracks and rewards user participation and completion of group susu cycles
- **NFT Reward**: A non-fungible token awarded to users for completing group susu cycles or achieving milestones
- **Walrus**: A decentralized storage network used for storing NFT metadata and assets
- **Seal**: A privacy-preserving encryption protocol on Sui for protecting sensitive blockchain data
- **Admin Cap**: An administrative capability object that grants permission to mint NFT rewards
- **Explore Page**: A frontend page for discovering and browsing available group susu opportunities
- **Frontend Application**: The React-based web interface for interacting with SuiVault
- **Participant**: A user who has joined a group susu and makes regular contributions
- **Cycle**: A complete round of contributions where each participant has received the pooled funds once

## Requirements

### Requirement 1: Group Susu Smart Contract

**User Story:** As a user, I want to create and join group susu savings pools, so that I can save collectively with others and access pooled funds on a rotating basis.

#### Acceptance Criteria

1. THE SuiVault SHALL provide a function to create a Group Susu with specified contribution amount, contribution frequency, maximum participants, and cycle duration
2. WHEN a user requests to join a Group Susu, THE SuiVault SHALL add the user as a Participant if the maximum participant limit has not been reached
3. WHEN a Participant makes a contribution, THE SuiVault SHALL accept the contribution amount and update the Group Susu balance
4. WHEN all Participants have made their contributions for a round, THE SuiVault SHALL transfer the pooled funds to the designated recipient Participant for that round
5. WHEN a Cycle completes with all Participants having received funds once, THE SuiVault SHALL mark the Cycle as complete

### Requirement 2: User Reputation System

**User Story:** As a user, I want to earn reputation points for participating in and completing group susu cycles, so that I can build trust and unlock better opportunities on the platform.

#### Acceptance Criteria

1. THE SuiVault SHALL create a Reputation Profile for each user upon their first interaction with the platform
2. WHEN a Participant makes a timely contribution to a Group Susu, THE SuiVault SHALL increase the user's reputation score by a predefined amount
3. WHEN a Participant completes a full Cycle, THE SuiVault SHALL award bonus reputation points to the user
4. THE SuiVault SHALL store reputation scores on-chain as part of the user's profile
5. THE SuiVault SHALL provide a function to query a user's current reputation score

### Requirement 3: NFT Reward System with Walrus Integration

**User Story:** As a user, I want to receive NFT rewards for completing group susu cycles and achieving milestones, so that I have verifiable proof of my achievements and can collect digital rewards.

#### Acceptance Criteria

1. THE SuiVault SHALL define an NFT Reward structure with metadata including achievement type, timestamp, and Walrus storage reference
2. WHEN a Participant completes a Group Susu Cycle, THE SuiVault SHALL trigger an NFT reward eligibility event
3. THE SuiVault SHALL store NFT metadata and assets on Walrus decentralized storage
4. THE SuiVault SHALL mint NFT Rewards with references to Walrus-stored content
5. THE SuiVault SHALL transfer minted NFT Rewards to the recipient user's address

### Requirement 4: Admin-Controlled NFT Minting

**User Story:** As a platform administrator, I want exclusive control over minting NFT rewards, so that I can ensure rewards are distributed fairly and prevent unauthorized reward creation.

#### Acceptance Criteria

1. THE SuiVault SHALL create an Admin Cap capability object during platform initialization
2. THE SuiVault SHALL restrict NFT minting functions to require the Admin Cap as a parameter
3. WHEN an NFT mint function is called without a valid Admin Cap, THE SuiVault SHALL reject the transaction
4. THE SuiVault SHALL allow the Admin Cap holder to mint NFT Rewards for eligible users
5. THE SuiVault SHALL transfer the Admin Cap to the designated administrator address upon deployment

### Requirement 5: Seal Encryption for Sensitive Data

**User Story:** As a user, I want my sensitive financial data encrypted on the blockchain, so that my privacy is protected while maintaining transparency where needed.

#### Acceptance Criteria

1. THE SuiVault SHALL integrate Seal encryption protocol for protecting sensitive user data
2. WHEN storing Participant contribution history, THE SuiVault SHALL encrypt personal financial details using Seal
3. THE SuiVault SHALL encrypt user identity information in Reputation Profiles using Seal
4. THE SuiVault SHALL provide decryption capabilities only to authorized parties with proper credentials
5. THE SuiVault SHALL maintain public visibility of Group Susu aggregate data while encrypting individual Participant details

### Requirement 6: Explore Page for Group Discovery

**User Story:** As a user, I want to browse and discover available group susu opportunities, so that I can find groups that match my savings goals and preferences.

#### Acceptance Criteria

1. THE Frontend Application SHALL display an Explore Page listing all active Group Susu opportunities
2. THE Frontend Application SHALL show Group Susu details including contribution amount, frequency, available slots, and current Participants
3. THE Frontend Application SHALL provide filtering options by contribution amount range, frequency, and available slots
4. THE Frontend Application SHALL provide search functionality to find specific Group Susu by name or criteria
5. WHEN a user selects a Group Susu, THE Frontend Application SHALL display detailed information and a join button

### Requirement 7: User Profile and Reputation Display

**User Story:** As a user, I want to view my profile with reputation score and earned NFT rewards, so that I can track my achievements and progress on the platform.

#### Acceptance Criteria

1. THE Frontend Application SHALL display a User Profile page showing reputation score, completed cycles, and earned NFT Rewards
2. THE Frontend Application SHALL render NFT Rewards with images and metadata retrieved from Walrus storage
3. THE Frontend Application SHALL show a reputation history timeline with earned points and milestones
4. THE Frontend Application SHALL display badges or visual indicators for reputation levels
5. THE Frontend Application SHALL provide a shareable profile link for users to showcase their achievements

### Requirement 8: Group Susu Management Interface

**User Story:** As a group creator or participant, I want to manage my group susu activities, so that I can track contributions, view member status, and monitor cycle progress.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide a Group Management page for creators to view all Participants and contribution status
2. THE Frontend Application SHALL display a contribution schedule showing upcoming payment dates and amounts
3. THE Frontend Application SHALL show the current round recipient and payout status
4. THE Frontend Application SHALL provide notifications for upcoming contribution deadlines
5. THE Frontend Application SHALL allow Participants to view their position in the payout rotation

### Requirement 9: Enhanced Dashboard with Analytics

**User Story:** As a user, I want to see an overview dashboard of my savings activities, so that I can monitor my individual piggy banks and group susu participation in one place.

#### Acceptance Criteria

1. THE Frontend Application SHALL display a Dashboard page showing both individual PiggyBank objects and Group Susu memberships
2. THE Frontend Application SHALL show total savings across all accounts and groups
3. THE Frontend Application SHALL display charts and graphs for savings progress over time
4. THE Frontend Application SHALL show upcoming milestones and unlock dates
5. THE Frontend Application SHALL provide quick action buttons for common tasks like deposit and create new group

### Requirement 10: Admin Dashboard for Platform Management

**User Story:** As a platform administrator, I want a dedicated admin interface, so that I can manage NFT rewards, monitor platform activity, and maintain system health.

#### Acceptance Criteria

1. THE Frontend Application SHALL provide an Admin Dashboard accessible only to Admin Cap holders
2. THE Frontend Application SHALL display pending NFT reward requests for administrator approval
3. THE Frontend Application SHALL show platform statistics including total users, active groups, and completed cycles
4. THE Frontend Application SHALL provide an interface to mint and distribute NFT Rewards to eligible users
5. THE Frontend Application SHALL display system health metrics and recent transaction activity