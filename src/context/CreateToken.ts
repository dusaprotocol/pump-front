import { createContext } from 'react';

interface CreateTokenWrapperContextType {
  name: string;
  symbol: string;
  description: string | undefined;
  image: string | undefined;
  telegram: string | undefined;
  twitter: string | undefined;
  website: string | undefined;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
  setDescription: React.Dispatch<React.SetStateAction<string | undefined>>;
  setImage: React.Dispatch<React.SetStateAction<string | undefined>>;
  setTelegram: React.Dispatch<React.SetStateAction<string | undefined>>;
  setTwitter: React.Dispatch<React.SetStateAction<string | undefined>>;
  setWebsite: React.Dispatch<React.SetStateAction<string | undefined>>;
  isImageValid: boolean | null;
  setIsImageValid: React.Dispatch<React.SetStateAction<boolean | null>>;
  pendingLoadImage: boolean;
  setPendingLoadImage: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreateTokenWrapperContext =
  createContext<CreateTokenWrapperContextType>(
    {} as CreateTokenWrapperContextType
  );
