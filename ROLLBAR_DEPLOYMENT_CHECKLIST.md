# Rollbar Production Deployment Checklist

## Environment Variables to Set

### Staging Environment:
```bash
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c
NEXT_PUBLIC_APP_VERSION=1.0.0-staging
NODE_ENV=staging
```

### Production Environment:
```bash
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

## Deployment Steps

1. ✅ **Code is Ready** - Rollbar integration is already committed to the rollbar-integration branch
2. 🔄 **Merge to Main** - When ready, merge rollbar-integration branch to main
3. 🔄 **Set Environment Variables** - Add the above variables to your deployment platform
4. 🔄 **Deploy** - Deploy your application
5. 🔄 **Test** - Visit your staging/production test page to verify integration
6. 🔄 **Monitor** - Check Rollbar dashboard for errors

## Platform-Specific Instructions

### Railway:
- Add environment variables in Railway dashboard
- Set NODE_ENV appropriately for each environment

### Vercel:
- Add environment variables in Vercel dashboard
- Set environment-specific variables

### Other Platforms:
- Add the environment variables to your deployment platform's environment settings

## Post-Deployment Testing

### Staging:
```bash
# Test staging endpoints
curl "https://your-staging-domain.com/api/test-rollbar?type=error"
curl "https://your-staging-domain.com/api/test-rollbar?type=info"
```

### Production:
```bash
# Test production endpoints (be careful!)
curl "https://your-production-domain.com/api/test-rollbar?type=info"
```

## Monitoring Setup

1. **Set up notifications** in Rollbar dashboard for critical errors
2. **Configure environment-specific filtering** in Rollbar
3. **Set up deployment tracking** to correlate errors with releases
4. **Create saved views** for different error types and environments

## Rollbar Dashboard Configuration

### Environments:
- `development` - Local development
- `staging` - Staging environment  
- `production` - Production environment

### Error Filtering:
- Filter by environment to see only relevant errors
- Set up different notification rules per environment
- Use severity levels (error, warning, info) for filtering

## Best Practices

1. **Version Tracking**: Update NEXT_PUBLIC_APP_VERSION for each deployment
2. **Environment Separation**: Use different Rollbar projects or environments for staging/production
3. **Error Grouping**: Configure custom fingerprinting for better error grouping
4. **Rate Limiting**: Be aware of Rollbar rate limits for high-traffic applications
5. **Data Privacy**: Ensure sensitive data is not included in error reports


