import { ReactNode, useState } from 'react';

import useWalletProvider from 'hooks/useWalletProvider';
import { AccountWrapperContext } from 'context/Account';
import { trpc } from 'utils/trpc';
import { WMAS } from 'utils/tokens';

interface AccountWrapperProps {
  children: ReactNode;
}

const AccountWrapper = ({ children }: AccountWrapperProps) => {
  const [showModal, setShowModal] = useState(false);

  const { data: masValue } = trpc.getTokenValue.useQuery({
    tokenAddress: WMAS.address, // WMAS buildnet address
    tokenDecimals: 9
  });

  const providerService = useWalletProvider();

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <AccountWrapperContext.Provider
      value={{
        showModal,
        setShowModal,
        closeModal,
        masValue,
        ...providerService
      }}
    >
      {children}
    </AccountWrapperContext.Provider>
  );
};

export default AccountWrapper;
