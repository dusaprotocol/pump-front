import { CreateTokenWrapperContext } from 'context/CreateToken';
import { useContext } from 'react';
import FormInput from './FormInput';

interface ImageInputProps {
  pending: boolean;
}

const ImageInput = ({ pending }: ImageInputProps) => {
  const { setImage, isImageValid, setIsImageValid, setPendingLoadImage } =
    useContext(CreateTokenWrapperContext);

  const handleChange = (value: string) => {
    setImage(value);
    if (value === '') setIsImageValid(null);
    setPendingLoadImage(true);
  };

  return (
    <>
      <FormInput
        label='Image'
        type='url'
        id='image'
        placeholder='image URI'
        onChange={(e) => handleChange(e.target.value)}
        disabled={pending}
        required
      />
      {isImageValid === false && (
        <p className='mt-1 text-sm text-red-500'>Invalid image URL</p>
      )}
    </>
  );
};

export default ImageInput;
