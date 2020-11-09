#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod auction {
    #[cfg(not(feature = "ink-as-dependency"))]
    use ink_storage::{
        collections::HashMap as StorageHashMap,
    };

    // import string type
    use ink_prelude::string::String;

    #[ink(storage)]
    pub struct Auction {
        // record the item being sold
        item: String,
        // record the auctions beneficiary
        beneficiary: AccountId,
        // the acution start time (ms)
        start_time: Timestamp,
        // start time plus RUN_TIME
        end_time: Timestamp,
        /// has the auction ended
        ended: bool,
        /// record the number of bids made
        bids: u64,
        // record the winning bid
        highest_bid: u128,
        // record the winning bidder
        highest_bidder: AccountId,
        // record the value that is to be returned to losing bidders
        pending_returns: StorageHashMap<AccountId, u128>,
    }

    /// Auction has been created
    #[ink(event)]
    pub struct NewAuction {
    }

    /// The highest bid has increased
    #[ink(event)]
    pub struct HighestBidIncreased {
    }

    /// Auction has been ended
    #[ink(event)]
    pub struct AuctionEnded {
    }

    impl Auction {
        /// Creates a new raffle smart contract initialised with the given beneficiary
        #[ink(constructor)]
        pub fn new(item: String, beneficiary: AccountId, run_time: u64) -> Self {
            // construct the initial state
            let inst = Self { 
                item: item.clone(),
                beneficiary: beneficiary,
                ended: false,
                bids: 0,
                highest_bid: 0,
                highest_bidder: beneficiary,
                start_time: Self::env().block_timestamp(),
                end_time: Self::env().block_timestamp() + run_time,
                pending_returns: StorageHashMap::new(),
            };
            // emit event declaring the auction started
            Self::env().emit_event(NewAuction {});
            // return self from constructor
            inst
        }

        /// Return the block_timestamp as a timestamp (u128)
        fn now(&self) -> Timestamp {
            self.env().block_timestamp()
        }

        /// Record bids - only allowing if the auction is still running and the value sent is higher that the highest_bid
        #[ink(message)]
        #[ink(payable)]
        pub fn bid(&mut self) {
            // get the timestamp from the block
            let now = self.now();
            let caller = self.env().caller();
            let amount = self.env().transferred_balance();
            
            // check if the raffle has ended
            assert!(
                now <= self.end_time,
                "Auction is over"
            );
            
            // check if the given amount is within range
            assert!(
                amount >= self.highest_bid,
                "There is already a higher bid"
            );

            // record pending_return
            if self.highest_bid > 0 {
                // check the old highest_bid into pending_returns
                if self.pending_returns.contains_key(&self.highest_bidder) {
                    // incr the owed amount
                    self.pending_returns[&self.highest_bidder] += self.highest_bid;
                } else {
                    // ensure the key is inserted before we alter it using addition assignment
                    self.pending_returns.insert(self.highest_bidder, self.highest_bid);
                }
            } 

            // record the new highest bidder
            self.highest_bidder = caller;
            self.highest_bid = amount;
            self.bids += 1;

            // emit event declaring the auction started
            Self::env().emit_event(HighestBidIncreased {});
        }

        /// Return funds associated with losing bids to the caller
        #[ink(message)]
        pub fn return_funds(&mut self) {
            // get caller and any money owed
            let caller = self.env().caller();
            let amount = self.pending_returns[&caller];
            // when an amount is present...
            if amount > 0 {
                // It is important to set this to zero because the recipient
                // can call this function again as part of the receiving call
                // before `send` returns.
                self.pending_returns[&caller] = 0;
                // return the funds to the caller
                let _ = self.env().transfer(caller, amount);
            }
        }

        /// Draws up to the maximum number of winners (MAX_DRAWS)
        #[ink(message)]
        pub fn auction_end(&mut self) {
            // 1. Conditions
            assert!(
                self.now() >= self.end_time, 
                "Auction not yet ended."
            );
            assert!(
                !self.ended, 
                "auctionEnd has already been called."
            );

            // 2. Effects
            self.ended = true;
            // emit event declaring the auction started
            Self::env().emit_event(AuctionEnded {});

            // 3. Interaction
            // send the funds to the beneficiary
            let _ = self.env().transfer(self.beneficiary, self.highest_bid);
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
        
        /// Return the highest_bid from storage
        #[ink(message)]
        pub fn get_highest_bid(&self) -> u128 {
            // return the highest_bid
            self.highest_bid
        }

        /// Return the highest_bidder from storage
        #[ink(message)]
        pub fn get_highest_bidder(&self) -> AccountId {
            // return the highest_bidder
            self.highest_bidder
        }

        /// Return the beneficiery from storage
        #[ink(message)]
        pub fn get_beneficiary(&self) -> AccountId {
            // return the beneficiary
            self.beneficiary
        }

        /// Return the item name from storage
        #[ink(message)]
        pub fn get_item(&self) -> String {
            // return the item
            self.item.clone()
        }
    
        /// Return the item name from storage
        #[ink(message)]
        pub fn get_pending(&self, acc: AccountId) -> u128 {
            // return the item
            self.pending_returns[&acc]
        }

        /// Return the number of bids made from storage
        #[ink(message)]
        pub fn get_bids(&self) -> u64 {
            // return the item
            self.bids
        }

        /// Return the state of "ended" from storage
        #[ink(message)]
        pub fn get_ended(&self) -> bool {
            // return the item
            self.ended
        }
    
    }

}
