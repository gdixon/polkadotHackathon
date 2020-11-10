# Polkadot Hackathon

## [[ADVANCED CHALLENGE] REST APIs - Build A Transaction Fee Estimator](https://gitcoin.co/issue/Polkadot-Network/hello-world-by-polkadot/4/100023930)

### Intro

This is a simple fee estimator built on top of the extrinic interactor provided as part of the substrate-front-end-template.

### Installation

```
$ cd substrate-front-end-template
$ yarn install
$ cd ..
$ cd substrate-node-template
$ WASM_BUILD_TOOLCHAIN=nightly-2020-10-05 cargo build --release
```

### Running the node and the front-end (* note that these commands will need to be ran in seperate terminals)

```
$ ./target/release/node-template --dev
$ cd ..
$ cd ./substrate-front-end-template
$ yarn sidecar
$ yarn start
```

### Evidence of successful deployment and function

#### Basic Pallet Interactor with Fee Estimate

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/substrate-fee-estimate/1-pallet-interactor-with-fee-estimate.png?raw=true)

#### Estimate is available only when all required params are filled

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/substrate-fee-estimate/2-estimate-available.png?raw=true)

#### Estimate is received after clicking "Estimate fee" and displayed beneath the interactor

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/substrate-fee-estimate/3-estimate-made.png?raw=true)

#### Once "signed" is clicked the signed transaction status is displayed below the estimate

- ![](https://github.com/gdixon/polkadotHackathon/blob/main/substrate-fee-estimate/4-tx-signed.png?raw=true)

