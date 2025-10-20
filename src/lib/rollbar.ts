import Rollbar from 'rollbar';

// Rollbar configuration
const rollbarConfig = {
  accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN || 'YOUR_ROLLBAR_SERVER_ACCESS_TOKEN_HERE',
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV || 'development',
  // Add more configuration options as needed
  payload: {
    server: {
      root: process.cwd(),
    },
  },
};

// Create Rollbar instance for server-side
export const rollbar = new Rollbar(rollbarConfig);

// Client-side Rollbar configuration
export const clientRollbarConfig = {
  accessToken: process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN || 'YOUR_ROLLBAR_CLIENT_ACCESS_TOKEN_HERE',
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.NODE_ENV || 'development',
  // Add more configuration options as needed
  payload: {
    client: {
      javascript: {
        source_map_enabled: true,
        code_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
    },
  },
};

// Utility functions for error reporting
export const reportError = (error: Error, context?: any) => {
  if (typeof window !== 'undefined') {
    // Client-side error reporting
    if (window.Rollbar) {
      window.Rollbar.error(error, context);
    }
  } else {
    // Server-side error reporting
    rollbar.error(error, context);
  }
};

export const reportInfo = (message: string, context?: any) => {
  if (typeof window !== 'undefined') {
    // Client-side info reporting
    if (window.Rollbar) {
      window.Rollbar.info(message, context);
    }
  } else {
    // Server-side info reporting
    rollbar.info(message, context);
  }
};

export const reportWarning = (message: string, context?: any) => {
  if (typeof window !== 'undefined') {
    // Client-side warning reporting
    if (window.Rollbar) {
      window.Rollbar.warning(message, context);
    }
  } else {
    // Server-side warning reporting
    rollbar.warning(message, context);
  }
};

// Declare global Rollbar for TypeScript
declare global {
  interface Window {
    Rollbar: any;
  }
}
