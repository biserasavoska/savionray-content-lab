# Rollbar Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```bash
# Rollbar Configuration
# Server Access Token (keep this secure - server-side only)
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26

# Client Access Token (public - safe for client-side)
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c

# App Version (optional - for tracking deployments)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Instructions:

1. Create a `.env.local` file in your project root if it doesn't exist
2. Copy the above environment variables into it
3. The tokens are already provided from your Rollbar setup
4. Make sure `.env.local` is in your `.gitignore` to keep tokens secure

## Security Notes:

- `ROLLBAR_SERVER_ACCESS_TOKEN` should be kept secure and only used server-side
- `NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN` is safe to expose client-side
- Never commit these tokens to version control
