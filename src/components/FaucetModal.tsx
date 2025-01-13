import { useSendTransaction } from 'hooks/useSendTransaction';
import Button from './Button';
import Modal, { ModalProps } from './Modal';
import { buildClaimFaucetTx } from 'utils/transactionBuilder';
import { fetchBalance, fetchLastClaim } from 'utils/datastoreFetcher';
import { useContext } from 'react';
import { AccountWrapperContext } from 'context/Account';
import { faucetSC } from 'utils/config';
import { useQuery } from '@tanstack/react-query';
import { ONE_DAY } from 'utils/constants';

const FaucetModal = ({ showModal, setShowModal }: ModalProps) => {
  const { connectedAddress, balance, fetchMasBalances } = useContext(
    AccountWrapperContext
  );

  const lastClaimQuery = useQuery(
    ['lastClaim', connectedAddress],
    () => fetchLastClaim(connectedAddress),
    { enabled: !!connectedAddress }
  );
  const lastClaim = lastClaimQuery.data || 0;

  const faucetBalanceQuery = useQuery(
    ['balance', faucetSC],
    () => fetchBalance(faucetSC),
    { enabled: !!faucetSC }
  );
  const faucetBalance = faucetBalanceQuery.data || 0n;
  const alreadyClaimed = Date.now() - lastClaim < ONE_DAY;

  const { submitTx: claim, pending } = useSendTransaction({
    data: buildClaimFaucetTx(),
    onTxConfirmed: () => {
      lastClaimQuery.refetch();
      faucetBalanceQuery.refetch();
      fetchMasBalances();
    }
  });

  const masBalance = balance || 0;

  return (
    <Modal showModal={showModal} setShowModal={setShowModal} title='Faucet 👛'>
      <div className='mx-auto my-2 max-w-[500px] text-center text-sm'>
        You can claim up to <strong>20,000 MAS</strong> from the faucet every 24
        hours to fully <strong>explore</strong> and <strong>test out</strong>{' '}
        the Dusa Pump app.
      </div>

      {faucetBalance < 20_000n * BigInt(10 ** 9) ? (
        <div className='mx-auto max-w-96 text-center text-xs opacity-75'>
          The faucet is running low on funds. Please try again later.
          <br /> You still can claim some MAS from the Massa faucet on the{' '}
          <a
            href='https://discord.com/channels/828270821042159636/1097797634065956915'
            className='font-bold underline'
            target='_blank'
            rel='noreferrer noopener'
          >
            buildernet-faucet
          </a>{' '}
          channel on discord.
        </div>
      ) : (
        masBalance < 0.1 && (
          <div className='text-center text-xs opacity-75'>
            You need at least 0.1 MAS to claim from the faucet.
          </div>
        )
      )}
      <Button
        text='Claim'
        variant='text'
        onClick={claim}
        pending={pending}
        disabled={alreadyClaimed || masBalance < 0.1}
      />
      {alreadyClaimed && (
        <span className='text-center text-xs opacity-75'>
          You can claim again in{' '}
          {new Date(ONE_DAY - (Date.now() - lastClaim))
            .toISOString()
            .substr(11, 8)}
        </span>
      )}
    </Modal>
  );
};

export default FaucetModal;
