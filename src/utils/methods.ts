import { Fraction, TokenAmount } from '@dusalabs/sdk';
import { BigintIsh } from '@dusalabs/sdk/dist/constants';
import { swapFees } from './constants';
import { MASSA, WMAS } from './tokens';
import { Token } from './types';
import { Address } from '@massalabs/massa-web3';
import * as tRPC from './trpc';
import { CHAIN_ID, EXPLORER, NETWORK } from './config';

export const abs = (x: bigint): bigint => (x < 0n ? -x : x);

export const round = (x: number, precision = 2): number =>
  Math.round(x * 10 ** precision) / 10 ** precision;

export const roundPrice = (x: number): number =>
  round(x, x > 100 ? 2 : x > 1 ? 4 : 6);

export const formatNumber = (num: number, precision = 2): string => {
  return num.toLocaleString('en-US', {
    maximumSignificantDigits:
      num < 1 ? (precision <= 0 ? 1 : precision) : undefined,
    maximumFractionDigits: precision
  });
};

export const printBigintIsh = (
  token: Token,
  amount: BigintIsh,
  precision = 2
): string => formatNumber(roundTokenAmount(token, amount), precision);

export const roundTokenAmount = (token: Token, amount: BigintIsh) =>
  Number(new TokenAmount(token, amount).toFixed(token.decimals));

export const roundFractionPrice = (fraction: Fraction): string => {
  const value =
    Number(fraction.quotient) +
    Number(fraction.remainder.numerator) /
      Number(fraction.remainder.denominator || 1);

  let decimalPlaces = 6;
  if (value > 100) decimalPlaces = 2;
  else if (value > 1) decimalPlaces = 4;

  return fraction.toFixed(decimalPlaces);
};

export const printUSD = (value: number, keepCents = true, precision = 2) =>
  value.toLocaleString('en-US', {
    maximumSignificantDigits: value < 1 ? precision : undefined,
    maximumFractionDigits: keepCents ? precision : 0,
    minimumFractionDigits: keepCents ? precision : 0
  });

export const toFraction = (float: number): Fraction => {
  const value = BigInt(Math.round((float || 1) * 1e18));
  return new Fraction(value, BigInt(1e18));
};

export const minmax = (val: number, min: number, max: number) =>
  Math.min(Math.max(min, val), max);

export const printAddress = (address: string) =>
  address.substring(address.length - 6);

export const printProfile = (address: string, username?: string | null) => {
  if (username) return '@' + username;
  return printAddress(address);
};

const getNbSignificantNumbers = (amount: bigint): number =>
  Math.floor(Math.log10(Number(amount === 0n ? 1n : amount))) + 1;

export const tokenAmountToSignificant = (tokenAmount: TokenAmount): string =>
  tokenAmount.toSignificant(getNbSignificantNumbers(tokenAmount.raw));

export const getMasIfWmas = (token: Token): Token => {
  if (token.equals(WMAS)) return MASSA;
  else return token;
};

export const getWmasIfMas = (token: Token): Token => {
  if (token.equals(MASSA)) return WMAS;
  else return token;
};

export const getAmountOut = (
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): bigint => {
  if (amountIn === 0n) return 0n;
  if (reserveIn === 0n || reserveOut === 0n) return 0n;

  const amountInWithFee = amountIn * swapFees;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  if (denominator === 0n) return 0n;
  return numerator / denominator;
};

export const getRoute = (routeName: string, param: string) =>
  routeName.split(':')[0] + param;

export const isAddressValid = (address: string): boolean => {
  try {
    new Address(address);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const toSDKToken = (
  token: Pick<
    tRPC.Token,
    'address' | 'decimals' | 'imageURI' | 'symbol' | 'name'
  >
): Token => {
  return new Token(
    CHAIN_ID,
    token.address,
    token.decimals,
    token.imageURI || '',
    token.symbol,
    token.name
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decodeError = (error: any): string => {
  try {
    const json = JSON.parse(error.message);
    return json[0].message === 'Invalid' ? 'Invalid username' : json[0].message;
  } catch (e) {
    const message = error.message;

    return message === 'Wrong JWT'
      ? 'You cannot edit this profile.'
      : error.message || 'Failed to update profile';
  }
};

export const shake = (ref: React.RefObject<HTMLDivElement>) => {
  const element = ref.current;
  if (!element) return;
  element.classList.add('animate-shake');

  const timer = setTimeout(() => {
    element.classList.remove('animate-shake');
  }, 1000);

  return () => clearTimeout(timer);
};

export const buildExplorerLink = (
  param: 'address' | 'block' | 'operation',
  id: string
): string => {
  const networkQuery = NETWORK === 'buildnet' ? '?network=buildnet' : '';
  return `${EXPLORER}/${param}/${id}${networkQuery}`;
};

export const clamp = (num: number, min: number, max: number) => {
  return Math.max(min, Math.min(num, max));
};
