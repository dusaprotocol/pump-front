import CreateTokenForm from 'components/CreateTokenForm';
import TokenItem from 'components/TokenItem';
import { CreateTokenWrapperContext } from 'context/CreateToken';
import { useState } from 'react';

const Create = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState<string>();
  const [image, setImage] = useState<string>();
  const [telegram, setTelegram] = useState<string>();
  const [twitter, setTwitter] = useState<string>();
  const [website, setWebsite] = useState<string>();
  const [isImageValid, setIsImageValid] = useState<boolean | null>(null);
  const [pendingLoadImage, setPendingLoadImage] = useState(false);

  return (
    <div className='flex w-full flex-grow flex-col items-center'>
      <div className='flex w-full flex-grow flex-col justify-center'>
        <div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-2'>
          <CreateTokenWrapperContext.Provider
            value={{
              name,
              symbol,
              description,
              image,
              telegram,
              twitter,
              website,
              setName,
              setSymbol,
              setDescription,
              setImage,
              setTelegram,
              setTwitter,
              setWebsite,
              isImageValid,
              setIsImageValid,
              pendingLoadImage,
              setPendingLoadImage
            }}
          >
            <div className='order-2 md:order-1'>
              <CreateTokenForm />
            </div>
            <div className='order-1 md:order-2'>
              {(name || symbol || description || image) && <TokenItem />}
            </div>
          </CreateTokenWrapperContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default Create;
