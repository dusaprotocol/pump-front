import { createContext } from 'react';
import { ProviderService } from 'hooks/useWalletProvider';

export interface AccountWrapperContextType extends ProviderService {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  closeModal: () => void;
  masValue: number | undefined;
}

export const AccountWrapperContext = createContext<AccountWrapperContextType>(
  {} as AccountWrapperContextType
);
