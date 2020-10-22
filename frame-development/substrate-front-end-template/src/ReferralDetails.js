import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function Main(props) {
    const { api } = useSubstrate();
    const { accountPair } = props;

    // The transaction submission status
    const [status, setStatus] = useState('');

    // The currently stored value
    const [currentUsername, setCurrentUsername] = useState("");
    const [currentReferrals, setCurrentReferrals] = useState(0);
    const [currentReferralsNeeded, setCurrentReferralsNeeded] = useState(null);
    const [username, setUsername] = useState("");
    const [referrals, setReferrals] = useState(0);

    // retrieve the current number of referrals
    const getReferralsNeeded = () => {

        // when theres referrals present return no
        return (currentReferralsNeeded && currentReferralsNeeded.isSome ? currentReferralsNeeded.toString() : 0);
    }

    useEffect(() => {
        let unsubscribe;
        // update the details
        api.query.templateModule.details(newValue => {
            // default to empty
            if (newValue.isNone) {
                setCurrentUsername('<None>');
                setCurrentReferrals('0');
            } else {
                // set new values (on submit)
                setCurrentUsername(newValue.Username.toHuman())
                setCurrentReferrals(newValue.Referrals.toString())
                setCurrentReferralsNeeded(newValue.ReferralsNeeded);
            }
        }).then(unsub => {
            unsubscribe = unsub;
        })
            .catch(console.error);

        return () => unsubscribe && unsubscribe();
    }, [api.query.templateModule]);

    return (
        <Grid.Column width={8}>
            <h1>Referral Details</h1>
            <Card>
                <Card.Content>
                    <Card.Header content={currentUsername} />
                    <Card.Meta content={"Current No. of Referrals: " + currentReferrals} />
                    <Card.Description content={getReferralsNeeded() + " more Referral" + (getReferralsNeeded() > 1 || getReferralsNeeded() === 0 ? "s" : "") + " needed..."} />
                </Card.Content>
            </Card>
            <Form>
                <Form.Field>
                    <Input
                        label='Username'
                        state='newValue'
                        type='string'
                        onChange={(_, { value }) => setUsername(value)}
                    />
                </Form.Field>
                <Form.Field>
                    <Input
                        label='Referrals'
                        state='newValue'
                        type='number'
                        onChange={(_, { value }) => setReferrals(value)}
                    />
                </Form.Field>
                <Form.Field style={{ textAlign: 'center' }}>
                    <TxButton
                        accountPair={accountPair}
                        label='Save Details'
                        type='SIGNED-TX'
                        setStatus={setStatus}
                        attrs={{
                            palletRpc: 'templateModule',
                            callable: 'setReferralsNeeded',
                            inputParams: [{ "Username": username, "Referrals": referrals, "ReferralsNeeded": null }],
                            paramFields: [true]
                        }}
                    />
                </Form.Field>
                <div style={{ overflowWrap: 'break-word' }}>{status}</div>
            </Form>
        </Grid.Column>
    );
}

export default function ContactDetails(props) {
    const { api } = useSubstrate();
    return (api.query.templateModule && api.query.templateModule.something
        ? <Main {...props} /> : null);
}
