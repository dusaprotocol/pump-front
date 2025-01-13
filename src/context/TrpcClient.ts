import { createContext } from 'react';

type TrpcClientType = ReturnType<
  (typeof import('utils/trpc').trpc)['createClient']
>;
interface TrpcClientWrapperContextType {
  trpcClient: TrpcClientType;
  setTrpcClient: React.Dispatch<React.SetStateAction<TrpcClientType>>;
}

export const TrpcClientWrapperContext =
  createContext<TrpcClientWrapperContextType>(
    {} as TrpcClientWrapperContextType
  );
