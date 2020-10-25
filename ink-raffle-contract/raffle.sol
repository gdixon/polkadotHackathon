// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.0;

// spec at: https://gitcoin.co/issue/Polkadot-Network/hello-world-by-polkadot/3/100023929
contract raffle {
    
    // variable controls as defined
    uint public minEntries = 5;
    uint public maxDraws = 2;
    uint public runTime = 60 * 15;
    uint public minPrice = 0.01*(10**18);
    uint public maxPrice = 0.1*(10**18);
    
    // beneficiary will receive all funds at end of raffle
    address payable public beneficiary;
    
    // record start and end times (settled once 5 entries have been made)
    uint public raffleEndTime;
    uint public raffleStartTime;

    // hold entry in struct so we can tell that its present
    struct entry {
        uint val;
        bool flag;
    }
   
    // how many tickets have been sold/drawn
    uint public tickets = 0;
    uint public draws = 0;
    
    // record the funds as they are placed
    uint public funds = 0;

    // record entrants, entries and winners
    mapping(address => entry) entrants;
    mapping(uint => address) entries;
    
    // make the winners publically accessible
    mapping(uint => address) public winners;

    // events that will be emitted on changes
    event EntrantAdded(address entrant, uint ticket);
    event WinnerDrawn(address entrant, uint ticket);
    
    // associate the beneficiary of the raffle on construct
    constructor(
        address payable _beneficiary
    ) {
        // this address will receive all funds once all draws have been made
        beneficiary = _beneficiary;
    }
    
    // enter the raffle by sending any amount from 0.01 - 0.1 ETH
    function enter() public payable {

        // check if in draw time
        require(
            raffleEndTime == 0 || tickets < minEntries || block.timestamp < raffleEndTime,
            "Closed for new entants"
        );
        
        // check for already entered
        require(
            !entrants[msg.sender].flag,
            "Must only enter once"
        );
        
        // check value of entry
        require(
            msg.value >= minPrice && msg.value <= maxPrice,
            "Wrong amount paid"
        );
        
        // record new ticket number (sequential)
        tickets += 1;
        
        // flag the entry as present
        entrants[msg.sender].flag = true;

        // record ticket value
        entrants[msg.sender].val = tickets;

        // record entrant against ticket number
        entries[tickets] = msg.sender;
        
        // record start/end time on fifth entry
        if (tickets == minEntries) {
            // unimportant - but might as well know
            raffleStartTime = uint(block.timestamp);
            raffleEndTime = raffleStartTime + runTime; // (60 * 15)
        }
        
        // place the msg.value into funds
        funds+=msg.value;
        
        // emit the new entry        
        emit EntrantAdded(entries[tickets], tickets);
    }
    
    // randomly select a winner (must be called n* times for n* winners (max 2))
    function draw() public payable {
        // check if in draw time
        require(
            (raffleEndTime > 0 && tickets >= minEntries && block.timestamp > raffleEndTime),
            "Not ready to draw yet"
        );

        // ensure we only draw n* times
        require(
            draws < maxDraws,
            "Winners already decided"
        );
        
        // incr the draws
        draws+=1;

        // pick the winner by picking a random entry from available tickets (unsafe - this should use an oracle)
        uint winner = uint(block.timestamp) % tickets + 1;
        
        // record the winner
        winners[draws] = entries[winner];

        // send all funds to the beneficiary
        if (draws == maxDraws) {
            // transfer the funds sent in
            beneficiary.transfer(funds);
        }
    }
}