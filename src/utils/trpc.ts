import {
  createTRPCProxyClient,
  createTRPCReact,
  httpBatchLink
} from '@trpc/react-query';
import type { AppRouter } from '../../../backend/api/src/trpc';
import { inferProcedureOutput } from '@trpc/server';
import { api } from './config';

export const trpc = createTRPCReact<AppRouter>();
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: api
    })
  ]
});

export type Token = inferProcedureOutput<AppRouter['getToken']>;
export type TokenFull = inferProcedureOutput<AppRouter['getTokens']>[number];
export type Swap = inferProcedureOutput<AppRouter['getRecentSwaps']>[number];
export type SwapFull = inferProcedureOutput<AppRouter['getSwap']>;
export type User = NonNullable<inferProcedureOutput<AppRouter['getUser']>>;
