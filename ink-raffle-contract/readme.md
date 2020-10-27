# Polkadot Hackathon

## [[ADVANCED CHALLENGE] Smart contracts - Build a charity raffle](https://gitcoin.co/issue/Polkadot-Network/hello-world-by-polkadot/3/100023929)

### Evidence of successful deployment and function

#### Upload wasm to local substrate node via [polkadot.js.org/apps/](polkadot.js.org/apps/)

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/1-upload-wasm.png?raw=true)

#### Uploaded to local substrate node

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/2-uploaded-wasm.png?raw=true)

#### Deploy to local substrate node

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/3-deploy-wasm.png?raw=true)

#### Deployed to local substrate node

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/4-deployed-wasm.png?raw=true)

#### Raffle contracts methods

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/5-contracts-methods.png?raw=true)

#### Attempt to enter - paying too much

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/6-enter-pay-too-much.png?raw=true)
- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/7-rejected.png?raw=true)

#### Attempt to enter - paying too little

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/8-enter-pay-too-little.png?raw=true)
- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/9-rejected.png?raw=true)

#### Attempt to enter - paying an acceptable amount

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/10-enter-pay-correct-amount.png?raw=true)
- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/11-enter-accepted.png?raw=true)

#### Attempt to enter again - paying an acceptable amount

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/12-enter-again.png?raw=true)
- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/13-rejected.png?raw=true)

#### Contract after MIN_ENTRIES has been met

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/14-min-entries-entered.png?raw=true)

#### Attempt to make a draw before self.time_end has passed

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/15-draw-too-early.png?raw=true)

#### Make the first draw

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/16-draw-1.png?raw=true)

#### Make the second draw

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/17-draw-2.png?raw=true)

#### Attempt to make a third draw

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/18-draw-3-rejected.png?raw=true)

#### Transaction showing the funds we're transferred to the beneficiary

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/19-funds-transferred-to-beneficiary.png?raw=true)

#### Contracts wallet showing that funds we're moved away from the contract

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/ink-raffle-contract/20-funds-transferred-out-of-contract.png?raw=true)