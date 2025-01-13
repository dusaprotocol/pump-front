import clsx from 'clsx/lite';
import { CreateTokenWrapperContext } from 'context/CreateToken';
import { useContext } from 'react';

const TokenItem = () => {
  const {
    name,
    symbol,
    description,
    image,
    isImageValid,
    setIsImageValid,
    setPendingLoadImage
  } = useContext(CreateTokenWrapperContext);

  const handleImageLoad = () => {
    setPendingLoadImage(false);
    setIsImageValid(true);
  };
  const handleImageError = () => {
    setPendingLoadImage(false);
    setIsImageValid(false);
  };

  return (
    <div
      className={clsx(
        'flex h-fit max-h-[300px] w-full max-w-[500px] gap-2 overflow-hidden border border-transparent p-2 hover:border-white',
        !isImageValid && 'gap-0'
      )}
    >
      {image && (
        <img
          src={image}
          className={clsx('mr-4 h-fit w-32', !isImageValid && 'hidden')}
          onLoad={handleImageLoad}
          onError={handleImageError}
          alt={name}
        />
      )}
      <div className='ml-4 break-all'>
        {name && (
          <h2 className='mb-2 text-2xl font-bold'>
            {name !== '' ? name : 'name'}
          </h2>
        )}
        <div className='w-full break-words break-all text-sm'>
          <div className='font-bold'>
            {name && name} {symbol && <>({symbol})</>}
          </div>
          <div>{description && description}</div>
        </div>
      </div>
    </div>
  );
};

export default TokenItem;
