// This file is used for TypeScript type definitions.
// It was updated to remove a reference to "vite/client" which was causing a build error,
// and instead provide types for Node.js `process.env` used in the application.

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
