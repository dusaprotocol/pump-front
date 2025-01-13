import { ChainId } from '@dusalabs/sdk';
import { BUILDNET_CHAIN_ID, MAINNET_CHAIN_ID } from '@massalabs/web3-utils';

const getEnvVariable = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

// export const api = `${window.location.protocol}//${window.location.hostname}:3001/trpc`;
export const api = getEnvVariable('VITE_API');
export const baseApi = api.replace('/trpc', '');
export const dusaApi = getEnvVariable('VITE_DUSA_API');

export const NETWORK = getEnvVariable('VITE_NETWORK_NAME');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CHAIN_ID = getEnvVariable('VITE_CHAIN_ID') as any as ChainId;
export const CHAIN_URL = getEnvVariable('VITE_CHAIN_URL');
export const MASSA_CHAIN_ID =
  CHAIN_ID === ChainId.BUILDNET ? BUILDNET_CHAIN_ID : MAINNET_CHAIN_ID;

export const FEATURE_FLAGS = {
  PAUSE_SCREEN: getEnvVariable('VITE_PAUSE_SCREEN') === 'true'
};

export const factorySC = 'AS1BU12yT6f9d95jbut1B1dUkpbwqrKuW3TErh9bFa1TgZ5TwFQv';
export const deployerSC =
  'AS1UQk1E1fEwBehodN1dw7ZzRc49b6ohgwQYwbcRjekTH2v1pNDC';
export const faucetSC = 'AS12ruRnA87U7DTbVV4adGm8G8JRVk31MUgxmj8EC3gyA3ULzrEAU';

export const EXPLORER =
  NETWORK === 'mainnet'
    ? 'https://explorer.massa.net/mainnet'
    : 'https://massexplo.io';

export const defaultProfileURI =
  'https://pump.mypinata.cloud/ipfs/QmeSzchzEPqCU1jwTnsipwcBAeH7S4bmVvFGfF65iA1BY1?img-width=128&img-dpr=2&img-onerror=redirect';
