import { AccountWrapperContext } from 'context/Account';
import { TokenAmount } from '@dusalabs/sdk';
import { useContext, useEffect, useState } from 'react';
import { printBigintIsh, tokenAmountToSignificant } from 'utils/methods';
import { Token } from 'utils/types';
import clsx from 'clsx/lite';
import { unknownURI } from 'utils/constants';

interface TokenInputProps {
  token: Token;
  quantity: string | undefined;
  setQuantity: React.Dispatch<React.SetStateAction<string | undefined>>;
  balance: bigint;
  className?: string;
}

const TokenInput = ({
  token,
  quantity,
  setQuantity,
  balance,
  className
}: TokenInputProps) => {
  const [isImageValid, setIsImageValid] = useState(true);
  const { connectedAddress } = useContext(AccountWrapperContext);
  const balanceFormatted = printBigintIsh(token, balance);

  useEffect(() => {
    setIsImageValid(true);
  }, [token]);

  const handleImageError = () => {
    setIsImageValid(false);
  };

  return (
    <div
      className={clsx(
        'relative flex w-full flex-col items-center rounded-lg border border-gray-700 bg-gray-800 p-2 hover:border-gray-500',
        className
      )}
    >
      <div className='flex w-full'>
        <input
          type='number'
          value={quantity}
          placeholder='0.0'
          className='flex-grow bg-transparent px-2 text-gray-100 outline-none'
          onChange={(e) => setQuantity(e.target.value)}
          min='0'
        />
        <div className='absolute right-2 ml-2 flex justify-end bg-gray-800'>
          <img
            src={isImageValid ? token.logoURI : unknownURI}
            onError={handleImageError}
            alt={'logo of ' + token.name}
            className='h-6 w-6 rounded-full'
          />
          <span className='ml-1 text-gray-100'>{token.symbol}</span>
        </div>
      </div>
      <div className='flex w-full flex-col items-end'>
        {connectedAddress && (
          <div
            className='translate-x-1 cursor-pointer px-1 text-xs hover:bg-green-400 hover:text-black'
            onClick={() =>
              setQuantity(
                tokenAmountToSignificant(new TokenAmount(token, balance))
              )
            }
          >
            <span className='opacity-75'>Balance: </span>
            <span className='font-bold'>{balanceFormatted}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenInput;
