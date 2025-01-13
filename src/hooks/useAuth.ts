import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { AccountWrapperContext } from 'context/Account';
import { TrpcClientWrapperContext } from 'context/TrpcClient';
import { useContext, useEffect } from 'react';
import { api, baseApi, MASSA_CHAIN_ID } from 'utils/config';
import { getAccessToken, setAccessToken } from 'utils/localStorage';
import { trpc } from 'utils/trpc';

const useAuth = () => {
  const { client, connectedAddress } = useContext(AccountWrapperContext);
  const token = getAccessToken(connectedAddress);
  const { setTrpcClient } = useContext(TrpcClientWrapperContext);

  useEffect(() => {
    if (token) handleCreateTrpcClient();
  }, [token]);

  const handleCreateTrpcClient = () => {
    setTrpcClient(
      trpc.createClient({
        links: [
          splitLink({
            condition: (op) => op.type === 'subscription',
            false: httpBatchLink({
              url: api,
              headers: {
                Authorization: token ? `Bearer ${token}` : ''
              }
            }),
            true: wsLink({
              client: createWSClient({
                url: baseApi
              })
            })
          })
        ]
      })
    );
  };

  const login = trpc.login.useMutation({
    onSuccess: (data) => {
      const { accessToken } = data;
      if (accessToken) setAccessToken(accessToken, connectedAddress);
    }
  });

  const handleSign = async () => {
    if (!client) return;
    if (!token) {
      const message = `Please sign in to Dusa Pump: ${new Date().getTime()}`;
      const sig = await client
        .wallet()
        .signMessage(message, MASSA_CHAIN_ID, connectedAddress)
        .catch(console.log);
      if (sig)
        login.mutate({
          ...sig,
          message,
          address: connectedAddress,
          signature: sig.base58Encoded
        });
      await new Promise((resolve) => setTimeout(resolve, 500)); // wait 0.5s
    }
  };

  return { handleSign, isLoggedIn: !!token, token };
};

export default useAuth;
