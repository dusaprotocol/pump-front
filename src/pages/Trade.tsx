import Button from 'components/Button';
import Tabs from 'components/Tabs';
import TradingViewContainer from 'components/TradingView';
import { createContext, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorPage from './ErrorPage';
import TokenInput from 'components/TokenInput';
import { Token } from 'utils/types';
import Spinner from 'components/Spinner';
import {
  fetchHoldersTokenBalance,
  fetchTokenBalance,
  fetchTokenHolders,
  fetchUserAllowance,
  getTokenValueOnDusa
} from 'utils/datastoreFetcher';
import { useSendTransaction } from 'hooks/useSendTransaction';
import ProgressBar from 'components/ProgressBar';
import Message from 'components/Message';
import { AccountWrapperContext } from 'context/Account';
import { MASSA } from 'utils/tokens';
import {
  buildBuyTx,
  buildIncreaseAllowanceTx,
  buildSellTx
} from 'utils/transactionBuilder';
import { Percent, TokenAmount, parseUnits } from '@dusalabs/sdk';
import {
  getAmountOut,
  printAddress,
  printBigintIsh,
  printProfile,
  printUSD,
  toFraction,
  toSDKToken
} from 'utils/methods';
import usePairManager from 'hooks/usePairManager';
import { Swap, trpc, Token as trpcToken, User } from 'utils/trpc';
import ConnectButton from 'components/ConnectButton';
import { CHAIN_ID, deployerSC } from 'utils/config';
import Modal from 'components/Modal';
import TradeRow from 'components/TradeRow';
import SmallPicture from 'components/SmallPicture';
import { routeNames } from 'routes';
import clsx from 'clsx/lite';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faRefresh } from '@fortawesome/free-solid-svg-icons';
import useAuth from 'hooks/useAuth';
import {
  initialTokenLiquidityInCurve,
  massaVirtualLiquidity,
  tokenTotalSupply,
  tokenVirtualLiquidity
} from 'utils/constants';
import { useQuery } from '@tanstack/react-query';
import useClipboard from 'hooks/useClipboard';
import { Token as PrismaToken } from 'utils/trpc';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

type Account = {
  address: string;
  percentage: number;
  username?: string;
};

interface TradeContextProps {
  tokenAddress: string;
  pairAddress: string;
  devAddress: string;
  dusaPairAddress?: string;
}
export const TradeContext = createContext<TradeContextProps>(
  {} as TradeContextProps
);

const Trade = () => {
  const [swapTab, setSwapTab] = useState<'Buy' | 'Sell'>('Buy');
  const isBuy = swapTab === 'Buy';
  const [socketTab, setSocketTab] = useState<'Thread' | 'Trades'>('Thread');
  const [graphTab, setGraphTab] = useState<'Pump Graph' | 'Dusa Graph'>(
    'Dusa Graph'
  );
  const [quantity, setQuantity] = useState<string>();
  const [isImageValid, setIsImageValid] = useState(true);
  const [tokenValueOnDusa, setTokenValueOnDusa] = useState<number>(0);
  // const [kingProgress, setKingProgress] = useState<number>(45);

  const tokenAddress = useParams().tokenAddress || '';

  const { copy, copied } = useClipboard(tokenAddress);

  const { connectedAddress, balance, fetchMasBalances } = useContext(
    AccountWrapperContext
  );
  // const marketCapToReach = 333_000 * (masValue || 0);

  const { data: token } = trpc.getToken.useQuery(
    { address: tokenAddress },
    { enabled: !!tokenAddress }
  );

  const sdkToken = token
    ? toSDKToken(token)
    : new Token(CHAIN_ID, tokenAddress, 18, '', '', '');
  const dusaPoolAddress = token?.dusaPoolAddress || undefined;
  const isPoolLocked = token?.completed || false;

  const { pairAddress, pairReserves, updateReservesAndPrice } = usePairManager({
    token: sdkToken
  });

  const disabledFetchAllowance = !connectedAddress || !token || !pairAddress;
  const allowanceQuery = useQuery(
    ['allowance', connectedAddress, tokenAddress],
    () => fetchAllowance(),
    { enabled: !disabledFetchAllowance }
  );
  const allowance = allowanceQuery.data || 0n;

  const tokenBalanceQuery = useQuery(
    ['tokenBalance', connectedAddress, tokenAddress],
    () => fetchTokenBalance(tokenAddress, connectedAddress),
    { enabled: !!connectedAddress }
  );
  const tokenBalance = tokenBalanceQuery.data || 0n;

  const masBalance = parseUnits(balance.toString(), 9);

  const holdersQuery = useQuery(['holders', tokenAddress], () =>
    fetchHolderDistribution()
  );
  const holderDistribution = holdersQuery.data || [];

  const { data: tokenValue } = trpc.getTokenValue.useQuery(
    { tokenAddress, tokenDecimals: sdkToken.decimals },
    { enabled: !!tokenAddress }
  );

  useEffect(() => {
    if (!tokenAddress || !sdkToken.decimals) return;
    getTokenValueOnDusa(tokenAddress, sdkToken.decimals).then(
      setTokenValueOnDusa
    );
  }, [tokenAddress, sdkToken.decimals]);

  const nbTokensInCurve = pairReserves?.reserve_token || 0n;
  const nbMasInCurve = pairReserves?.reserve_mas || 0n;

  // const kingMaxCap = 71580;
  const unUsedLiquidity = 200_000_000n * BigInt(10 ** 18);

  const tokenSupply = dusaPoolAddress
    ? tokenTotalSupply
    : tokenTotalSupply - nbTokensInCurve + tokenVirtualLiquidity;

  const marketCap = new TokenAmount(sdkToken, tokenSupply).multiply(
    toFraction(dusaPoolAddress ? tokenValueOnDusa : tokenValue || 0)
  );

  const missingLiquidity =
    initialTokenLiquidityInCurve -
    nbTokensInCurve +
    unUsedLiquidity +
    tokenVirtualLiquidity;
  const progress = isPoolLocked
    ? 100
    : Number((missingLiquidity * 10000n) / initialTokenLiquidityInCurve) / 100;

  const fetchHolderDistribution = async (): Promise<Account[]> => {
    if (!tokenAddress) throw new Error('token address not set');

    return fetchTokenHolders(tokenAddress).then(async (res) => {
      return fetchHoldersTokenBalance(res, tokenAddress).then((r) => {
        const holders = r
          .filter((x) => x.address !== deployerSC)
          .sort((a, b) => Number(b.balance - a.balance));

        return holders
          .filter((holder) => holder.balance > 0n)
          .map((holder) => {
            return {
              address: holder.address,
              percentage:
                Number(
                  (holder.balance * BigInt(10 ** 20)) /
                    (initialTokenLiquidityInCurve + unUsedLiquidity)
                ) /
                10 ** 18
            };
          });
      });
    });
  };

  const amountIn =
    quantity && token
      ? isBuy
        ? parseUnits(quantity, MASSA.decimals)
        : parseUnits(quantity, token.decimals)
      : 0n;

  const amountOut = pairReserves
    ? getAmountOut(
        amountIn,
        isBuy ? pairReserves.reserve_mas : pairReserves.reserve_token,
        isBuy ? pairReserves.reserve_token : pairReserves.reserve_mas
      )
    : 0n;
  const slippage = new Percent(2000n, 10000n);
  const amountOutMin =
    amountOut - (amountOut * slippage.numerator) / slippage.denominator;

  const onTxConfirmed = () => {
    setQuantity('');
    tokenBalanceQuery.refetch();
    fetchMasBalances();
    holdersQuery.refetch();
    updateReservesAndPrice();
  };

  const buildTx = (buy: boolean) =>
    (buy ? buildBuyTx : buildSellTx)(
      amountIn,
      amountOutMin,
      pairAddress ?? '',
      connectedAddress
    );

  const { submitTx: swap, pending: pendingSwap } = useSendTransaction({
    data: buildTx(isBuy ? true : false),
    onTxConfirmed
  });

  const { submitTx: increaseAllowance, pending: pendingAllowance } =
    useSendTransaction({
      data: buildIncreaseAllowanceTx(
        tokenAddress,
        BigInt(2) ** BigInt(256) - BigInt(1),
        pairAddress ?? ''
      ),
      onTxConfirmed: () => allowanceQuery.refetch()
    });

  const insufficientAllowance =
    swapTab === 'Sell' && allowance !== undefined && allowance < amountIn;

  const fetchAllowance = () => {
    if (disabledFetchAllowance) return;

    return fetchUserAllowance(token.address, connectedAddress, pairAddress);
  };

  const { data: recentSwaps, refetch: swapsRefetch } =
    trpc.getRecentSwaps.useQuery(
      { poolAddress: pairAddress || '', take: 100 },
      { enabled: !!pairAddress }
    );

  trpc.onAddSwap.useSubscription(undefined, {
    onData: (data) => {
      if (data.poolAddress === pairAddress) {
        holdersQuery.refetch();
        swapsRefetch();
      }
    },
    onStarted: () => {
      console.log('started');
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const handleImageError = () => {
    setIsImageValid(false);
  };

  if (!tokenAddress) return <ErrorPage />;
  if (!token || pairAddress === undefined) return <Spinner />;

  return (
    <div className='w-full max-w-screen-xl'>
      <div className='mt-4 flex flex-col-reverse gap-8 lg:flex-row'>
        <TradeContext.Provider
          value={{
            tokenAddress,
            pairAddress,
            devAddress: token?.createdBy || '',
            dusaPairAddress: dusaPoolAddress
          }}
        >
          <div className='flex w-full flex-col gap-2 lg:w-2/3'>
            <div className='flex flex-wrap gap-x-2 gap-y-0 whitespace-nowrap'>
              <div className='flex gap-1'>
                <span className='text-sm opacity-80'>Name:</span>
                <span className='text-sm font-bold'>{token.name}</span>
              </div>
              <div className='flex gap-1'>
                <span className='text-sm opacity-80'>Ticker:</span>
                <span className='text-sm font-bold'>{token.symbol}</span>
              </div>
              <div className='flex gap-1'>
                <span className='text-sm opacity-80'>Market cap:</span>
                <span className='text-sm font-bold text-green-200'>
                  ${printUSD(Number(marketCap?.toSignificant(6)), false)}
                </span>
              </div>
              <div className='flex w-full cursor-pointer gap-1' onClick={copy}>
                <span className='text-sm opacity-80'>Token Address:</span>
                <div className='whitespace-normal break-all text-sm font-bold'>
                  {token.address}{' '}
                  <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                </div>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-sm opacity-80'>Created by:</span>
                <SmallPicture imgURI={token.dev?.profileImageURI} />
                <Link
                  to={routeNames.profile.split(':')[0] + token.createdBy}
                  className='whitespace-nowrap text-sm font-bold hover:underline'
                >
                  {printProfile(token.createdBy, token.dev.username)}
                </Link>
                <span>{dayjs(token.createdAt).fromNow()}</span>
              </div>
            </div>
            {dusaPoolAddress ? (
              <>
                <div className='max-w-32'>
                  <Tabs
                    tab={graphTab}
                    setTab={setGraphTab}
                    tabs={['Pump Graph', 'Dusa Graph']}
                    variant='small'
                  />
                </div>
                <div
                  className={clsx(
                    graphTab === 'Pump Graph' ? 'block' : 'hidden'
                  )}
                >
                  <TradingViewContainer address={sdkToken.address} pump />
                </div>
                <div
                  className={clsx(
                    graphTab === 'Dusa Graph' ? 'block' : 'hidden'
                  )}
                >
                  <TradingViewContainer
                    address={dusaPoolAddress}
                    pump={false}
                  />
                </div>
              </>
            ) : (
              <TradingViewContainer address={sdkToken.address} pump />
            )}
            <div className='mt-4 flex flex-col gap-2'>
              <Tabs
                tab={socketTab}
                setTab={setSocketTab}
                tabs={['Thread', 'Trades']}
                variant='classic'
              />
              {socketTab === 'Thread' ? (
                <ThreadTab token={token} dev={token.dev as User} />
              ) : (
                <TradeTab
                  token={sdkToken}
                  recentSwaps={recentSwaps as Swap[] | undefined}
                />
              )}
            </div>
          </div>
        </TradeContext.Provider>
        <div className='flex w-full flex-col gap-4 lg:w-1/3'>
          <div className='flex flex-col gap-1'>
            <Tabs
              tab={swapTab}
              setTab={setSwapTab}
              tabs={['Buy', 'Sell']}
              variant='swapCard'
            />
            <TokenInput
              token={isBuy ? MASSA : sdkToken}
              quantity={quantity}
              setQuantity={setQuantity}
              balance={isBuy ? masBalance : tokenBalance}
              className='w-full'
            />

            <span>
              {printBigintIsh(isBuy ? sdkToken : MASSA, amountOut)}{' '}
              {isBuy ? token.symbol : MASSA.symbol}
            </span>
            {insufficientAllowance && (
              <Button
                text='Increase allowance'
                variant='contained'
                onClick={increaseAllowance}
                pending={pendingAllowance}
              />
            )}
            {connectedAddress ? (
              <Button
                text='Place trade'
                disabledText={
                  (dusaPoolAddress && 'This pool migrated to Dusa') ||
                  (isPoolLocked && 'This pool is migrating to Dusa') ||
                  (isBuy
                    ? masBalance < amountIn && 'Insufficient MAS balance'
                    : tokenBalance < amountIn &&
                      `Insufficient ${token.symbol} balance`) ||
                  (insufficientAllowance &&
                    `Insufficient allowance of ${token.symbol}`) ||
                  undefined
                }
                disabled={amountIn === 0n}
                onClick={swap}
                pending={pendingSwap}
                variant='contained'
              />
            ) : (
              <ConnectButton />
            )}
          </div>
          <div className='flex flex-col gap-1'>
            {token.telegram && (
              <a
                href={token.telegram}
                target='_blank'
                rel='noreferrer noopener'
                className='cursor-pointer text-blue-400 hover:underline'
              >
                telegram
              </a>
            )}
            {token.twitter && (
              <a
                href={token.twitter}
                target='_blank'
                rel='noreferrer noopener'
                className='cursor-pointer text-blue-400 hover:underline'
              >
                twitter
              </a>
            )}
            {token.website && (
              <a
                href={token.website}
                target='_blank'
                rel='noreferrer noopener'
                className='cursor-pointer text-blue-400 hover:underline'
              >
                website
              </a>
            )}
          </div>
          <div className='flex rounded-lg bg-gray-800 p-4'>
            {isImageValid && token.imageURI && (
              <img
                src={token.imageURI}
                onError={handleImageError}
                alt={'logo of ' + token.name}
                className='h-fit w-24 rounded-md object-cover'
              />
            )}
            <div className='ml-4 text-gray-100'>
              <h2 className='text-lg font-semibold'>
                {token.name} (ticker: {token.symbol})
              </h2>
              <p className='mt-2'>{token?.description}</p>
            </div>
          </div>
          <div className='flex flex-col'>
            <span>bonding curve progress: {progress}%</span>
            <ProgressBar progress={progress} variant='green' />
          </div>
          <div className='flex flex-col text-xs'>
            {isPoolLocked ? (
              <span>
                {/* As the target market cap is reached, the liquidity pool is now */}
                As the bonding cuve is fully completed, the liquidity pool is
                now in the process of being migrated to Dusa. All remaining
                liquidity from the bonding curve will be deposited into Dusa
                ensuring a smooth transition.
              </span>
            ) : (
              <>
                <span>
                  {/* When the market cap reaches ${printUSD(marketCapToReach)} all */}
                  When the bonding curve reaches its maximum liquidity, all the
                  liquidity from the bonding curve will be deposited into Dusa.
                  Progression increases as the price goes up.
                </span>
                <span>
                  There are{' '}
                  {printBigintIsh(
                    sdkToken,
                    nbTokensInCurve - unUsedLiquidity - tokenVirtualLiquidity
                  )}{' '}
                  tokens still available for sale in the bonding curve and there
                  is{' '}
                  {printBigintIsh(MASSA, nbMasInCurve - massaVirtualLiquidity)}{' '}
                  MAS in the bonding curve.
                </span>
              </>
            )}
          </div>
          {/* <div className='flex flex-col'>
            <span>king of the hill progress: {kingProgress}%</span>
            <ProgressBar progress={kingProgress} variant='orange' />
            dethrone the current king at a ${kingMaxCap} mcap
          </div> */}
          <div>
            <span>Holder distribution</span>
            <AccountList
              accounts={holderDistribution}
              pairAddress={pairAddress}
              dev={token.dev as User}
              dusaPoolAddress={dusaPoolAddress || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;

interface AccountListProps {
  accounts: Account[] | undefined;
  pairAddress: string | undefined;
  dev: PrismaToken['dev'] | undefined;
  dusaPoolAddress: string | undefined;
}

const AccountList = ({
  accounts,
  pairAddress,
  dev,
  dusaPoolAddress
}: AccountListProps) => {
  const addresses = accounts?.map((account) => account.address) || [];
  const { data: getUsernames } = trpc.getUsernames.useQuery(addresses, {
    enabled: !!addresses
  });
  getUsernames &&
    accounts?.map((account) => {
      [...getUsernames].map((user) => {
        if (account.address === user.address) {
          account.username = user.username || undefined;
        }
      });
    });

  return (
    <div className='text-sm'>
      <div className='grid max-h-80 gap-1 overflow-y-auto'>
        {accounts?.map((account, index) => {
          const bonding = account.address === pairAddress;
          const dusaPool = account.address === dusaPoolAddress;
          const isDev = account.address === dev?.address;
          const percentage = account.percentage;

          const getBadge = () => {
            if (bonding) return ' 🪐 (bonding curve)';
            if (dusaPool) return ' 🪼 (Dusa pool)';
            if (isDev) return ' 💻 (dev)';
            return '';
          };

          return (
            <div key={index} className='flex justify-between'>
              <div>
                {bonding || dusaPool ? (
                  <div>
                    {index + 1}. {printAddress(account.address)}
                    {getBadge()}
                  </div>
                ) : (
                  <Link
                    to={`${routeNames.profile.split(':')[0]}${account.address}`}
                    className={clsx(
                      'whitespace-nowrap py-1 font-medium',
                      'hover:underline'
                    )}
                  >
                    {index + 1}.{' '}
                    {printProfile(account.address, account.username)}
                    {getBadge()}
                  </Link>
                )}
              </div>
              <div>
                {percentage === 0
                  ? 0
                  : percentage < 0.01
                    ? '< 0.01'
                    : percentage > 99.99
                      ? '> 99.99'
                      : percentage.toFixed(2)}
                %
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ThreadTabProps {
  token: trpcToken | undefined;
  dev: User | undefined;
}

const ThreadTab = ({ token, dev }: ThreadTabProps) => {
  const [text, setText] = useState<string>();
  const [showModal, setShowModal] = useState(false);

  const { connectedAddress } = useContext(AccountWrapperContext);
  const { handleSign, isLoggedIn } = useAuth();
  const { data: getComments, refetch } = trpc.getComments.useQuery(
    {
      tokenAddress: token?.address || ''
    },
    { enabled: !!token }
  );
  const { mutate: postComment, isLoading } = trpc.postComment.useMutation({
    onSuccess: async () => {
      closeModal();
      await refetch();
      refetch(); // have to call it twice to update the user (to be fixed)
      toast.dismiss();
      toast.success('Comment posted');
    },
    onError: (error) => {
      toast.dismiss();
      const message =
        error.message === 'Wrong JWT'
          ? 'You cannot comment with this profile.'
          : error.message || 'Failed to update profile';
      toast.error(message);
    }
  });

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  const handlePostComment = async () => {
    if (!connectedAddress || !text || !token) return;
    if (!isLoggedIn) {
      await handleSign();
    }
    postComment({
      tokenAddress: token.address || '',
      userAddress: connectedAddress,
      text
    });
    toast.loading('Posting comment...');
  };

  return (
    <>
      <div className='flex flex-col gap-1'>
        {token && dev && (
          <Message
            user={dev}
            message={token.description || 'No description for this token'}
            img={token.imageURI}
            date={token.createdAt}
          />
        )}
        {getComments
          ?.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .map((comment, index) => (
            <Message
              key={'message' + index}
              user={comment.user as User}
              message={comment.message}
              date={comment.createdAt}
            />
          ))}
        <Button
          text='New message'
          variant='text'
          onClick={() => setShowModal(true)}
          disabledText={
            (!connectedAddress && 'Connect to post a message') || undefined
          }
        />
      </div>
      {showModal && (
        <Modal
          title='Add a comment'
          showModal={showModal}
          setShowModal={setShowModal}
        >
          <input
            type='text'
            onChange={(e) => {
              setText(e.target.value);
            }}
            className='w-full rounded-lg bg-gray-700 p-2 text-gray-100'
          />
          <Button
            text='Post'
            variant='outlined'
            onClick={handlePostComment}
            disabled={isLoading}
          />
        </Modal>
      )}
    </>
  );
};

interface TradeTabProps {
  token: Token | undefined;
  recentSwaps: Swap[] | undefined;
}

const TradeTab = ({ token, recentSwaps }: TradeTabProps) => {
  const [displayRelativeDate, setDisplayRelativeDate] = useState(true);

  if (!token) return null;
  return (
    <div>
      <div className='grid grid-cols-5 rounded-lg bg-gray-800 sm:grid-cols-6 md:grid-cols-7'>
        <div className='col-span-2 p-3 font-normal'>account</div>
        <div className='col-span-1 hidden p-3 text-right font-normal sm:block md:text-left'>
          type
        </div>
        <div className='col-span-1 p-3 text-right font-normal md:text-left'>
          MAS
        </div>
        <div className='col-span-1 p-3 text-right font-normal md:text-left'>
          {token.symbol}
        </div>
        <div className='col-span-1 hidden items-center gap-2 p-3 text-left font-normal md:flex'>
          <span>date</span>
          <FontAwesomeIcon
            icon={faRefresh}
            onClick={() => setDisplayRelativeDate((prev) => !prev)}
            className='cursor-pointer'
          />
        </div>
        <div className='col-span-1 hidden truncate p-3 text-right font-normal md:block'>
          transaction
        </div>
        <div className='col-span-1 block p-3 text-right font-normal md:hidden'>
          txn
        </div>
      </div>
      {recentSwaps?.map((swap, index) => {
        return (
          <TradeRow
            user={swap.user as User}
            swap={swap}
            token={token}
            key={index}
            displayRelativeDate={displayRelativeDate}
          />
        );
      })}
    </div>
  );
};
