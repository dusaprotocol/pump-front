import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import UserTag from './UserTag';
import SmallPicture from './SmallPicture';
import { User } from 'utils/trpc';
import { Link } from 'react-router-dom';
import { routeNames } from 'routes';
import { useState } from 'react';
dayjs.extend(relativeTime);

interface MessageProps {
  user: User;
  message: string;
  date: Date | string;
  img?: string | null;
  tokenAddress?: string;
}

const Message = ({ user, message, date, img, tokenAddress }: MessageProps) => {
  const [isImageValid, setIsImageValid] = useState(true);

  const handleImageLoad = () => {
    setIsImageValid(true);
  };
  const handleImageError = () => {
    setIsImageValid(false);
  };

  return (
    <div className='flex items-start rounded-lg bg-gray-900 p-1 shadow-md'>
      {img && isImageValid === true && (
        <img
          src={img}
          alt='Profile Picture'
          onLoad={handleImageLoad}
          onError={handleImageError}
          className='mr-4 h-fit w-24 rounded-md'
        />
      )}
      <div className='w-full'>
        <div className='mb-2 flex items-center gap-1'>
          <SmallPicture imgURI={user.profileImageURI} />
          <UserTag user={user} />
          <span className='text-xs text-gray-400'>
            {dayjs(date).format('M/D/YYYY, h:mm:ss A')}
          </span>
          {tokenAddress ? (
            <Link
              to={routeNames.trade.split(':')[0] + tokenAddress}
              className='whitespace-nowrap rounded px-2 py-1 text-xs font-medium text-green-200 hover:underline'
            >
              view thread
            </Link>
          ) : null}
        </div>
        <div className='rounded bg-gray-800 px-2 py-1'>
          <p className='text-white'>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
