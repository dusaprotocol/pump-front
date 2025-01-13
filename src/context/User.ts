import { createContext } from 'react';
import { User } from 'utils/trpc';

interface UserWrapperContextType {
  user: User;
  refetchUser: any;
  errorGetUser: any;
  isLoadingGetuser: any;
}

export const UserWrapperContext = createContext<UserWrapperContextType>(
  {} as UserWrapperContextType
);
