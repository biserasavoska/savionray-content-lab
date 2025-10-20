#!/usr/bin/env node

/**
 * Stable Development Server
 * Automatically restarts the Next.js dev server if it crashes
 * Includes memory monitoring and cleanup
 */

const { spawn } = require('child_process');
const path = require('path');

let devProcess = null;
let restartCount = 0;
let lastRestartTime = Date.now();
const MAX_RAPID_RESTARTS = 3;
const RAPID_RESTART_WINDOW = 30000; // 30 seconds

function startDevServer() {
  console.log('\n🚀 Starting Next.js development server...\n');
  
  devProcess = spawn('npx', ['next', 'dev'], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
    },
  });

  devProcess.on('exit', (code, signal) => {
    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      console.log('\n✅ Dev server stopped gracefully\n');
      process.exit(0);
    }

    const now = Date.now();
    const timeSinceLastRestart = now - lastRestartTime;
    
    // Reset counter if enough time has passed
    if (timeSinceLastRestart > RAPID_RESTART_WINDOW) {
      restartCount = 0;
    }
    
    restartCount++;
    lastRestartTime = now;

    if (restartCount > MAX_RAPID_RESTARTS) {
      console.error('\n❌ Dev server crashed too many times. Please check for errors.\n');
      console.log('💡 Try running: npm run clean-dev\n');
      process.exit(1);
    }

    console.log(`\n⚠️  Dev server exited with code ${code}. Restarting... (${restartCount}/${MAX_RAPID_RESTARTS})\n`);
    
    // Wait a bit before restarting
    setTimeout(() => {
      startDevServer();
    }, 2000);
  });

  devProcess.on('error', (err) => {
    console.error('\n❌ Failed to start dev server:', err.message, '\n');
    process.exit(1);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  Stopping dev server...\n');
  if (devProcess) {
    devProcess.kill('SIGTERM');
  }
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Stopping dev server...\n');
  if (devProcess) {
    devProcess.kill('SIGINT');
  }
  process.exit(0);
});

// Memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
  
  // Warn if memory usage is high
  if (heapUsedMB > 3000) {
    console.warn(`\n⚠️  High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`);
    console.warn('💡 Consider restarting the dev server if you experience issues\n');
  }
}, 60000); // Check every minute

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║          Stable Development Server                         ║');
console.log('║  Auto-restarts on crash | Memory: 4GB | Port: 3000        ║');
console.log('╚════════════════════════════════════════════════════════════╝');

startDevServer();


