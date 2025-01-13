import { useContext, useState } from 'react';
import {
  faArrowDown,
  faArrowUp,
  faCheck,
  faCopy,
  faExternalLink
} from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Message from 'components/Message';
import Spinner from 'components/Spinner';
import Tabs from 'components/Tabs';
import TokenLink from 'components/TokenLink';
import { AccountWrapperContext } from 'context/Account';
import useClipboard from 'hooks/useClipboard';
import { Link, useParams } from 'react-router-dom';
import { routeNames } from 'routes';
import { defaultProfileURI } from 'utils/config';
import { unknownURI } from 'utils/constants';
import { fetchTokenBalance, getTokenValueOnDusa } from 'utils/datastoreFetcher';
import {
  buildExplorerLink,
  getRoute,
  printBigintIsh,
  printProfile,
  roundTokenAmount,
  toSDKToken
} from 'utils/methods';
import { MASSA } from 'utils/tokens';
import { Token, TokenFull, trpc } from 'utils/trpc';
import Tooltip from 'components/Tooltip';
import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';

const TABS = ['coins held', 'coins created', 'replies', 'txs'] as const;
type Tab = (typeof TABS)[number];

const Profile = () => {
  const [tab, setTab] = useState<Tab>(TABS[0]);
  const [displayRelativeDate, setDisplayRelativeDate] = useState(true);

  const { masValue } = useContext(AccountWrapperContext);

  const fetchPrice = async (token: TokenFull) => {
    const isPoolMigrated = !!token.dusaPoolAddress;
    let tokenPrice: number | undefined;

    if (isPoolMigrated) {
      tokenPrice = await getTokenValueOnDusa(token.address, token.decimals);
      if (masValue && tokenPrice !== undefined) tokenPrice /= masValue;
    } else {
      tokenPrice = token.latest_swap_after_price;
    }

    return tokenPrice;
  };

  const address = useParams().address || '';
  const { copied, copy } = useClipboard(address);

  const { data: user, isLoading: isLoadingGetUser } = trpc.getUser.useQuery(
    { address },
    { enabled: !!address }
  );

  const getTokensQuery = trpc.getTokens.useQuery();
  const tokens = getTokensQuery.data || [];

  const balancesQuery = useQueries({
    queries: tokens.map((token) => ({
      queryKey: ['tokenBalance', token.address, address],
      queryFn: () => fetchTokenBalance(token.address, address).catch(() => 0n),
      enabled: !!tokens && !!address
    }))
  });
  const balances = balancesQuery.map((q) => q.data || 0n);
  const balancesQueryLoading = balancesQuery.some((q) => q.isLoading);

  const pricesQuery = useQueries({
    queries: tokens.map((token) => ({
      queryKey: ['tokenPrice', token],
      queryFn: () => fetchPrice(token),
      enabled: !!tokens
    }))
  });
  const prices = pricesQuery.map((q) => q.data || 0);
  const pricesQueryLoading = pricesQuery.some((q) => q.isLoading);

  const loadingCoinsHeldInfo =
    balancesQueryLoading || getTokensQuery.isLoading || pricesQueryLoading;

  const coinsCreated =
    tokens?.filter((token) => token.createdBy === address) || [];

  const lengthCoinsHeld = balances.filter((b) => !!b).length;
  const coinsHeldInfo = tokens
    ?.map((token, i) => ({
      token,
      amount: balances[i],
      price: prices[i]
    }))
    .filter((info) => info.amount && info.price);

  return (
    <div className='mx-auto my-0 flex w-full flex-col items-center gap-2'>
      <div className='flex gap-2'>
        {!isLoadingGetUser && (
          <img
            src={user?.profileImageURI || defaultProfileURI}
            alt='User profile image'
            className='h-16 w-16 rounded-full object-cover'
          />
        )}
        <div className='flex flex-col'>
          <span>{address ? printProfile(address, user?.username) : null} </span>
          {user?.bio && <span>{user.bio}</span>}
        </div>
      </div>
      {address && (
        <div
          className='w-full cursor-pointer break-words bg-slate-800 px-3 py-2 sm:w-auto'
          onClick={copy}
        >
          {address} <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
        </div>
      )}
      <div className='flex w-full flex-col gap-2 sm:w-[450px]'>
        <Tabs tab={tab} setTab={setTab} tabs={TABS} variant='small' />
        {getTokensQuery.isLoading ? (
          <Spinner />
        ) : getTokensQuery.isError ? (
          <>Error fetching tokens</>
        ) : (
          <>
            {tab === 'coins held' ? (
              <>
                {loadingCoinsHeldInfo ? (
                  <Spinner />
                ) : (
                  <>
                    {lengthCoinsHeld === 0 && 'no coin owned'}
                    {coinsHeldInfo
                      .sort((a, b) => {
                        const aValue =
                          a.price *
                          roundTokenAmount(toSDKToken(a.token), a.amount);
                        const bValue =
                          b.price *
                          roundTokenAmount(toSDKToken(b.token), b.amount);
                        return bValue - aValue;
                      })
                      .map((coinHeldInfo) => {
                        const { token, amount, price } = coinHeldInfo;
                        if (!token || !amount || !price) return null;

                        return (
                          <TokenDisplay
                            token={token}
                            amount={amount}
                            price={price}
                          />
                        );
                      })}
                  </>
                )}
              </>
            ) : tab === 'coins created' ? (
              <>
                {coinsCreated.length === 0 && 'no coin created'}
                {coinsCreated.map((token, i) => {
                  if (!coinsCreated[i]) return null;
                  return <TokenLink token={token} key={'coin created' + i} />;
                })}
              </>
            ) : tab === 'replies' ? (
              <>
                {!user?.comments.length && 'no comment'}
                {user?.comments.map((comment, i) => (
                  <Message
                    date={comment.createdAt}
                    message={comment.message}
                    user={user}
                    tokenAddress={comment.tokenAddress}
                    key={i}
                  />
                ))}
              </>
            ) : tab === 'txs' ? (
              <>
                {!user?.swapTxs.length && 'no transaction'}
                {user?.swapTxs.map((tx, i) => {
                  const isBuy = tx.swapForY === false;
                  const tokenIn = isBuy ? MASSA : toSDKToken(tx.pool.token);
                  const tokenOut = isBuy ? toSDKToken(tx.pool.token) : MASSA;

                  return (
                    <div
                      className='flex items-center justify-between gap-2 bg-gray-800 px-2 py-1'
                      key={'tx' + i}
                    >
                      <div className='flex items-center gap-2'>
                        <FontAwesomeIcon
                          icon={isBuy ? faArrowUp : faArrowDown}
                          className={isBuy ? 'text-green-500' : 'text-red-500'}
                        />
                        <span className='opacity-85'>
                          {isBuy ? 'Bought' : 'Sold'}{' '}
                          {printBigintIsh(tokenOut, tx.amountOut)}{' '}
                          <Link
                            to={getRoute(
                              routeNames.trade,
                              tx.pool.tokenAddress
                            )}
                            className='hover:underline'
                          >
                            {tokenOut.symbol}
                          </Link>{' '}
                          for {printBigintIsh(tokenIn, tx.amountIn)}{' '}
                          {tokenIn.symbol}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div
                          onClick={() =>
                            setDisplayRelativeDate(!displayRelativeDate)
                          }
                          className='whitespace-nowrap'
                        >
                          <Tooltip trigger={<FontAwesomeIcon icon={faClock} />}>
                            {displayRelativeDate
                              ? dayjs(tx.timestamp).fromNow()
                              : dayjs(tx.timestamp).format('MMM DD hh:mm:ss a')}
                          </Tooltip>
                        </div>
                        <a
                          href={buildExplorerLink('operation', tx.txHash)}
                          target='_blank'
                          rel='noreferrer noopener'
                          className='text-sm'
                        >
                          <FontAwesomeIcon icon={faExternalLink} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

interface TokenDisplayProps {
  token: Token;
  amount: bigint;
  price: number;
}

const TokenDisplay = ({ token, amount, price }: TokenDisplayProps) => {
  const [imageURL, setImageURL] = useState(token.imageURI || '');
  const handleImageError = () => {
    setImageURL(unknownURI);
  };
  return (
    <Link
      to={getRoute(routeNames.trade, token.address)}
      className='flex cursor-pointer gap-2 border border-transparent px-2 py-1 hover:border-white'
    >
      <div className='h-12 w-12 overflow-hidden rounded-full'>
        <img
          src={imageURL || ''}
          onError={handleImageError}
          alt={`${token.symbol} image`}
          className='h-full w-full object-cover'
        />
      </div>
      <div className='flex flex-col'>
        <span>
          {printBigintIsh(toSDKToken(token), amount)} {token.symbol}
        </span>
        <span className='text-sm opacity-60'>
          ≈ {(price * roundTokenAmount(toSDKToken(token), amount)).toFixed(2)}{' '}
          MAS
        </span>
      </div>
    </Link>
  );
};
