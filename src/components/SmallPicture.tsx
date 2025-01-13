import { useState } from 'react';
import { defaultProfileURI } from 'utils/config';
import { unknownURI } from 'utils/constants';

const SmallPicture = ({
  imgURI,
  isToken = false
}: {
  imgURI: string | null | undefined;
  isToken?: boolean;
}) => {
  const [isImageValid, setIsImageValid] = useState(true);
  const handleImageError = () => {
    setIsImageValid(false);
  };
  return (
    <img
      src={
        isImageValid
          ? imgURI || (isToken ? unknownURI : defaultProfileURI)
          : isToken
            ? unknownURI
            : defaultProfileURI
      }
      onError={handleImageError}
      alt='Profile Picture'
      className='h-4 w-4 rounded-full object-cover'
    />
  );
};

export default SmallPicture;
