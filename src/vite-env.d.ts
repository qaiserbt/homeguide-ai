/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the deployed Cloudflare Worker upload endpoint (see /worker). */
  readonly VITE_UPLOAD_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
