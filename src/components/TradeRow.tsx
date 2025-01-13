import { buildExplorerLink, printAddress, printBigintIsh } from 'utils/methods';
import { MASSA } from 'utils/tokens';
import { Token } from 'utils/types';
import UserTag from './UserTag';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SmallPicture from './SmallPicture';
import { Swap, User } from 'utils/trpc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx/lite';

dayjs.extend(relativeTime);

interface TradeRowProps {
  user: User;
  swap: Swap;
  token: Token;
  displayRelativeDate: boolean;
}

const TradeRow = ({
  user,
  swap,
  token,
  displayRelativeDate
}: TradeRowProps) => {
  const {
    txHash: id,
    amountIn,
    amountOut,
    timestamp: timeAgo,
    swapForY
  } = swap;

  const isBuy = swapForY === false;

  return (
    <div className='my-1 grid grid-cols-5 items-start rounded-lg bg-gray-800 text-xs sm:grid-cols-6 md:grid-cols-7'>
      <div className='col-span-2 hidden items-center gap-1 p-3 sm:flex'>
        <SmallPicture imgURI={user.profileImageURI} />
        <UserTag user={user as User} />
      </div>
      <div className='col-span-2 flex items-center overflow-x-auto p-3 sm:hidden'>
        <UserTag user={user as User} />
      </div>
      <div
        className={`${isBuy ? 'text-green-500' : 'text-red-500'} hidden p-3 text-right sm:block md:text-left`}
      >
        {isBuy ? 'buy' : 'sell'}
      </div>
      <div
        className={clsx(
          'p-3 text-right md:text-left',
          isBuy ? 'text-green-500 sm:text-white' : 'text-red-500 sm:text-white'
        )}
      >
        {printBigintIsh(MASSA, isBuy ? amountIn : amountOut)}
      </div>
      <div
        className={clsx(
          'p-3 text-right md:text-left',
          isBuy ? 'text-green-500 sm:text-white' : 'text-red-500 sm:text-white'
        )}
      >
        {printBigintIsh(token, isBuy ? amountOut : amountIn)}
      </div>
      <div className='hidden p-3 text-gray-400 md:block'>
        {displayRelativeDate
          ? dayjs(timeAgo).fromNow()
          : dayjs(timeAgo).format('MMM DD hh:mm:ss a')}
      </div>
      <a
        href={buildExplorerLink('operation', id)}
        target='_blank'
        rel='noreferrer noopener'
        className='p-3 text-right hover:underline'
      >
        <div className='hidden md:block'>{printAddress(id)}</div>
        <div className='block md:hidden'>
          <FontAwesomeIcon icon={faExternalLink} />
        </div>
      </a>
    </div>
  );
};

export default TradeRow;
