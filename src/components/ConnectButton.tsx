import { useContext } from 'react';
import Button, { ButtonProps } from 'components/Button';
import { AccountWrapperContext } from 'context/Account';

const ConnectButton = (props: Partial<ButtonProps>) => {
  const { setShowModal } = useContext(AccountWrapperContext);

  return (
    <>
      <Button
        {...props}
        onClick={() => setShowModal((prev) => !prev)}
        variant='contained'
        text='Connect Wallet'
      />
    </>
  );
};

export default ConnectButton;
