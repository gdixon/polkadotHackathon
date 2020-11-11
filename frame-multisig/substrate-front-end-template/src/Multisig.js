import React, { useState } from 'react';
import { Form, Input, Grid, Label, Icon } from 'semantic-ui-react';
import { TxButton } from './substrate-lib/components';
import { useSubstrate } from './substrate-lib';

export default function Main (props) {
  const [status, setStatus] = useState(null);
  const [formState, setFormState] = useState({ threshold: 0, otherSigs: '', addressTo: null, amount: 0 });
  const { accountPair } = props;

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }));

  const { threshold, otherSigs, addressTo, amount } = formState;

  const { api } = useSubstrate();

  return (
    <Grid.Column width={8}>
      <h1>Multisig Component</h1>
      <Form>
        <Form.Field>
          <Label basic color='teal'>
            <Icon name='hand point right' />
            1 Unit = 1000000000000
          </Label>
        </Form.Field>
        <Form.Field>Transfer more than the existential amount for account with 0 balance</Form.Field>
        <Form.Field>
          <Input
            fluid
            label='To'
            type='text'
            placeholder='address'
            state='addressTo'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Amount'
            type='number'
            state='amount'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Threshold'
            type='number'
            placeholder='Max as 10'
            state='threshold'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label='Other Signatories'
            type='text'
            placeholder='Addresses separated by space'
            state='otherSigs'
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'left' }}>
          <TxButton
            accountPair={accountPair}
            label='Submit'
            type='SIGNED-TX'
            setStatus={setStatus}
            attrs={{
              palletRpc: 'multisig',
              callable: 'asMulti',
              inputParams: [threshold, otherSigs.split(' '), null, api.tx.balances.transfer(addressTo, amount), false, 5000000000],
              paramFields: [true, true, { optional: true }, true, true, true]
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}
