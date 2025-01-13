/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_NETWORK_NAME: string;
  VITE_CHAIN_ID: number;
  VITE_CHAIN_URL: string;
  VITE_API: string;
  VITE_DUSA_API: string;
  VITE_PAUSE_SCREEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
