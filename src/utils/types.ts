import { Token as _Token } from '@dusalabs/sdk';

export class Token extends _Token {
  readonly logoURI: string;
  readonly symbol: string;
  readonly name: string;

  constructor(
    chainId: number,
    address: string,
    decimals: number,
    logoURI: string,
    symbol: string,
    name: string
  ) {
    super(chainId, address, decimals, symbol, name);
    this.logoURI = logoURI;
    this.symbol = symbol;
    this.name = name;
  }
}

export type SwapMethod =
  | 'swapMASForExactTokens'
  | 'swapExactMASForTokens'
  | 'swapExactTokensForMAS';
