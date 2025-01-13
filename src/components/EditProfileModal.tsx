import { trpc } from 'utils/trpc';
import Modal from './Modal';
import { useContext, useEffect, useRef, useState } from 'react';
import { AccountWrapperContext } from 'context/Account';
import Button from './Button';
import { decodeError, printAddress } from 'utils/methods';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faPen, faX } from '@fortawesome/free-solid-svg-icons';
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import { defaultProfileURI } from 'utils/config';
import useAuth from 'hooks/useAuth';
import useClipboard from 'hooks/useClipboard';
import { UserWrapperContext } from 'context/User';

interface EditProfileModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditProfileModal = ({
  showModal,
  setShowModal
}: EditProfileModalProps) => {
  const [username, setUsername] = useState<string | undefined>('');
  const [bio, setBio] = useState('');
  const [profileImageURI, setProfileImageURI] = useState('');
  const [lastUsername, setLastUsername] = useState('');
  const [lastBio, setLastBio] = useState('');
  const [lastProfileImageURI, setLastProfileImageURI] = useState('');
  const [isImageValid, setIsImageValid] = useState(true);
  const [pendingLoadImage, setPendingLoadImage] = useState(false);
  const [pendingUpdateUser, setPendingUpdateUser] = useState(false);
  const uriRef = useRef<HTMLTextAreaElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  const { connectedAddress } = useContext(AccountWrapperContext);
  const { handleSign, isLoggedIn } = useAuth();
  const { user, refetchUser, isLoadingGetuser, errorGetUser } =
    useContext(UserWrapperContext);
  const { copy, copied } = useClipboard(connectedAddress);

  const { mutate: setUser, isLoading } = trpc.setUser.useMutation({
    onSuccess: async () => {
      await refetchUser();
      refetchUser().then(() => setPendingUpdateUser(false)); // have to call it twice to update the user (to be fixed)
      toast.dismiss();
      toast.success('Profile updated');
    },
    onError: (error) => {
      setPendingUpdateUser(false);
      toast.dismiss();
      toast.error(decodeError(error));
    }
  });

  const handleSetUser = async () => {
    if (!isLoggedIn) {
      await handleSign();
    }
    setUser({
      address: connectedAddress,
      username,
      profileImageURI: profileImageURI !== '' ? profileImageURI : undefined,
      bio: bio !== '' ? bio : undefined
    });
    setPendingUpdateUser(true);
    toast.loading('Updating profile...');
  };

  useEffect(() => {
    const textarea = uriRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [profileImageURI]);

  useEffect(() => {
    const textarea = bioRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [bio]);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setLastUsername(user.username || '');
      setProfileImageURI(user.profileImageURI || '');
      setLastProfileImageURI(user.profileImageURI || '');
      setBio(user.bio || '');
      setLastBio(user.bio || '');
    }
  }, [user]);

  const handleLoadImage = () => {
    setPendingLoadImage(false);
    setIsImageValid(true);
  };

  const handleErrorImage = () => {
    setPendingLoadImage(false);
    setIsImageValid(false);
  };

  if (isLoadingGetuser) return <Spinner />;
  if (errorGetUser) return <div>Failed to load user</div>;

  return (
    <>
      <Modal
        showModal={showModal}
        setShowModal={setShowModal}
        title='Edit profile'
      >
        <div className='flex w-full items-center rounded-lg bg-gray-800 p-4'>
          <div className='flex flex-col gap-1'>
            <div className='h-16 w-16'>
              <img
                src={
                  isImageValid && profileImageURI
                    ? profileImageURI
                    : profileImageURI
                      ? defaultProfileURI
                      : lastProfileImageURI || defaultProfileURI
                }
                alt='Profile picture'
                className='h-full w-full rounded-full object-cover'
              />
              <img
                src={profileImageURI}
                onLoad={handleLoadImage}
                onError={handleErrorImage}
                alt='Default profile picture'
                className='absolute hidden'
              />
            </div>
            <span className='text-center'>
              {printAddress(connectedAddress)}
            </span>
          </div>

          <div className='ml-4 w-full'>
            <div className='flex w-full items-center gap-2'>
              <div className='relative flex w-full'>
                <input
                  className='w-full rounded-md bg-gray-700 px-2 text-lg text-white outline-none'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Username'
                  disabled={isLoading}
                />
                {username !== lastUsername && (
                  <FontAwesomeIcon
                    icon={faX}
                    className='absolute right-0 top-2 mr-2 cursor-pointer text-xs opacity-70'
                    onClick={() => setUsername(lastUsername)}
                  />
                )}
              </div>
              <FontAwesomeIcon icon={faPen} className='text-xs text-gray-300' />
            </div>
            <div className='mt-1 text-xs text-red-500 opacity-75'>
              {username && !/^[A-Za-z0-9_]+$/.test(username) && (
                <>Allowed: A-Z, a-z, 0-9, _</>
              )}
              &nbsp;
            </div>
          </div>
        </div>
        <div>
          <h2>Address</h2>
          <div
            className='text-ms max-h-[200px] w-full max-w-96 cursor-pointer resize-none break-words rounded-md bg-gray-700 px-2 text-white opacity-50 outline-none'
            onClick={copy}
          >
            {connectedAddress}
            <FontAwesomeIcon
              icon={copied ? faCheck : faCopy}
              className='ml-1'
            />
          </div>
        </div>
        <div>
          <h2>Profile picture</h2>
          <textarea
            ref={uriRef}
            className='max-h-[200px] w-full resize-none rounded-md bg-gray-700 px-2 text-lg text-white outline-none'
            value={profileImageURI}
            onChange={(e) => {
              setPendingLoadImage(true);
              setProfileImageURI(e.target.value);
            }}
            placeholder='Profile picture URI'
            disabled={isLoading}
          />
        </div>
        <div>
          <h2>Bio</h2>
          <textarea
            ref={bioRef}
            className='w-full resize-none rounded-md bg-gray-700 px-2 text-lg text-white outline-none'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder='Bio'
            disabled={isLoading}
          />
        </div>
        <Button
          text='Save profile'
          variant='contained'
          disabled={
            (username === lastUsername &&
              profileImageURI === lastProfileImageURI &&
              bio === lastBio) ||
            pendingUpdateUser ||
            (!isImageValid && profileImageURI !== '') ||
            pendingLoadImage
          }
          disabledText={
            (username &&
              username.length > 10 &&
              'Max lenght for username is 10') ||
            (bio.length > 100 && 'Max lenght for bio is 100') ||
            (profileImageURI && !isImageValid && 'Invalid profile picture') ||
            undefined
          }
          onClick={handleSetUser}
        />
      </Modal>
    </>
  );
};

export default EditProfileModal;
