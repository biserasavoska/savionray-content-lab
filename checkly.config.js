/**
 * Checkly configuration for SavionRay Content Lab
 * This file defines monitoring checks for your application
 */

const { defineConfig } = require('checkly');

module.exports = defineConfig({
  projectName: 'SavionRay Content Lab',
  logicalId: 'savionray-content-lab',
  repoUrl: 'https://github.com/biserasavoska/savionray-content-lab',
  
  // Global check settings
  checks: {
    activated: true,
    muted: false,
    runtimeId: '2023.09',
    frequency: 10, // Run every 10 minutes
    locations: ['us-east-1', 'eu-west-1'], // Run from multiple locations
    tags: ['production', 'api'],
    alertChannels: [], // Will be configured in individual checks
  },

  // CLI settings
  cli: {
    runLocation: 'us-east-1',
    reporters: ['list'],
  },
});