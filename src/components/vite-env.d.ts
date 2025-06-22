/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly PUBLIC_KEY_MP_TEST: string
  readonly ACCESS_TOKEN_MP_TEST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}