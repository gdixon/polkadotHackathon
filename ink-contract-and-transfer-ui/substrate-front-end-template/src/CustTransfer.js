import React, { useEffect, useState } from 'react';
import { Button, Card, Divider, Dropdown, Form, Table, Grid, Input, Statistic } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import CustContract, { defaultGasLimit } from "./CustContract";


function Main(props) {
    const { api, keyring } = useSubstrate();
    const { accountPair } = props;
    const custContract = CustContract(api);

    const keyringOptions = keyring.getPairs().map(account => ({
        key: account.address,
        value: account.address,
        text: account.meta.name.toUpperCase(),
        icon: 'user'
    }));

    const [totalSupply, setTotalSupply] = useState(0);
    const [balance, setBalance] = useState(0);
    const [formState, setFormState] = useState({ addressTo: null, amount: 0 });
    const onChange = (_, data) =>
        setFormState(prev => ({ ...prev, [data.state]: data.value }));

    const { addressTo, amount } = formState;

    const onSelectAddressTo = address => setFormState(prev => ({ ...prev, 'addressTo': address }));

    const transfer = () => {
        custContract.tx.transfer(0, defaultGasLimit, addressTo, amount).signAndSend(accountPair, (result) => {
            updateBalance();
        });
    }

    const updateBalance = () => {
        custContract.query.balanceOf(accountPair.address, 0, defaultGasLimit, accountPair.address).then((balance) => {
            setBalance(balance.output.toNumber());
        })
    }
    useEffect(() => {
        let unsubscribe;
        custContract.query.totalSupply(keyring.getPairs()[0].address, 0, defaultGasLimit).then((total) => {
            setTotalSupply(total.output.toNumber());
            updateBalance();
        }).then(unsub => {
            unsubscribe = unsub;
        }).catch(console.error);
        return () => unsubscribe && unsubscribe();
    }, [accountPair]);

    return (
        <Grid.Column>
            <h1>Transfer CUST</h1>
            <Card.Group>
                <Card style={{ width: "calc(50% - 1em)", padding: "20px" }}>
                    <Statistic value={totalSupply} label={'Total CUST'} />
                </Card>
                <Card style={{ width: "calc(50% - 1em)", padding: "20px" }}>
                    <Statistic value={balance} label={'CUST in wallet'} />
                </Card>
            </Card.Group>
            <Divider hidden />
            <Card.Group>
                <Card style={{ width: "100%", height: "200px", padding: "20px", margin: "0 auto" }}>

                    <Form>
                        <Form.Group inline>

                            <Table celled striped size='small' style={{
                                margin: "0px",
                                position: "absolute",
                                marginTop: "111px"
                            }}>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell><b>To:</b></Table.Cell>
                                        <Table.Cell>
                                            <Form.Field style={{ padding: 0 }}>
                                                <Dropdown
                                                    search
                                                    selection
                                                    clearable
                                                    placeholder='Select an account'
                                                    options={keyringOptions}
                                                    style={{
                                                        width: "100%",
                                                        padding: 0,
                                                        lineHeight: "32px",
                                                        textIndent: "2px"
                                                    }}
                                                    onChange={(_, dropdown) => {
                                                        onSelectAddressTo(dropdown.value);
                                                    }}
                                                />
                                            </Form.Field>
                                        </Table.Cell>
                                    </Table.Row>

                                    <Table.Row>
                                        <Table.Cell><b>Amount</b></Table.Cell>
                                        <Table.Cell>
                                            <Form.Field width={16} style={{ padding: 0 }}>
                                                <Input
                                                    fluid
                                                    label='Amount'
                                                    type='number'
                                                    state='amount'
                                                    onChange={onChange}
                                                    style={{ width: "100%" }}
                                                />
                                            </Form.Field>
                                        </Table.Cell>
                                    </Table.Row>

                                </Table.Body>
                            </Table>

                            <Form.Field style={{ textAlign: 'center' }}>
                                <Button onClick={transfer} style={{
                                    display: "block",
                                    width: "100%",
                                    position: "absolute",
                                    left: "0px",
                                    marginTop: "127px",
                                }}>Transfer</Button>
                            </Form.Field>

                        </Form.Group>
                    </Form>
                </Card>
            </Card.Group>
        </Grid.Column>
    );
}

export default function CustTransfer(props) {
    const { api } = useSubstrate();
    const { accountPair } = props;
    return (api.registry && accountPair
        ? <Main {...props} /> : null);
}
