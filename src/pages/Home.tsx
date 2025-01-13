import Button from 'components/Button';
import IncludeNSFW from 'components/IncludeNSFW';
import KingOfTheHill from 'components/KingOfTheHill';
import Dropdown from 'components/Dropdown';
import Spinner from 'components/Spinner';
import TokenLink from 'components/TokenLink';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { routeNames } from 'routes';
import { getNSFW } from 'utils/localStorage';
import { shake } from 'utils/methods';
import { WMAS } from 'utils/tokens';
import { trpc } from 'utils/trpc';

type ListItem =
  | 'Sort by: Last swap'
  | 'Sort by: Creation time'
  | 'Sort by: Market cap';

const Home = () => {
  const [query, setQuery] = useState('');
  const [includeNSFW, setIncludeNSFW] = useState(getNSFW());
  const [sortItem, setSortItem] = useState<ListItem>('Sort by: Last swap');
  const sortItems: ListItem[] = [
    'Sort by: Last swap',
    'Sort by: Creation time',
    'Sort by: Market cap'
  ];
  const ref = useRef(null);

  const searchResults = trpc.searchToken.useQuery(
    { query },
    { enabled: !!query }
  );

  const utils = trpc.useUtils();
  utils.getTokens.invalidate(); // to optimize
  const {
    data: tokens,
    refetch,
    isLoading
  } = trpc.getTokens.useQuery(undefined, {
    cacheTime: 0,
    staleTime: 0,
    refetchOnMount: true
  });

  const validTokens =
    tokens && tokens.filter((t) => t.address && (includeNSFW || !t.nsfw));

  validTokens?.sort((a, b) => {
    if (sortItem === 'Sort by: Last swap') {
      return a.latest_swap_timestamp > b.latest_swap_timestamp ? -1 : 1;
    }
    if (sortItem === 'Sort by: Creation time') {
      return a.createdAt > b.createdAt ? -1 : 1;
    }
    if (sortItem === 'Sort by: Market cap') {
      return a.latest_swap_after_price > b.latest_swap_after_price ? -1 : 1;
    }
    return 0;
  });

  const kingToken =
    validTokens &&
    [...validTokens]
      .filter((t) => !t.completed)
      .sort((a, b) => {
        if (a.latest_swap_after_price === null) return 1;
        if (b.latest_swap_after_price === null) return -1;
        return a.latest_swap_after_price > b.latest_swap_after_price ? -1 : 1;
      })[0];

  const onData = async (data: any) => {
    console.log(data);
    await utils.getTokens.invalidate();
    refetch().then(() => shake(ref));
  };

  trpc.onAddSwap.useSubscription(undefined, {
    onData,
    onStarted: () => {
      console.log('started');
    },
    onError: (error) => {
      console.log(error);
    }
  });

  trpc.onAddToken.useSubscription(undefined, {
    onData,
    onStarted: () => {
      console.log('started');
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const handleSetNSFW = (value: boolean) => {
    setIncludeNSFW(value);
    setNSFW(value);
  };

  const renderSearchResults = () => {
    if (!searchResults.data) return null;
    if (searchResults.data.length === 0) return <span>No tokens found</span>;

    return (
      <div className='grid-col-1 grid gap-4 text-gray-400 md:grid-cols-2 lg:grid-cols-3'>
        {searchResults.data
          .filter((t) => t.address !== WMAS.address)
          .map((token, i) => (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <TokenLink token={token} key={i} />
          ))}
      </div>
    );
  };

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex flex-col-reverse items-center justify-center md:flex-row'>
        <Link to={routeNames.create}>
          <Button text='Start a new coin' variant='outlined' />
        </Link>
        {kingToken && <KingOfTheHill token={kingToken} />}
      </div>
      <div className='flex flex-col gap-2'>
        <div className='w-full md:max-w-96'>
          <input
            value={query}
            placeholder='Search for token'
            onChange={(e) => setQuery(e.target.value)}
            className='input w-full rounded-lg border border-gray-600 bg-gray-800 p-2 text-gray-400 focus:border-white focus:outline-none focus:ring-2 focus:ring-green-400'
          />
        </div>
        <div className='flex gap-4'>
          <Dropdown
            item={sortItem}
            items={sortItems}
            onClick={setSortItem as (item: string) => void}
            className='w-full max-w-64'
          />
          <IncludeNSFW
            includeNSFW={includeNSFW}
            setIncludeNSFW={handleSetNSFW}
          />
        </div>

        {query ? (
          renderSearchResults()
        ) : (
          <>
            {validTokens && validTokens.length > 0 ? (
              <div className='grid-col-1 grid gap-4 text-gray-400 md:grid-cols-2 lg:grid-cols-3'>
                <TokenLink token={validTokens[0]} ref={ref} />
                {validTokens.slice(1).map((token) => {
                  return (
                    <TokenLink
                      key={'Token link for ' + token.address}
                      token={token}
                    />
                  );
                })}
              </div>
            ) : (
              <>{isLoading ? <Spinner /> : <span>No token found</span>}</>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
