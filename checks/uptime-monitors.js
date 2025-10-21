const { UptimeCheck } = require('checkly/constructs')

// Main App - Production
new UptimeCheck('main-app-production', {
  name: 'Main App - Production',
  url: 'https://app.savionray.com',
  locations: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  tags: ['production', 'uptime', 'main'],
  frequency: 5,
})

// Main App - Staging
new UptimeCheck('main-app-staging', {
  name: 'Main App - Staging',
  url: 'https://savionray-content-lab-staging.up.railway.app',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['staging', 'uptime', 'main'],
  frequency: 5,
})

// Authentication Page - Production
new UptimeCheck('auth-page-production', {
  name: 'Authentication Page - Production',
  url: 'https://app.savionray.com/auth/signin',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'uptime', 'auth'],
  frequency: 10,
})

// Dashboard Page - Production
new UptimeCheck('dashboard-page-production', {
  name: 'Dashboard Page - Production',
  url: 'https://app.savionray.com/organization/dashboard',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'uptime', 'dashboard'],
  frequency: 10,
})

// Content Management - Production
new UptimeCheck('content-page-production', {
  name: 'Content Management - Production',
  url: 'https://app.savionray.com/ready-content',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['production', 'uptime', 'content'],
  frequency: 10,
})
