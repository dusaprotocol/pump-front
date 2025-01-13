import { useState, useContext } from 'react';
import { WalletClient } from '@massalabs/massa-web3';
import { AccountWrapperContext } from 'context/Account';
import { MASSA_CHAIN_ID } from 'utils/config';

export const useSignMessage = () => {
  const [success, setSuccess] = useState(false);
  const [isConfirmPending, setIsConfirmPending] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [signature, setSignature] = useState('');
  const { client, connectedAddress: signerAddress } = useContext(
    AccountWrapperContext
  );

  const sign = async (
    data: Parameters<typeof WalletClient.walletSignMessage>[0]
  ) => {
    if (!client) return;

    setIsConfirmPending(true);
    setSuccess(false);

    if (!client) return;

    return client
      .wallet()
      .signMessage(data, MASSA_CHAIN_ID, signerAddress)
      .then(async (res) => {
        setSuccess(true);
        setPublicKey(res.publicKey);
        setSignature(res.base58Encoded);
        return res;
      })
      .catch((err) => console.log(err))
      .finally(() => setIsConfirmPending(false));
  };

  return {
    isConfirmPending,
    success,
    sign,
    publicKey,
    signature
  };
};
