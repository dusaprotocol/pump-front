import { IAccount } from '@massalabs/wallet-provider';
import { baseClient } from './w3';
import { bytesToStr, bytesToU256, bytesToU64 } from '@massalabs/massa-web3';
import { IBaseContract, IERC20 } from '@dusalabs/sdk';
import { dusaApi, factorySC, faucetSC } from './config';
import { WMAS } from './tokens';

// ==================================================== //
// ====                NODE STATUS                 ==== //
// ==================================================== //

export const fetchNodeState = () => baseClient.publicApi().getNodeStatus();

// ==================================================== //
// ====               USER BALANCE                 ==== //
// ==================================================== //

export const fetchBalance = (account: string): Promise<bigint> =>
  baseClient
    .wallet()
    .getAccountBalance(account)
    .then((e) => {
      if (!e) return 0n;
      return e.candidate;
    })
    .catch(() => 0n);

export const fetchAccountsBalance = async (
  accounts: IAccount[]
): Promise<number[]> =>
  baseClient
    .publicApi()
    .getAddresses(accounts.map((a) => a.address()))
    .then((res) => res.map((r) => Number(r.candidate_balance)));

export const fetchTokenBalance = async (
  address: string,
  account: string
): Promise<bigint> => {
  if (address === WMAS.address) return fetchBalance(account);
  else
    return new IERC20(address, baseClient).balanceOf(account).catch(() => 0n);
};

export const fetchTokenHolders = async (address: string): Promise<string[]> => {
  return baseClient
    .publicApi()
    .getAddresses([address])
    .then((res) => {
      const keys = res[0].candidate_datastore_keys.map((key) =>
        String.fromCharCode(...key)
      );
      return keys
        .filter((key) => key.startsWith('BALANCE'))
        .map((key) => key.slice(7));
    });
};

export const fetchHoldersTokenBalance = async (
  userAddresses: string[],
  tokenAddress: string
): Promise<{ address: string; balance: bigint }[]> => {
  const bs = userAddresses.map((address: string) => 'BALANCE' + address);
  return new IBaseContract(tokenAddress, baseClient).extract(bs).then((res) => {
    const balances = res.map((entry, i) => {
      const balance = entry ? bytesToU256(entry) : 0n;
      return { address: userAddresses[i], balance };
    });
    return balances;
  });
};

export const fetchPairAddress = async (
  tokenAddress: string
): Promise<string> => {
  const key = `pairMapping::${tokenAddress}:${WMAS.address}`;
  return new IBaseContract(factorySC, baseClient).extract([key]).then((res) => {
    if (!res[0]) throw new Error('No pair found');
    return bytesToStr(res[0]);
  });
};

export const fetchPairReserves = async (
  address: string
): Promise<{ reserve_token: bigint; reserve_mas: bigint }> => {
  return new IBaseContract(address, baseClient)
    .extract(['reserve0', 'reserve1'])
    .then((res) => {
      if (!res[0]?.length || !res[1]?.length)
        throw new Error('No token info found');

      return {
        reserve_token: bytesToU256(res[0]),
        reserve_mas: bytesToU256(res[1])
      };
    });
};

export const getTokenValueOnDusa = async (
  tokenAddress: string,
  tokenDecimals: number
): Promise<number> => {
  try {
    const response = await fetch(
      `${dusaApi}/api/token-value?tokenAddress=${tokenAddress}&tokenDecimals=${tokenDecimals}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching token value:', error);
    return 0;
  }
};

// ==================================================== //
// ====               USER ALLOWANCE               ==== //
// ==================================================== //

export const fetchUserAllowance = async (
  token: string,
  owner: string,
  pairAddress: string
): Promise<bigint> =>
  new IERC20(token, baseClient).allowance(owner, pairAddress).catch(() => 0n);

// ==================================================== //
// ====                   FAUCET                   ==== //
// ==================================================== //

export const fetchLastClaim = async (address: string): Promise<number> => {
  return new IBaseContract(faucetSC, baseClient)
    .extract([`last_claim::${address}`])
    .then((res) => {
      const data = res[0];
      if (!data || !data.length) return 0;

      return Number(bytesToU64(data));
    });
};

// ==================================================== //
// ====                     MISC                   ==== //
// ==================================================== //

export const u8ArrayToString = (array: Uint8Array): string =>
  String.fromCharCode(...array);
