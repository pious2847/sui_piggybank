module counter::counter {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
    use sui::object::{Self, UID};
    use sui::balance::{Self, Balance};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};

    // --- Errors for clear transaction failures ---
    const E_PIGGY_BANK_IS_LOCKED: u64 = 0;

    // --- The Piggy Bank Object ---
    // This is owned by the user.
    public struct PiggyBank has key, store {
        id: UID,
        owner: address,
        // The balance of SUI stored inside.
        balance: Balance<SUI>,
        // The minimum amount of MIST required to break the bank.
        goal_amount: u64,
        // The unix timestamp (in ms) after which the bank can be broken.
        unlock_timestamp_ms: u64,
    }

    // --- Public Functions ---

    // Creates a new, empty PiggyBank and transfers it to the user.
    entry fun create(
        goal_amount: u64,
        unlock_timestamp_ms: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let piggy_bank = PiggyBank {
            id: object::new(ctx),
            owner: sender,
            balance: balance::zero(),
            goal_amount: goal_amount,
            unlock_timestamp_ms: unlock_timestamp_ms,
        };
        transfer::public_transfer(piggy_bank, sender);
    }

    // Deposits a Coin<SUI> into the user's PiggyBank.
    entry fun deposit(bank: &mut PiggyBank, coin: Coin<SUI>) {
        // Merge the coin's value into the bank's balance. The coin is destroyed.
        balance::join(&mut bank.balance, coin::into_balance(coin));
    }

    // "Breaks" the PiggyBank, returning all funds to the owner.
    // This function can only succeed if the conditions are met.
     entry fun break_piggy_bank(bank: PiggyBank, clock: &Clock, ctx: &mut TxContext) {
        let current_balance = balance::value(&bank.balance);

        // CRITICAL CHECKS:
        // 1. Has the unlock date passed?
        // 2. Has the savings goal been met?
        assert!(
            clock::timestamp_ms(clock) >= bank.unlock_timestamp_ms &&
            current_balance >= bank.goal_amount,
            E_PIGGY_BANK_IS_LOCKED
        );

        // Deconstruct the PiggyBank to get its fields.
        let PiggyBank { id, owner, balance, goal_amount: _, unlock_timestamp_ms: _ } = bank;

        // Destroy the UID wrapper.
        object::delete(id);

        // Convert the Balance back into a Coin and transfer it to the owner.
        let funds = coin::from_balance(balance, ctx);
        transfer::public_transfer(funds, owner);

        // Because `bank` was passed by value and not returned, the object is consumed and
        // destroyed at the end of this transaction, preventing any reuse.
    }
}