import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SwapFull, Token, trpc } from 'utils/trpc';
import LoggedModal from './LoggedModal';
import ConnectModal from './ConnectModal';
import { AccountWrapperContext } from 'context/Account';
import { printBigintIsh, printProfile, shake } from 'utils/methods';
import { WMAS } from 'utils/tokens';
import { routeNames } from 'routes';
import { UserWrapperContext } from 'context/User';
import SmallPicture from './SmallPicture';

const Header = () => {
  const [lastSwap, setLastSwap] = useState<SwapFull>();
  const [lastTokenCreated, setLastTokenCreated] = useState<Token>();
  const lastSwapRef = useRef<HTMLDivElement>(null);
  const lastCreateRef = useRef<HTMLDivElement>(null);
  const lastSwapSmallRef = useRef<HTMLDivElement>(null);
  const tokenOut = lastSwap?.pool.token;

  const { connected, connectedAddress, showModal, setShowModal } = useContext(
    AccountWrapperContext
  );

  const { data: _lastSwap } = trpc.getLastSwap.useQuery();
  const { data: _lastCreate } = trpc.getLastCreate.useQuery();
  const { user } = useContext(UserWrapperContext);

  trpc.onAddSwap.useSubscription(undefined, {
    onData: (data) => {
      setLastSwap(data);
      shake(lastSwapRef);
      shake(lastSwapSmallRef);
    },
    onStarted: () => {
      console.log('started');
    },
    onError: (error) => {
      console.log(error);
    }
  });

  trpc.onAddToken.useSubscription(undefined, {
    onData: (data) => {
      setLastTokenCreated(data);
      shake(lastCreateRef);
    },
    onStarted: () => {
      console.log('started');
    },
    onError: (error) => {
      console.log(error);
    }
  });

  useEffect(() => {
    if (!_lastSwap) return;
    setLastSwap(_lastSwap);
  }, [_lastSwap]);

  useEffect(() => {
    if (!_lastCreate) return;
    setLastTokenCreated(_lastCreate);
  }, [_lastCreate]);

  return (
    <>
      <header className='flex flex-col items-center justify-between px-4 py-2 sm:px-10 lg:flex-row'>
        <div className='flex w-full items-center justify-between gap-x-2'>
          <div>
            <Link
              to='/'
              className='animate-colorSwitch whitespace-nowrap text-xl font-bold'
            >
              Duser Pump
            </Link>
          </div>

          <div className='hidden flex-col gap-x-6 lg:flex lg:flex-row'>
            {lastSwap && tokenOut && (
              <div
                className='flex items-center justify-center gap-1 rounded-md bg-green-400 px-2 text-black'
                ref={lastSwapRef}
              >
                <SmallPicture imgURI={lastSwap.user.profileImageURI} />
                <Link
                  className='hover:underline'
                  to={routeNames.profile.split(':')[0] + lastSwap.userAddress}
                >
                  {printProfile(lastSwap.userAddress, lastSwap.user.username)}
                </Link>{' '}
                {!lastSwap.swapForY ? 'bought ' : 'sold '}
                {printBigintIsh(
                  WMAS,
                  !lastSwap.swapForY ? lastSwap.amountIn : lastSwap.amountOut
                )}{' '}
                MAS of{' '}
                <Link
                  className='flex items-center gap-1 hover:underline'
                  to={routeNames.trade.split(':')[0] + tokenOut.address}
                >
                  <span>{tokenOut.symbol}</span>{' '}
                  <SmallPicture imgURI={tokenOut.imageURI} isToken />
                </Link>
              </div>
            )}
            {lastTokenCreated && (
              <div
                className='flex items-center justify-center gap-1 rounded-md bg-orange-400 px-2 text-black'
                ref={lastCreateRef}
              >
                <SmallPicture imgURI={lastTokenCreated.dev.profileImageURI} />
                <Link
                  className='hover:underline'
                  to={
                    routeNames.profile.split(':')[0] +
                    lastTokenCreated.createdBy
                  }
                >
                  {printProfile(
                    lastTokenCreated.createdBy,
                    lastTokenCreated.dev.username
                  )}
                </Link>{' '}
                created{' '}
                <Link
                  className='flex items-center gap-1 hover:underline'
                  to={routeNames.trade.split(':')[0] + lastTokenCreated.address}
                >
                  <span>{lastTokenCreated.symbol}</span>
                  <SmallPicture imgURI={lastTokenCreated.imageURI} isToken />
                </Link>
                on{' '}
                {new Intl.DateTimeFormat('en-US', {
                  dateStyle: 'short'
                }).format(new Date(lastTokenCreated.createdAt))}
              </div>
            )}
          </div>
          <button onClick={() => setShowModal(true)} className='text-lg'>
            {connected ? (
              <div className='flex items-center gap-1'>
                <SmallPicture imgURI={user?.profileImageURI} />
                <span>{printProfile(connectedAddress, user?.username)}</span>
              </div>
            ) : (
              'Connect'
            )}
          </button>
        </div>
        <div className='flex lg:hidden'>
          {lastSwap && tokenOut && (
            <div
              className='flex items-center justify-center gap-1 rounded-md bg-green-400 px-2 text-black'
              ref={lastSwapSmallRef}
            >
              <SmallPicture imgURI={lastSwap.user.profileImageURI} />
              <Link
                className='hover:underline'
                to={routeNames.profile.split(':')[0] + lastSwap.userAddress}
              >
                {printProfile(lastSwap.userAddress, lastSwap.user.username)}
              </Link>{' '}
              {!lastSwap.swapForY ? 'bought ' : 'sold '}
              {printBigintIsh(
                WMAS,
                !lastSwap.swapForY ? lastSwap.amountIn : lastSwap.amountOut
              )}{' '}
              MAS of{' '}
              <Link
                className='flex items-center gap-1 hover:underline'
                to={routeNames.trade.split(':')[0] + tokenOut.address}
              >
                <span>{tokenOut.symbol}</span>{' '}
                <SmallPicture imgURI={tokenOut.imageURI} isToken />
              </Link>
            </div>
          )}
        </div>
      </header>
      {showModal && (connected ? <LoggedModal /> : <ConnectModal />)}
    </>
  );
};

export default Header;
