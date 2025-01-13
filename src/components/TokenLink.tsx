import { forwardRef, useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routeNames } from 'routes';
import {
  getRoute,
  printProfile,
  printUSD,
  toFraction,
  toSDKToken
} from 'utils/methods';
import SmallPicture from './SmallPicture';
import { tokenTotalSupply, tokenVirtualLiquidity } from 'utils/constants';
import { TokenAmount } from '@dusalabs/sdk';
import { AccountWrapperContext } from 'context/Account';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import jellyfish_transp from '../assets/jellyfish_transp.png';
import Tooltip from './Tooltip';
import { getTokenValueOnDusa } from 'utils/datastoreFetcher';
import { TokenFull } from 'utils/trpc';

dayjs.extend(relativeTime);

interface TokenLinkProps {
  token: TokenFull;
}

const TokenLink = forwardRef<HTMLDivElement, TokenLinkProps>(
  ({ token }, ref) => {
    const [isImageValid, setIsImageValid] = useState(true);
    const [tokenValueOnDusa, setTokenValueOnDusa] = useState<number>(0);
    const navigate = useNavigate();
    const { masValue } = useContext(AccountWrapperContext);
    const latest_swap_reserve0 = token?.latest_swap_reserve0;
    const dusaPoolAddress = token.dusaPoolAddress;

    useEffect(() => {
      if (!token.address || !token.decimals) return;
      getTokenValueOnDusa(token.address, token.decimals).then(
        setTokenValueOnDusa
      );
    }, [token.address, token.decimals]);

    const marketCap =
      latest_swap_reserve0 &&
      new TokenAmount(
        toSDKToken(token),
        dusaPoolAddress
          ? tokenTotalSupply
          : tokenTotalSupply -
            BigInt(latest_swap_reserve0) +
            tokenVirtualLiquidity
      )
        .multiply(
          toFraction(
            dusaPoolAddress
              ? tokenValueOnDusa
              : token?.latest_swap_after_price || 0
          )
        )
        .multiply(toFraction(dusaPoolAddress ? 1 : masValue || 0));

    const handleImageError = () => {
      setIsImageValid(false);
    };

    return (
      <div
        className='cursor-pointer rounded-lg border border-transparent bg-gray-800 hover:border-white'
        onClick={() => navigate(getRoute(routeNames.trade, token.address))}
        ref={ref}
      >
        <div className={'flex h-fit max-h-[275px] w-full gap-2 p-2'}>
          {isImageValid && (
            <img
              className='mr-4 h-fit w-24 rounded-md sm:w-32'
              src={token.imageURI || ''}
              onError={handleImageError}
              alt='avatar'
            />
          )}
          <div className='flex flex-col gap-1'>
            <div className='flex flex-wrap items-center gap-x-3 text-xs text-blue-200'>
              <span className='whitespace-nowrap font-bold text-green-400'>
                Created by
              </span>
              <Link
                to={getRoute(routeNames.profile, token.createdBy)}
                className='flex gap-1 hover:underline'
                onClick={(e) => e.stopPropagation()}
              >
                <SmallPicture imgURI={token.dev.profileImageURI} />
                <span>{printProfile(token.createdBy, token.dev.username)}</span>
              </Link>
              <span>{dayjs(token.createdAt).fromNow()}</span>
            </div>
            <div className='flex flex-wrap items-center gap-x-3 whitespace-nowrap'>
              <div className='flex gap-2 text-xs text-green-300'>
                market cap: $
                {marketCap && BigInt(latest_swap_reserve0) !== 0n
                  ? printUSD(Number(marketCap.toSignificant(6)), false)
                  : 0}
              </div>
              {token.completed && (
                <div className='flex flex-row items-center text-xs text-green-600'>
                  <span>[badge:</span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Tooltip
                      trigger={
                        <img
                          src={jellyfish_transp}
                          alt='dusa badge'
                          className='h-5 w-5'
                        />
                      }
                      position='bottom'
                    >
                      Dusa Badge
                    </Tooltip>
                  </div>
                  <span>]</span>
                </div>
              )}
            </div>
            <div className='text-xs text-gray-400'>
              replies: {token.comments.length || 0}
            </div>
            <div className='w-full overflow-y-auto break-words break-all text-sm'>
              <div className='font-bold'>
                {token.name} ({token.symbol})
              </div>
              <div>{token.description}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default TokenLink;
