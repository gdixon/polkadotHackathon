// import contract components so that we can interact with the auction
import {Abi, ContractPromise, BlueprintPromise} from '@polkadot/api-contract';
// import the autions abi
import metadata from './AuctionMetadata.json';
// default gas usage is high enough to cover all actions
export const defaultGasLimit = 300000n * 1000000n;
// 10DOT is provided as an endowment (10*(10**15))
export const defaultEndowment = 1000000000000000;
// this is the contracts codeHash as defined in the AuctionMetadata.json
const AuctionCodeHash = '0x3b24ef85aa1971f101f9fd9dbacaec82f2138f12d694c0c8489a0874111deb85';

// retrieve the contract that is currently in-play
export default function AuctionContract(api) {
    const abi = new Abi(metadata);
    let auctionContract = null;
    keyring.getContracts().forEach(contract => {
        if (contract.meta.tags.includes('auction')) {
            auctionContract = new ContractPromise(api, abi, contract.address);
        }
    });
  
    // return the new contract
    return auctionContract;
};

// drop old contracts
function forgetAuctionContracts() {
    keyring.getContracts().forEach(contract => {
        if (contract.meta.tags.includes('auction')) {
            keyring.forgetContract(contract.address);
        }
    });
};

// record the contract and details
function saveContract(contract, abi, item, beneficiary, runTime, contractPromise, api) {
    keyring.saveContract(contract.address.toString(), {
        contract: {
            abi: JSON.stringify(abi.json)
        },
        item: item,
        beneficiary: beneficiary,
        runTime: runTime,
        name: "Auction",
        tags: ["auction"]
    });
    contractPromise(new ContractPromise(api, abi, contract.address));
};

// method to create and deploy a new contract using the uploaded .wasm and given abi
export async function createAuctionContract(api, accountPair, item, beneficiary, runTime, contractPromise) {
    const abi = new Abi(metadata);
    const blueprint = new BlueprintPromise(api, abi, AuctionCodeHash);
    const unsub = await blueprint.tx
        .new(defaultEndowment, defaultGasLimit, item, beneficiary.address, runTime)
        .signAndSend(accountPair, (result) => {
            if (result.status.isInBlock || result.status.isFinalized) {
                if (result.contract) {
                    forgetAuctionContracts();
                    saveContract(result.contract, abi, item, beneficiary.address, runTime, contractPromise, api);
                }
                unsub();
            }
        });
};
