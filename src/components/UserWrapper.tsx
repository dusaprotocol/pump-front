import { AccountWrapperContext } from 'context/Account';
import { UserWrapperContext } from 'context/User';
import { ReactNode, useContext } from 'react';
import { trpc } from 'utils/trpc';

const UserWrapper = ({ children }: { children: ReactNode }) => {
  const { connectedAddress } = useContext(AccountWrapperContext);
  const {
    data: user,
    refetch,
    error,
    isLoading
  } = trpc.getUser.useQuery(
    { address: connectedAddress },
    { enabled: !!connectedAddress }
  );

  return (
    <UserWrapperContext.Provider
      value={{
        user,
        refetchUser: refetch,
        errorGetUser: error,
        isLoadingGetuser: isLoading
      }}
    >
      {children}
    </UserWrapperContext.Provider>
  );
};

export default UserWrapper;
