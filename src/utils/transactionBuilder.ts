import {
  Args,
  ICallData,
  MAX_GAS_CALL,
  MassaUnits
} from '@massalabs/massa-web3';
import { baseClient } from './w3';
import { deployerSC, faucetSC } from './config';

const ONE_BILLION = 1_000_000_000n;
const callData: Pick<ICallData, 'coins' | 'fee' | 'maxGas'> = {
  coins: 100n * MassaUnits.mMassa, // 0.1 MAS
  fee: await baseClient
    .publicApi()
    .getMinimalFees()
    .catch(() => 100n * MassaUnits.mMassa), // 0.1 MAS
  maxGas: ONE_BILLION
};

export const buildBuyTx = (
  amountIn: bigint,
  amountOutMin: bigint,
  pairAddress: string,
  to: string
): ICallData => {
  const args = new Args()
    .addU256(amountOutMin)
    .addString(to)
    .addU64(BigInt(Date.now() + 600_000));

  return {
    ...callData,
    targetAddress: pairAddress,
    targetFunction: 'buy',
    parameter: args,
    coins: amountIn
  };
};

export const buildSellTx = (
  amountIn: bigint,
  amountOutMin: bigint,
  pairAddress: string,
  to: string
): ICallData => {
  const args = new Args()
    .addU256(amountIn)
    .addU256(amountOutMin)
    .addString(to)
    .addU64(BigInt(Date.now() + 600_000));

  return {
    ...callData,
    targetAddress: pairAddress,
    targetFunction: 'sell',
    parameter: args,
    coins: 0n
  };
};

export const buildDeployTx = (
  name: string,
  symbol: string,
  amountToBuy: bigint
): ICallData => {
  const args = new Args().addString(name).addString(symbol);
  if (amountToBuy > 0n) {
    args.addU256(amountToBuy);
  }

  return {
    ...callData,
    targetAddress: deployerSC,
    targetFunction: 'deploy',
    parameter: args,
    coins: 20n * MassaUnits.oneMassa + amountToBuy, // 20 MAS + amountToBuy
    maxGas: MAX_GAS_CALL
  };
};

export const buildIncreaseAllowanceTx = (
  token: string,
  amount: bigint,
  pairAddress: string
): ICallData => {
  const args = new Args()
    .addString(pairAddress)
    .addU256(amount > 0n ? amount : 0n);

  return {
    ...callData,
    targetAddress: token,
    targetFunction: 'increaseAllowance',
    parameter: args
  };
};

export const buildClaimFaucetTx = (): ICallData => {
  return {
    ...callData,
    targetAddress: faucetSC,
    targetFunction: 'claim',
    parameter: new Args(),
    coins: 0n
  };
};
