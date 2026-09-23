
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_AUTH_TOKEN: string;
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;
    }
  }
}

// Source - https://stackoverflow.com/a/45195359
// Posted by Joe Clay, modified by community. See post 'Timeline' for change history
// Retrieved 2026-09-24, License - CC BY-SA 3.0

export interface ProcessEnv {
    [key: string]: string | undefined
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
