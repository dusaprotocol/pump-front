import { defaultProfileURI } from 'utils/config';
import { unknownURI } from 'utils/constants';

const TokenPicture = ({ imgURI }: { imgURI: string | null | undefined }) => {
  const handleImageError = () => {
    imgURI = unknownURI;
  };
  return (
    <img
      src={imgURI || defaultProfileURI}
      onError={handleImageError}
      alt='Profile Picture'
      className='h-4 w-4 rounded-full'
    />
  );
};

export default TokenPicture;
