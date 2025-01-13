import { useState, useEffect } from 'react';
import { Client, ClientFactory } from '@massalabs/massa-web3';
import {
  IAccount,
  IProvider,
  ProvidersListener,
  providers as getProviders
} from '@massalabs/wallet-provider';
import { BearbyAccount } from '@massalabs/wallet-provider/dist/esm/bearbyWallet/BearbyAccount';
import { CHAIN_URL } from 'utils/config';
import { fetchAccountsBalance } from 'utils/datastoreFetcher';
import { providers as clientProviders } from 'utils/w3';
import { clamp } from 'utils/methods';

type Listener = {
  unsubscribe: () => void;
};

export interface ProviderService {
  connected: boolean;
  connectedAddress: string;
  account: IAccount | undefined;
  accounts: IAccount[] | undefined;
  setAccounts: React.Dispatch<React.SetStateAction<IAccount[] | undefined>>;
  masBalances: number[] | undefined;
  balance: number;
  fetchMasBalances: (accs?: IAccount[] | undefined) => void;
  connect(account: IAccount): Promise<void>;
  disconnect: () => void;
  fetchAccounts(provider: IProvider): Promise<IAccount[] | undefined>;
  initClientWallet: (provider: IProvider, acc: IAccount) => void;
  providerList: IProvider[] | undefined;
  selectedProvider: IProvider | undefined;
  setSelectedProvider: React.Dispatch<
    React.SetStateAction<IProvider | undefined>
  >;
  openBearbyWallet: (provider: IProvider) => void;
  loadingProvider: string;
  errorMessage: string;
  client: Client | undefined;
  network: string;
}

const NO_ACCOUNT_ERROR = 'No account found';
// const NOT_PROVIDER_SELECTED_ERROR = 'No provider selected';
const NO_PROVIDER_ERROR = 'No provider found. Run Wallet and reload page.';

const useWalletProvider = (): ProviderService => {
  const [accIndex, setAccIndex] = useState(
    Number(localStorage.getItem('accountIndex')) ?? 0
  );
  const [providerList, setProviderList] = useState<IProvider[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<IProvider>();
  const [accounts, setAccounts] = useState<IAccount[]>();
  const [masBalances, setMasBalances] = useState<number[]>();
  const [loadingProvider, setLoadingProvider] = useState(
    'Loading provider and wallet'
  );
  const [client, setClient] = useState<Client>();
  const [network, setNetwork] = useState('');
  const [accountListener, setAccountListener] = useState<Listener>();
  const [networkListener, setNetworkListener] = useState<Listener>();

  const isBearbyProvider = selectedProvider?.name() === 'BEARBY';
  const account = accounts?.[isBearbyProvider ? 0 : accIndex];
  const balance = masBalances?.[isBearbyProvider ? 0 : accIndex] ?? 0;
  const connectedAddress = account?.address() ?? '';
  const connected = !!connectedAddress;

  const fetchMasBalances = async (accs: IAccount[] | undefined = accounts) => {
    if (!accs) return;
    fetchAccountsBalance(accs).then(setMasBalances);
  };

  const providerListener = new ProvidersListener();

  useEffect(() => {
    providerListener.subscribe(setProviderList);
  }, []);

  useEffect(() => {
    if (!selectedProvider) return;
    const isProviderIn = providerList.some(
      (provider) => provider.name() === selectedProvider.name()
    );
    !isProviderIn && disconnect();
  }, [providerList]);

  useEffect(() => {
    if (!connectedAddress) return;
    accountListener && accountListener.unsubscribe();

    if (selectedProvider?.name() !== 'BEARBY') return;
    const _listener = selectedProvider.listenAccountChanges((address) => {
      if (connectedAddress === address) return;
      fetchAccounts(selectedProvider);
    });

    setAccountListener(_listener);
  }, [connectedAddress]);

  useEffect(() => {
    networkListener && networkListener.unsubscribe();
    if (!selectedProvider) return;

    const _listener = selectedProvider.listenNetworkChanges((_network) => {
      if (_network === network) return;
      setNetwork(_network);
    });

    setNetworkListener(_listener);

    if (!accounts) return;
    fetchMasBalances();
  }, [network, selectedProvider]);

  useEffect(() => {
    getProviderList().then((providers) => {
      const provider = providers.find(
        (p) => p.name() === localStorage.getItem('provider')
      );
      if (!provider) return;
      setSelectedProvider(provider);

      fetchAccounts(provider).then((_accounts) => {
        if (!_accounts) return;
        const accountIndex = clamp(accIndex, 0, _accounts.length - 1);
        initClientWallet(provider, _accounts[accountIndex]);
      });
    });
  }, []);

  useEffect(() => {
    if (!accounts) return;
    if (!selectedProvider) return;

    const accountIndex = isBearbyProvider
      ? 0
      : clamp(accIndex, 0, accounts.length - 1);
    initClientWallet(selectedProvider, accounts[accountIndex]);
  }, [accounts]);

  const initClientWallet = async (provider: IProvider, acc: IAccount) => {
    const cliAddress = client?.wallet().getBaseAccount()?.address();
    if (
      provider.name() === localStorage.getItem('provider') &&
      acc === account &&
      cliAddress === acc.address()
    )
      return;
    const cli = await ClientFactory.fromWalletProvider(provider, acc);

    const nodesUrls = await provider.getNodesUrls();
    if (nodesUrls[0] !== CHAIN_URL) {
      cli.setCustomProviders(clientProviders);
    }
    setClient(cli);
    localStorage.setItem('provider', provider.name());
    if (provider.name() !== 'MASSASTATION') return;
    connect(acc);
  };

  async function getProviderList(): Promise<IProvider[]> {
    try {
      const providersList = await getProviders();
      if (providersList.length === 0) {
        setLoadingProvider('No provider detected');
        throw new Error(NO_PROVIDER_ERROR);
      }

      setProviderList(providersList);
      return providersList;
    } catch (error) {
      setErrorMessage((error as Error).message);
      return [];
    }
  }

  async function fetchAccounts(provider: IProvider) {
    try {
      const providerAccounts = await provider.accounts();
      fetchMasBalances(providerAccounts);
      setAccounts(providerAccounts);
      if (providerAccounts.length === 0) {
        setLoadingProvider('No account detected.');
        setErrorMessage(NO_ACCOUNT_ERROR);
      }
      return providerAccounts;
    } catch (error) {
      setLoadingProvider('No account detected.');
      setErrorMessage(NO_ACCOUNT_ERROR);
    }
  }

  async function openBearbyWallet(provider: IProvider) {
    new BearbyAccount(
      {
        address: '',
        name: ''
      },
      'BEARBY'
    )
      .connect()
      .then(() => fetchAccounts(provider));
  }

  async function connect(acc: IAccount): Promise<void> {
    try {
      const index =
        accounts?.findIndex((a) => a.address() === acc.address()) ?? 0;
      setAccIndex(index);
      localStorage.setItem('accountIndex', index.toString());
      setErrorMessage('');
    } catch (error) {
      console.error('Error while connecting to Massa Station: ', error);
      resetAccountInfo();
      setErrorMessage(
        'Massa Station is not running or the wallet plugin is not installed.'
      );
    }
  }

  async function disconnect() {
    localStorage.removeItem('provider');
    resetAccountInfo();
  }

  function resetAccountInfo() {
    setAccounts(undefined);
    setClient(undefined);
  }

  return {
    connected,
    connectedAddress,
    account,
    errorMessage,
    connect,
    disconnect,
    fetchAccounts,
    initClientWallet,
    providerList,
    selectedProvider,
    setSelectedProvider,
    openBearbyWallet,
    accounts,
    setAccounts,
    masBalances,
    balance,
    fetchMasBalances,
    loadingProvider,
    client,
    network
  };
};

export default useWalletProvider;
