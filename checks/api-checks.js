const { ApiCheck } = require('checkly/constructs')

// Health Check - Production
new ApiCheck('health-check-production', {
  name: 'Health Check - Production',
  url: 'https://app.savionray.com/api/health',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'equals',
      target: 200,
    },
    {
      source: 'JSON_BODY',
      property: 'status',
      comparison: 'equals',
      target: 'ok',
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'api', 'health'],
  frequency: 5,
})

// Health Check - Staging
new ApiCheck('health-check-staging', {
  name: 'Health Check - Staging',
  url: 'https://savionray-content-lab-staging.up.railway.app/api/health',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'equals',
      target: 200,
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['staging', 'api', 'health'],
  frequency: 5,
})

// Authentication API - Production
new ApiCheck('auth-api-production', {
  name: 'Authentication API - Production',
  url: 'https://app.savionray.com/api/auth/session',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'in',
      target: [200, 401],
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'api', 'auth'],
  frequency: 5,
})

// Organization API - Production
new ApiCheck('organization-api-production', {
  name: 'Organization API - Production',
  url: 'https://app.savionray.com/api/organization/list',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'in',
      target: [200, 401, 403],
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'api', 'organization'],
  frequency: 5,
})

// Content API - Production
new ApiCheck('content-api-production', {
  name: 'Content API - Production',
  url: 'https://app.savionray.com/api/content',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'in',
      target: [200, 401, 403],
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'api', 'content'],
  frequency: 5,
})

// LinkedIn API - Production
new ApiCheck('linkedin-api-production', {
  name: 'LinkedIn API - Production',
  url: 'https://app.savionray.com/api/linkedin',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'in',
      target: [200, 401, 403, 404],
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'api', 'linkedin'],
  frequency: 10,
})

// Billing API - Production
new ApiCheck('billing-api-production', {
  name: 'Billing API - Production',
  url: 'https://app.savionray.com/api/billing',
  method: 'GET',
  assertions: [
    {
      source: 'STATUS_CODE',
      property: '',
      comparison: 'in',
      target: [200, 401, 403],
    },
  ],
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'api', 'billing'],
  frequency: 10,
})
