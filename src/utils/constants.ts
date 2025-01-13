import { baseClient } from './w3';

// Time constants (in ms)
export const ONE_MINUTE = 60 * 1000;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_PERIOD = 16_000;
export const PERIOD_PER_DAY = ONE_DAY / ONE_PERIOD;

// (changes here should be reflected in the backend)
export const TIME_BETWEEN_TICKS = 5 * ONE_MINUTE;
export const TICKS_PER_DAY = ONE_DAY / TIME_BETWEEN_TICKS;

// Autopool constants
export const genesisTimestamp = await baseClient
  .publicApi()
  .getNodeStatus()
  .then((status) => status.config.genesis_timestamp)
  .catch(() => 0);

export const unknownURI = 'https://pngimg.com/d/question_mark_PNG99.png';

export const swapFees = 990n; // 0.3% fee

export const tokenTotalSupply = 1_000_000_000n * BigInt(10 ** 18);
export const tokenVirtualLiquidity = 200_000_000n * BigInt(10 ** 18);
export const massaVirtualLiquidity = 150_000n * BigInt(10 ** 9);
export const initialTokenLiquidityInCurve = 800_000_000n * BigInt(10 ** 18);
