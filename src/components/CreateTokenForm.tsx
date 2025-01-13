import { EventDecoder, parseUnits } from '@dusalabs/sdk';
import Button from 'components/Button';
import { AccountWrapperContext } from 'context/Account';
import { useSendTransaction } from 'hooks/useSendTransaction';
import { useContext, useEffect, useState } from 'react';
import { buildDeployTx } from 'utils/transactionBuilder';
import { trpc } from 'utils/trpc';
import Modal from './Modal';
import TokenLink from './TokenLink';
import Spinner from './Spinner';
import { Link } from 'react-router-dom';
import {
  getAmountOut,
  getRoute,
  isAddressValid,
  printBigintIsh
} from 'utils/methods';
import { routeNames } from 'routes';
import ConnectButton from './ConnectButton';
import { MASSA, WMAS } from 'utils/tokens';
import ImageInput from './ImageInput';
import { CreateTokenWrapperContext } from 'context/CreateToken';
import FormInput from './FormInput';
import TokenInput from './TokenInput';
import { Token } from 'utils/types';
import { CHAIN_ID } from 'utils/config';
import {
  initialTokenLiquidityInCurve,
  massaVirtualLiquidity,
  tokenTotalSupply,
  tokenVirtualLiquidity
} from 'utils/constants';
import Warning from './Warning';
import clsx from 'clsx/lite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const CreateTokenForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalCreateCoin, setShowModalCreateCoin] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [amount, setAmount] = useState<string>();
  const [displayMore, setDisplayMore] = useState(false);
  const { connectedAddress, balance, fetchMasBalances } = useContext(
    AccountWrapperContext
  );

  const {
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
    pendingLoadImage
  } = useContext(CreateTokenWrapperContext);

  const masBalance = parseUnits(balance?.toString() || '', 9);

  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };
  const closeModalCreateCoin = () => {
    setShowModalCreateCoin(false);
    document.body.style.overflow = 'auto';
  };

  const resetForm = () => {
    setName('');
    setSymbol('');
    setDescription('');
    setImage('');
    setTelegram('');
    setTwitter('');
    setWebsite('');
  };

  const amountToBuy = parseUnits(amount || '', 9);
  const amountOut = getAmountOut(
    amountToBuy,
    massaVirtualLiquidity,
    tokenTotalSupply + tokenVirtualLiquidity
  );

  const { submitTx, txHash, pending, txEvents } = useSendTransaction({
    data: buildDeployTx(name, symbol, amountToBuy),
    onTxConfirmed() {
      resetForm();
      setShowModal(true);
      fetchMasBalances();
      const t0 = getTokenAddresses();
      setTokenAddress(t0?.filter((t) => t !== WMAS.address)[0]);
    }
  });

  const handleSubmitTx = () => {
    if (!connectedAddress) return;
    submitTx();
    setTokenAddress(undefined);
    setAmount(undefined);
    closeModalCreateCoin();
  };

  const getTokenAddresses = (): [string, string] | undefined => {
    const event = txEvents?.find((e) => e.startsWith('NEW_PAIR'));
    if (!event) return undefined;

    const [token0, token1] = EventDecoder.extractParams(event);
    return [token0, token1];
  };

  const { data: getTokenCreated, refetch: refetchToken } =
    trpc.getToken.useQuery(
      { address: tokenAddress || '' },
      { enabled: !!tokenAddress }
    );

  const trpcOpts = { enabled: !!connectedAddress && !!txHash };

  trpc.createToken.useQuery(
    {
      createdBy: connectedAddress,
      address: txHash || '',
      name,
      symbol,
      imageURI: image || '',
      telegram,
      twitter,
      website,
      description
    },
    trpcOpts
  );

  useEffect(() => {
    if (!tokenAddress) return;
    const interval = setInterval(() => {
      if (isAddressValid(getTokenCreated?.address || '')) {
        return;
      }
      refetchToken();
    }, 2000);

    return () => clearInterval(interval);
  }, [tokenAddress, getTokenCreated]);

  const isFormValid =
    !name ||
    !symbol ||
    !description ||
    !image ||
    isImageValid !== true ||
    pendingLoadImage;

  return (
    <>
      <div className='flex flex-col gap-3 border border-transparent p-2 hover:border-white'>
        <FormInput
          label='Name'
          type='text'
          id='name'
          placeholder='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          minLength={3}
          maxLength={100}
          required
        />
        <FormInput
          label='Symbol'
          type='text'
          id='symbol'
          placeholder='symbol'
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          disabled={pending}
          minLength={3}
          maxLength={6}
          required
        />
        <FormInput
          label='description'
          type='text'
          id='description'
          placeholder='description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={pending}
          maxLength={300}
          required
        />
        <ImageInput pending={pending} />
        <div className='flex w-full cursor-pointer flex-col gap-3 rounded-lg border border-gray-700 bg-gray-800 px-2 py-2 text-white hover:border-gray-500'>
          <div
            onClick={() => setDisplayMore(!displayMore)}
            className='flex items-center gap-2'
          >
            <span>More</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={clsx(
                'h-3 w-3 transform transition-transform duration-200',
                displayMore ? 'rotate-180' : 'rotate-0'
              )}
            />
          </div>
          <div
            className={clsx('flex-col gap-3', displayMore ? 'flex' : 'hidden')}
          >
            <FormInput
              label='Telegram'
              type='text'
              id='telegram'
              placeholder='telegram'
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              disabled={pending}
              maxLength={100}
            />
            <FormInput
              label='Twitter'
              type='text'
              id='twitter'
              placeholder='twitter'
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              disabled={pending}
              maxLength={100}
            />
            <FormInput
              label='Website'
              type='text'
              id='website'
              placeholder='website'
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={pending}
              maxLength={100}
            />
          </div>
        </div>
        {connectedAddress ? (
          <Button
            text='Create coin'
            variant='contained'
            disabled={isFormValid}
            pending={pending}
            onClick={() => setShowModalCreateCoin(true)}
          />
        ) : (
          <ConnectButton />
        )}
        <span className='text-sm text-red-500 opacity-75'>*Required</span>
      </div>
      {showModalCreateCoin && (
        <Modal
          title={`Buy coins on token creation (optional)`}
          showModal={showModalCreateCoin}
          setShowModal={setShowModalCreateCoin}
        >
          <div className='flex w-screen max-w-[500px] flex-col gap-2'>
            <TokenInput
              token={MASSA}
              quantity={amount}
              setQuantity={setAmount}
              balance={masBalance}
            />
            <div className='flex items-center gap-1'>
              <span>You'll receive:</span>
              <span>
                {printBigintIsh(
                  new Token(CHAIN_ID, '', 18, '', '', ''),
                  amountOut
                )}
              </span>
              <img
                src={image}
                alt='token'
                className='inline h-4 w-4 rounded-full'
              />
              <span>{symbol}</span>
            </div>
            <Warning
              text='Buying a small amount of coins can help protect your coin from
                bots.'
            />
            {amountOut > 80_000_000n * BigInt(10 ** 18) && (
              <Warning
                text='Buying a large amount of coins is not recommended, it can make
              your coin less attractive to users.'
              />
            )}
            <Button
              text='Create coin'
              variant='contained'
              disabledText={
                (masBalance < amountToBuy && 'Insufficient balance') ||
                (amountOut > initialTokenLiquidityInCurve &&
                  'Amount too high') ||
                undefined
              }
              onClick={handleSubmitTx}
            ></Button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal
          title='New token created'
          showModal={showModal}
          setShowModal={setShowModal}
        >
          {isAddressValid(getTokenCreated?.address || '') ? (
            <div onClick={closeModal}>
              {getTokenCreated && (
                <TokenLink
                  token={{
                    ...getTokenCreated,
                    latest_swap_after_price:
                      getTokenCreated.pools[0].swapTxs[0]?.afterPrice,
                    latest_swap_reserve0:
                      getTokenCreated.pools[0].swapTxs[0]?.afterReserve0
                  }}
                />
              )}
            </div>
          ) : (
            <div className='flex max-w-[550px] flex-col gap-2'>
              <div className='flex justify-center'>
                <Spinner />
              </div>
              This process may take up to 30 secondes. You can close this modal.
              Your token will be available in the list once it's created. Also,
              you can check it in your profile page.
              <Link
                to={getRoute(routeNames.profile, connectedAddress)}
                className='w-full'
              >
                <Button
                  text='Profile page'
                  variant='text'
                  onClick={() => setShowModal(false)}
                ></Button>
              </Link>
            </div>
          )}
        </Modal>
      )}
    </>
  );
};

export default CreateTokenForm;
