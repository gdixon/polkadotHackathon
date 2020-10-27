#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod raffle {
    #[cfg(not(feature = "ink-as-dependency"))]
    use ink_storage::{
        collections::HashMap as StorageHashMap,
    };

    /// import Keccak256 to construct random u64 to settle ticket draws
    use ink_env::{
        hash::{
            Keccak256,
        }
    };
    
    /// min number of entries before the timer starts
    const MIN_ENTRIES: u64 = 5;
    /// max number of draws before funds are transferred to beneficiary
    const MAX_DRAWS: u64 = 2;
    /// 60000 * 15 (15 minutes in ms)
    const RUN_TIME: u64 = 900000;
    /// sets the minimum acceptable price of the entry (0.01)
    const MIN_PRICE: u128 = 10000000000000;
    /// sets the maximum acceptable price of the entry (0.1)
    const MAX_PRICE: u128 = 100000000000000;

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
        // when the MIN_ENTRIES is satisfied record the start time (ms)
        start_time: Timestamp,
        // when the MIN_ENTRIES is satisfied record start time plus RUN_TIME
        end_time: Timestamp,
        // record the entrants as acc->ticket
        entrants: StorageHashMap<AccountId, u64>,
        // record the entries as ticket->acc
        entries: StorageHashMap<u64, AccountId>,
        // record the winners as draw_no->acc
        winners: [Option<AccountId>; MAX_DRAWS as usize]
    }

    impl Raffle {
        /// Creates a new raffle smart contract initialised with the given beneficiary
        #[ink(constructor)]
        pub fn new(beneficiary: AccountId) -> Self {
            Self { 
                beneficiary: beneficiary,
                funds: 0,
                tickets: 0,
                draws: 0,
                start_time: 0,
                end_time: 0,
                entrants: StorageHashMap::new(),
                entries: StorageHashMap::new(),
                winners: [None, None]
            }
        }

        /// Return the block_timestamp as a timestamp (u64)
        fn now(&self) -> Timestamp {
            self.env().block_timestamp()
        }

        /// Random number -- retrieve a random number by feeding state through Keccak256
        fn rand(&self) -> u64 {
            // output will be a u64 filled with random int
            let mut output: u64 = 0;
            // feed data into the hash func from env
            let encodable = [self.now(), self.start_time, self.end_time, self.tickets, self.draws];
            // encode the data using Keccak256
            let encoded = self.env().hash_encoded::<Keccak256, _>(&encodable);
            // construct a random hash using envs random fn
            let mut hashed = self.env().random(&encoded);
            // use hash to construct uint
            let random = hashed.as_mut();
            for rand in random.iter() {
                output += *rand as u64;
            }
            // return the rand u64 output
            output
        }

        /// Records entries that pass in between 0.01 and 0.1 inclusively (only 1 entry per AccountId)
        /// Stop allowing entries to be recorded after the end_time has passed
        #[ink(message)]
        #[ink(payable)]
        pub fn enter(&mut self) {
            // use std::time::Instant;
            let now = self.now();
            let caller = self.env().caller();
            let amount = self.env().transferred_balance();
            
            // check if the raffle has ended
            assert!(
                self.end_time == 0 || self.tickets < MIN_ENTRIES || now < self.end_time,
                "Closed for new entants"
            );

            // check if the given amount is within range
            assert!(
                amount >= MIN_PRICE && amount <= MAX_PRICE,
                "Wrong amount paid"
            );

            // check if the caller has already been entered into the raffle
            assert!(
                self.entrants.contains_key(&caller) == false,
                "Must only enter once"
            );

            // incr ticket number
            self.tickets += 1;
            // record the entrant
            self.entrants.insert(caller, self.tickets);
            self.entries.insert(self.tickets, caller);

            // record start/end time on fifth entry
            if self.tickets == MIN_ENTRIES {
                // unimportant - but might as well know
                self.start_time = self.now();
                // end time is the start_time + (RUN_TIME) in MS
                self.end_time = self.start_time + RUN_TIME;
            }

            // save the funds to send to beneficiary later
            self.funds += amount;
        }

        /// Draws up to the maximum number of winners (MAX_DRAWS)
        #[ink(message)]
        pub fn draw(&mut self) {
            // check if we're inside of draw time
            assert!(
                self.end_time > 0 && self.tickets >= MIN_ENTRIES && self.now() >= self.end_time,
                "Not ready to draw yet"
            );

            // ensure we only draw n* times
            assert!(
                self.draws < MAX_DRAWS,
                "Winners already decided"
            );
            
            // pick the winner at "random" from available tickets (!0 indexed)
            let winner = self.rand() % self.tickets + 1;

            // record the winning account
            let winning_account = self.entries[&winner];
            
            // record the winner (0 indexed)
            self.winners[self.draws as usize] = Some(winning_account);

            // incr the draws
            self.draws += 1;

            // send all funds to the beneficiary
            if self.draws == MAX_DRAWS {
                // transfer the funds sent in
                let _ = self.env().transfer(self.beneficiary, self.funds);
            }
        }

        /// Return the end_time from storage
        #[ink(message)]
        pub fn get_end(&self) -> u64 {
            // return the end_time
            self.end_time
        }

        /// Return the start_time from storage
        #[ink(message)]
        pub fn get_start(&self) -> u64 {
            // return the start_time
            self.start_time
        }
        
        /// Return the number of tickets sold from storage
        #[ink(message)]
        pub fn get_tickets_sold(&self) -> u64 {
            // return the number of tickets
            self.tickets
        }

        /// Return the number of tickets drawn from storage
        #[ink(message)]
        pub fn get_tickets_drawn(&self) -> u64 {
            // return the number of draws
            self.draws
        }

        /// Return the winning accounts from storage
        #[ink(message)]
        pub fn get_winners(&self) -> [Option<AccountId>; MAX_DRAWS as usize] {
            // return the winners
            self.winners
        }
        
    }

}
