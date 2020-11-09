import React, {useEffect, useState} from 'react';
import {Button, Card, Divider, Input, Form, Grid, Statistic} from 'semantic-ui-react';

import {useSubstrate} from './substrate-lib';
import AuctionContract, {createAuctionContract, defaultGasLimit} from "./AuctionContract";

function Main(props) {
    const {api, keyring} = useSubstrate();
    const {accountPair} = props;

    const findAccountNameByAddress = (accountAddress) => {
        const accounts = keyring.getPairs();
        let accountName = accountAddress;
        accounts.forEach(({address, meta}) => {
            if (address === accountAddress) {
                accountName = meta.name;
            }
        });
        return accountName;
    };

    // get the current contract thats set-up
    const [auctionContract, setAuctionContract] = useState(AuctionContract(api));

    // record the bid amount
    const [bidAmount, setBidAmount] = useState(0);

    // select who is being used as the auctioneer
    const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
    // itemName is the current name
    const [itemName, setItemName] = useState('');
    // nextItemName is what we'll set with the next deployment
    const [nextItemName, setNextItemName] = useState('');
    // how long will the next auction run for?
    const [runTime, setRunTime] = useState(0);
    // record the number of bids
    const [bids, setBids] = useState(0);
    // record the highest bid
    const [highestBid, setHighestBid] = useState(0);
    // record the highest bidder
    const [highestBidder, setHighestBidder] = useState('');
    // record how much is pending to be returned to the user
    const [pending, setPending] = useState(0);

    // record the times so that we can check if the auction is still running
    const [endTime, setEndTime] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [ended, setEnded] = useState(0);

    // create a new instance
    const newAuction = async () => {
        createAuctionContract(api, accountPair, nextItemName, accountPair, runTime, (contractPromise) => {
            const previousContract = auctionContract;
            setAuctionContract(contractPromise);
            if (previousContract) {
                auctionContract.tx.auctionEnd(0, defaultGasLimit).signAndSend(accountPair, () => {
                });
            }
        });
    };
    
    // calls to methods on the contract
    const bid = () => {
        auctionContract.tx.bid(1000000000000000 * bidAmount, defaultGasLimit).signAndSend(accountPair, () => {
        });
    };
    const auctionEnd = () => {
        auctionContract.tx.auctionEnd(0, defaultGasLimit).signAndSend(accountPair, () => {
        });
    };
    const returnFunds = () => {
        auctionContract.tx.returnFunds(0, defaultGasLimit).signAndSend(accountPair, () => {
        });
    };

    // read the state from the contract
    const updateItemName = () => {
        auctionContract && auctionContract.query.getItem(accountPair.address, 0, defaultGasLimit).then((item) => {
            if (item.output) {
                setItemName(item.output.toString().slice(1, item.output.length));
            }
        });
    };
    const updateBids = () => {
        auctionContract && auctionContract.query.getBids(accountPair.address, 0, defaultGasLimit).then((bids) => {
            if (bids.output) {
                setBids(bids.output.toNumber());
            }
        });
    };
    const updatePending = () => {
        auctionContract && auctionContract.query.getPending(accountPair.address, 0, defaultGasLimit, accountPair.address).then((pending) => {
            if (pending.output) {
                setPending(pending.output.toNumber()/(10**15));
            } else {
                setPending(0)
            }
        });
    };
    const updateHighestBid = () => {
        auctionContract && auctionContract.query.getHighestBid(accountPair.address, 0, defaultGasLimit).then((balance) => {
            if (balance.output) {
                setHighestBid(balance.output.toNumber() / 1000000000000000);
            }
        });
    };
    const updateHighestBidder = () => {
        auctionContract && auctionContract.query.getHighestBidder(accountPair.address, 0, defaultGasLimit).then((account) => {
            if (account.output) {
                setHighestBidder(findAccountNameByAddress(account.output.toHuman()));
            }
        });
    };
    const updateEndTime = () => {
        auctionContract && auctionContract.query.getEnd(accountPair.address, 0, defaultGasLimit).then((endTime) => {
            if (endTime.output) {
                setEndTime(endTime.output.toNumber());
            }
        });
    };
    const updateStartTime = () => {
        auctionContract && auctionContract.query.getStart(accountPair.address, 0, defaultGasLimit).then((startTime) => {
            if (startTime.output) {
                setStartTime(startTime.output.toNumber());
            }
        });
    };
    const updateEnded = () => {
        auctionContract && auctionContract.query.getEnded(accountPair.address, 0, defaultGasLimit).then((ended) => {
            if (ended.output) {
                setEnded(ended.output.isTrue);
            }
        });
    };
    const updateBeneficiary = () => {
        auctionContract && auctionContract.query.getBeneficiary(accountPair.address, 0, defaultGasLimit).then((beneficiary) => {
            if (beneficiary.output && !beneficiary.output.isEmpty) {
                setSelectedBeneficiary(findAccountNameByAddress(beneficiary.output.toHuman()));
            }
        });
    };

    // updatePending immediately so that keyring changes update state
    updatePending();

    // effects are updated when the ui receives an event
    useEffect(() => {
        auctionContract && api.query.contracts.contractInfoOf(auctionContract.address, async () => {
            updateEndTime();
            updateStartTime();
            updateHighestBid();
            updateHighestBidder();
            updateItemName();
            updateBids();
            updatePending();
            updateEnded();
            updateBeneficiary();
        });
    }, [api, auctionContract]);

    return (
        <Grid.Column>
            <h1>Auction</h1>
            <Form>
                <Form.Group inline>
                    <Form.Field style={{textAlign: 'center'}}>
                        <Input
                            fluid
                            type='text'
                            style={{minWidth: "400px"}}
                            placeholder='Describe the item you would like to sell at auction...'
                            onChange={(_, vals) => {
                                setNextItemName(vals.value);
                            }}
                        />
                    </Form.Field>
                    <Form.Field style={{textAlign: 'center'}}>
                        <Input
                            fluid
                            style={{minWidth: "300px"}}
                            type='number'
                            placeholder='How long should the auction run for (ms)?'
                            onChange={(_, vals) => {
                                setRunTime(vals.value);
                            }}
                        />
                    </Form.Field>
                    <Form.Field style={{textAlign: 'center'}}>
                        <Button 
                            onClick={newAuction} 
                            disabled={auctionContract && (endTime - Date.now()) > 0} 
                            color={'blue'}
                        >
                            Start a new auction
                        </Button>
                    </Form.Field>      
                </Form.Group>
            </Form>
            {auctionContract && <React.Fragment>
                {(endTime - Date.now()) > 0 && <h3 color={'blue'}>You are bidding on "{itemName}" being sold by {selectedBeneficiary}</h3>}
                {(endTime - Date.now()) <= 0 &&
                <h3 color={'green'}>{(!selectedBeneficiary ? "No auctions have been deployed!" : "This auction has ended!")}</h3>}
                <Card.Group>
                    <Card>
                        <Statistic value={highestBid} label={(bids > 0 ? highestBidder + ((endTime - Date.now()) > 0 ? ' is winning' : ' won "'+itemName+'"') : "No bids yet")}/>
                    </Card>
                    <Card>
                        <Statistic value={bids} label={'Bids'}/>
                    </Card>
                    <Card>
                        <Statistic value={((endTime - Date.now()) > 0 ? (endTime - Date.now())/1000 : 0)} label={'seconds left'}/>
                    </Card>
                </Card.Group>
                <Divider hidden/>
                <Form>
                    <Form.Group inline>
                        <Form.Field style={{textAlign: 'center'}}>
                            <Input
                                fluid
                                style={{marginRight: "5px"}}
                                type='number'
                                disabled={startTime > 0 && (endTime - Date.now()) <= 0}
                                placeholder='Enter a bid amount'
                                onChange={(_, vals) => {
                                    setBidAmount(vals.value);
                                }}
                            />
                            <Button onClick={bid} disabled={!selectedBeneficiary || (startTime > 0 && (endTime - Date.now()) <= 0)}>Place bid of {bidAmount} DOT for {itemName}</Button>
                            <Button onClick={returnFunds} disabled={!selectedBeneficiary || !pending}>Return {pending} DOT from losing bid{(pending==1 ? "" : "'s")}</Button>
                            <Button onClick={auctionEnd} disabled={!selectedBeneficiary || ended || startTime > 0 && (endTime - Date.now()) > 0}>Complete the sale (transfer winning bid to the beneficiary)</Button>
                        </Form.Field>
                    </Form.Group>
                </Form>
            </React.Fragment>}
        </Grid.Column>
    );
}

export default function Auction(props) {
    const {api} = useSubstrate();
    const {accountPair} = props;
    return (api.registry && accountPair
        ? <Main {...props} /> : null);
}
