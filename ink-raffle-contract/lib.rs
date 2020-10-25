#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
pub mod raffle {
    #[cfg(not(feature = "ink-as-dependency"))]
    use ink_storage::{
        collections::HashMap as StorageHashMap,
    };

    /// min number of entries before the timer starts
    const MIN_ENTRIES: u64 = 5;
    /// max number of draws before funds are transferred to beneficiary
    const MAX_DRAWS: u64 = 2;
    /// 60 * 15
    const RUN_TIME: u64 = 900;
    /// 0.01*(10**18)
    const MIN_PRICE: u128 = 10000000000000000;
    /// 0.1*(10**18)
    const MAX_PRICE: u128 = 100000000000000000;

    #[ink(storage)]
    pub struct Raffle {
        // record the raffles beneficiary (or organiser)
        beneficiary: AccountId,
        // record all funds transferred in
        funds: u128,
        // record how many tickets are sold
        tickets: u64,
        // record how many winners have been drawn
        draws: u64,
        // when the MIN_ENTRIES is satisfied record the start time
        raffle_start_time: Timestamp,
        // when the MIN_ENTRIES is satisfied record start time plus RUN_TIME
        raffle_end_time: Timestamp,
        // record the entrants as acc->ticket
        entrants: StorageHashMap<AccountId, u64>,
        // record the entries as ticket->acc
        entries: StorageHashMap<u64, AccountId>,
        // record the winners as drawNo->acc
        winners: StorageHashMap<u64, AccountId>
    }

    impl Raffle {
        /// Creates a new raffle smart contract initialized with the given value.
        #[ink(constructor)]
        pub fn new(beneficiary: AccountId) -> Self {
            Self { 
                beneficiary: beneficiary,
                funds: 0,
                tickets: 0,
                draws: 0,
                raffle_start_time: 0,
                raffle_end_time: 0,
                entrants: StorageHashMap::new(),
                entries: StorageHashMap::new(),
                winners: StorageHashMap::new()
            }
        }

        /// Return the block_timestamp as a timestamp (u64)
        fn now() -> Timestamp {
            Self::env().block_timestamp()
        }

        /// Records entries that pass in more than 0.01 and less than 0.1 (only 1 entry per AccountId)
        /// Stop allowing entries to be recorded after the raffle_end_time has passed
        #[ink(message)]
        pub fn enter(&mut self) -> bool {
            // use std::time::Instant;
            let now = Self::now();
            let caller = self.env().caller();
            let amount = self.env().transferred_balance();
            // check if the raffle has ended
            if self.raffle_end_time != 0 && self.tickets >= MIN_ENTRIES && now > self.raffle_end_time {

                // Closed for new entants
                return false;
            }
            // check if the given amount is within range
            if amount < MIN_PRICE || amount > MAX_PRICE {

                // Wrong amount paid
                return false;
            }
            // check if the caller has already been entered into the raffle
            if self.entrants.contains_key(&caller) {

                // Must only enter once
                return false;
            }
            // incr ticket number
            self.tickets += 1;
            // record the entrant
            self.entrants.insert(caller, self.tickets);
            self.entries.insert(self.tickets, caller);

            // record start/end time on fifth entry
            if self.tickets == MIN_ENTRIES {
                // unimportant - but might as well know
                self.raffle_start_time = Self::now();
                // end time is the start_time + (60 * 15)
                self.raffle_end_time = self.raffle_start_time + RUN_TIME;
            }

            // save the funds to send to beneficiary later
            self.funds += amount;

            // successfully entered
            return true;
        }

        /// Draws up to the maximum number of winners (2)
        #[ink(message)]
        pub fn draw(&mut self) -> bool {
            // check if in draw time
            if self.raffle_end_time == 0 || self.tickets < MIN_ENTRIES || Self::now() < self.raffle_end_time {
                
                // Not ready to draw yet
                return false;
            }
            // ensure we only draw n* times
            if self.draws >= MAX_DRAWS {
                
                // Winners already decided
                return false;
            }

            // incr the draws
            self.draws += 1;

            // pick the winner at "random" from available tickets 
            // (this is unsafe and is barely random - but no rule to say it must be - for a real contract use an oracle)
            let winner = Self::now() % self.tickets + 1;

            // record the winning account
            let winning_account = self.entries[&winner];
            
            // record the winner
            self.winners.insert(self.draws, winning_account);

            // send all funds to the beneficiary
            if self.draws == MAX_DRAWS {
                // transfer the funds sent in
                let _ = self.env().transfer(self.beneficiary, self.funds);
            }

            // successfully completed
            return true;
        }
        
    }

}
