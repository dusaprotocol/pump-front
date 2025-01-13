import { Client, ProviderType } from '@massalabs/massa-web3';
import { CHAIN_URL as url } from './config';

export const providers = [
  { url, type: ProviderType.PUBLIC },
  { url, type: ProviderType.PRIVATE }
];

export const baseClient: Client = new Client({
  providers,
  retryStrategyOn: false
});

export const mainnetBaseClient: Client = new Client({
  providers: [
    { url: 'https://mainnet.massa.net/api/v2', type: ProviderType.PUBLIC },
    { url: 'https://mainnet.massa.net/api/v2', type: ProviderType.PRIVATE }
  ],
  retryStrategyOn: false
});
