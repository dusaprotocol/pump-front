import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { TrpcClientWrapperContext } from 'context/TrpcClient';
import { ReactNode, useState } from 'react';
import { api, baseApi } from 'utils/config';
import { trpc } from 'utils/trpc';

const TrpcClientWrapper = ({ children }: { children: ReactNode }) => {
  const wsClient = createWSClient({
    url: baseApi
  });

  const [trpcClient, setTrpcClient] = useState(
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          false: httpBatchLink({
            url: api
          }),
          true: wsLink({ client: wsClient })
        })
      ]
    })
  );

  return (
    <TrpcClientWrapperContext.Provider
      value={{
        trpcClient: trpcClient,
        setTrpcClient: setTrpcClient
      }}
    >
      {children}
    </TrpcClientWrapperContext.Provider>
  );
};

export default TrpcClientWrapper;
