/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}