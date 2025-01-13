import { Client, ICallData, withTimeoutRejection } from '@massalabs/massa-web3';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AccountWrapperContext } from 'context/Account';
import { pollAsyncEvents } from 'utils/eventPoller';
import { EventDecoder } from '@dusalabs/sdk';
import { NETWORK } from 'utils/config';

interface SendTransactionProps {
  data: ICallData;
  onTxConfirmed?: () => void;
}

export const useSendTransaction = ({
  data,
  onTxConfirmed
}: SendTransactionProps) => {
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxError] = useState<string>();
  const [txEvents, setTxEvents] = useState<string[]>();
  const [success, setSuccess] = useState(false);
  const [isTxPending, setIsTxPending] = useState(false);
  const [isConfirmPending, setIsConfirmPending] = useState(false);
  const pending = isTxPending || isConfirmPending;

  const { client, selectedProvider } = useContext(AccountWrapperContext);

  useEffect(() => {
    if (success && onTxConfirmed) {
      onTxConfirmed();
    }
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [success]);

  const submitTx = async () => {
    if (!client) return;

    setIsConfirmPending(true);
    return signTx();
  };

  const signTx = async () => {
    const network = await selectedProvider?.getNetwork();
    if (network !== NETWORK) {
      alert(
        `Wrong network selected. Please switch your ${selectedProvider
          ?.name()
          .toLowerCase()} wallet to ${NETWORK} to continue.`
      );
      setIsConfirmPending(false);
      return;
    }

    setSuccess(false);

    if (!client) return;

    const txId = await client
      .smartContracts()
      .callSmartContract(data)
      .then(async (txId) => {
        setIsConfirmPending(false);
        setIsTxPending(true);
        setTxHash(txId);
        console.log(txId);
        await processTx(txId, data.targetFunction, client).then(() =>
          setIsTxPending(false)
        );
        return txId;
      })
      .catch((err) => {
        if (err.message.includes('prompter is already listening')) {
          err.message = 'A transaction is already in progress';
        } else if (err.message.includes('aborting during HTTP request')) {
          err.message = 'Transaction timeout exceeded';
        }

        console.log(err);
        toast.error(err.message);
        setTxError(err.message);
        setIsConfirmPending(false);
        return;
      });

    return txId;
  };

  const processTx = async (txId: string, title: string, _client: Client) => {
    const pendingToast = toast.loading(`Processing ${title}...`, {
      autoClose: false
    });

    try {
      const { isError, eventPoller, events } = await withTimeoutRejection(
        pollAsyncEvents(_client, txId),
        120_000
      );
      eventPoller.stopPolling();

      const eventsMsg = events.map((event) => event.data);
      console.log(eventsMsg);

      if (isError) {
        const errorMsg = EventDecoder.decodeError(
          eventsMsg[eventsMsg.length - 1]
        );
        const errorName = errorMsg.split(':')[0];
        switch (errorName) {
          default:
            throw new Error(errorName);
        }
      }

      toast.dismiss(pendingToast);
      setSuccess(true);

      setTxEvents(eventsMsg);
      toast.success('Transaction successful');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMsg = err.message || 'Something went wrong';
      console.log(err);

      setTxError(errorMsg);
      setSuccess(false);
      toast.dismiss(pendingToast);
      toast.error(errorMsg);
    }
  };

  return {
    txError,
    txHash,
    isTxPending,
    isConfirmPending,
    pending,
    success,
    txEvents,
    submitTx
  };
};
