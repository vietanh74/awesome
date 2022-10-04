interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_SUB_FOLDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
