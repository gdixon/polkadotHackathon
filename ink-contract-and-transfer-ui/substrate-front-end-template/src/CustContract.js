import metadata from './CustMetadata.json';
import {Abi, ContractPromise} from '@polkadot/api-contract';

export const defaultGasLimit = 300000n * 1000000n;
const CustContractAddress = '5FiaR7iSTV8pnjpr7NQmwHSyN5jmJg22yFtqhsWQwrw6bX9M';

export default function CustContract(api) {
    const abi = new Abi(metadata);
    return new ContractPromise(api, abi, CustContractAddress);
}

export function displayCust(balance) {
    return balance.toString() + ' CUST';
}
