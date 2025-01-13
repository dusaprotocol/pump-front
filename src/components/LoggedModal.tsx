import { useContext, useEffect, useState } from 'react';
import {
  faArrowRightFromBracket,
  faCheck,
  faCopy
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import Modal from 'components/Modal';
import { AccountWrapperContext } from 'context/Account';
import useClipboard from 'hooks/useClipboard';
import { routeNames } from 'routes';
import { getRoute } from 'utils/methods';
import Button from './Button';
import EditProfileModal from './EditProfileModal';
import { defaultProfileURI } from 'utils/config';
import { UserWrapperContext } from 'context/User';
import FaucetModal from './FaucetModal';
import Dropdown from './Dropdown';

const LoggedModal = () => {
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showFaucetModal, setShowFaucetModal] = useState(false);

  const { user } = useContext(UserWrapperContext);
  const {
    connectedAddress,
    accounts,
    balance,
    showModal,
    selectedProvider,
    setShowModal,
    initClientWallet,
    disconnect
  } = useContext(AccountWrapperContext);
  const { copied, copy } = useClipboard(connectedAddress);

  const [address, setAddress] = useState<string>();

  useEffect(() => {
    if (!connectedAddress) return;
    setAddress(connectedAddress);
  }, [connectedAddress]);

  useEffect(() => {
    if (!address) return;
    const acc = accounts?.find((account) => account.address() === address);
    if (!acc || !selectedProvider) return;
    initClientWallet(selectedProvider, acc);
  }, [address]);

  const accountsAddresses = accounts?.map((account) => account.address()) || [];
  const closeModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title='Profile Modal'
      >
        <div className=''>
          <div className='flex flex-col items-center gap-2'>
            <img
              src={user?.profileImageURI || defaultProfileURI}
              alt='user image'
              className='h-16 w-16 rounded-full object-cover'
            />
            <div className='flex flex-col items-center gap-1'>
              <Dropdown
                item={connectedAddress}
                items={accountsAddresses}
                onClick={setAddress}
                variant='address'
                className='min-w-32'
              />
              {user?.username && (
                <span className='opacity-90'>@{user.username}</span>
              )}
              <span className='text-sm text-gray-300'>
                {balance.toFixed(2)} MAS
              </span>
            </div>
            <div className='flex w-full flex-wrap sm:flex-nowrap'>
              <Link
                to={getRoute(routeNames.profile, connectedAddress)}
                className='w-full'
              >
                <Button
                  text='Profile page'
                  variant='text'
                  onClick={closeModal}
                ></Button>
              </Link>
              <Button
                onClick={() => setShowEditProfileModal(true)}
                text='Edit profile'
                variant='text'
              />
              <Button
                text='Faucet 👛'
                variant='text'
                onClick={() => setShowFaucetModal(true)}
              />
            </div>
            {showEditProfileModal && (
              <EditProfileModal
                showModal={showEditProfileModal}
                setShowModal={setShowEditProfileModal}
              />
            )}

            <div className='flex w-full flex-wrap gap-2'>
              <Button text='' variant='outlined' onClick={copy}>
                <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                <span> {copied ? ' Copied' : ' Copy Address'}</span>
              </Button>
              <Button text='' variant='outlined' onClick={disconnect}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                <span> Disconnect</span>
              </Button>
            </div>

            {/* {renderTxs()} */}
          </div>
        </div>
      </Modal>
      {showFaucetModal && (
        <FaucetModal
          showModal={showFaucetModal}
          setShowModal={setShowFaucetModal}
        />
      )}
    </>
  );
};

export default LoggedModal;
