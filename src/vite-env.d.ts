/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CF_ANALYTICS_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.glsl' {
  const content: string
  export default content
}

