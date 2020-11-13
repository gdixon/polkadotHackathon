# Polkadot Hackathon

## [[ADVANCED CHALLENGE] Build A DApp](https://gitcoin.co/issue/Polkadot-Network/hello-world-by-polkadot/2/100023928)

### Intro

This is a simple auction written as an ink contract and deployed as a webassembly script on to a locally running substrate node, it is deployed along with a simple front-end which enables creating auctions and bidding on items.

The dApp will accept bids until the bidding time has passed, at which point no more bids will be accepted. Losing bids can be reclaimed at any time, and the winning bid can be claimed/transferred only once the auction has ended.

New auctions can only be started once the previous auction has ended.

### Installation

```
$ cd substrate-front-end-template
$ yarn install
$ cd ..
$ cd substrate-node-template
$ WASM_BUILD_TOOLCHAIN=nightly-2020-10-05 cargo build --release
```

### Running the node and the front-end and uploading the contract (auction.wasm)

```
$ ./target/release/node-template --dev
$ cd ..
$ cd ./substrate-front-end-template
$ yarn start
```

- Now navigate to https://polkadot.js.org/apps/#/contracts making sure that you have the local development environment selected
- Upload the auctions contract (./ink-auction-contract/auction.wasm & ./ink-auction-contract/metadata.json)
- Return to http://localhost:8000/substrate-front-end-template and refresh

### Evidence of successful deployment and function

#### Live example: https://gdixon.github.io/auction-dapp/ (first visit https://178.128.45.229 and add an exception for the ssl certificate)

#### Upload contract to local substrate node via [polkadot.js.org/apps/](polkadot.js.org/apps/)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/1-upload-wasm.png?raw=true)

#### Auction Component implemented on substrate-front-end-template

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/2-ink-auction.png?raw=true)

#### Deploy new auction via the dApp (with Alice as the beneficiary and a 100 second run-time)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/3-new-auction.png?raw=true)

#### Make some bids (alice stash = 1, bob = 2, bob stash = 5)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/4-alice-stash-bid.png?raw=true)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/5-bob-bid.png?raw=true)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/6-bob-stash-bid.png?raw=true)

#### Auction ends

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/7-auction-finished.png?raw=true)

#### Alice calls complete and claims the highest_bid

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/8-alice-calls-complete.png?raw=true)

#### Losers reclaim their funds

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/9-alice-stash-returnable-funds.png?raw=true)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/10-alice-stash-retrieves-funds.png?raw=true)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/11-bob-returnable-funds.png?raw=true)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/auction-dapp/12-bob-retrieves-funds.png?raw=true)
