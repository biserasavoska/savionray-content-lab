'use client';

import { useState } from 'react';
import { reportError, reportInfo, reportWarning } from '@/lib/rollbar';

export default function TestRollbarPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testClientError = () => {
    try {
      // This will trigger a client-side error
      throw new Error('Test client-side error for Rollbar');
    } catch (error) {
      reportError(error as Error, { source: 'test-page', action: 'client-error-test' });
      addResult('Client error reported to Rollbar');
    }
  };

  const testClientInfo = () => {
    reportInfo('Test info message from client', { source: 'test-page', action: 'info-test' });
    addResult('Info message sent to Rollbar');
  };

  const testClientWarning = () => {
    reportWarning('Test warning message from client', { source: 'test-page', action: 'warning-test' });
    addResult('Warning message sent to Rollbar');
  };

  const testUncaughtError = () => {
    // This will trigger an uncaught error that should be caught by Rollbar
    setTimeout(() => {
      throw new Error('Uncaught test error for Rollbar');
    }, 100);
    addResult('Uncaught error triggered - should appear in Rollbar');
  };

  const testServerError = async () => {
    try {
      const response = await fetch('/api/test-rollbar?type=error');
      const data = await response.json();
      addResult(`Server error test: ${data.message}`);
    } catch (error) {
      addResult(`Server error test failed: ${error}`);
    }
  };

  const testServerWarning = async () => {
    try {
      const response = await fetch('/api/test-rollbar?type=warning');
      const data = await response.json();
      addResult(`Server warning test: ${data.message}`);
    } catch (error) {
      addResult(`Server warning test failed: ${error}`);
    }
  };

  const testServerInfo = async () => {
    try {
      const response = await fetch('/api/test-rollbar?type=info');
      const data = await response.json();
      addResult(`Server info test: ${data.message}`);
    } catch (error) {
      addResult(`Server info test failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Rollbar Integration Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Setup Instructions:</h2>
        <p className="text-blue-700 mb-2">
          1. Make sure you have added the environment variables to your <code>.env.local</code> file
        </p>
        <p className="text-blue-700 mb-2">
          2. Check the <code>rollbar-env-setup.md</code> file for the required environment variables
        </p>
        <p className="text-blue-700">
          3. After running these tests, check your Rollbar dashboard for the reported errors and messages
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Client-Side Tests:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={testClientError}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Client Error
          </button>
          
          <button
            onClick={testClientInfo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Client Info
          </button>
          
          <button
            onClick={testClientWarning}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Client Warning
          </button>
          
          <button
            onClick={testUncaughtError}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Uncaught Error
          </button>
        </div>

        <h3 className="text-lg font-semibold mt-6">Server-Side Tests:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testServerError}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Error
          </button>
          
          <button
            onClick={testServerWarning}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Warning
          </button>
          
          <button
            onClick={testServerInfo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Info
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Test Results:</h2>
        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-100 border rounded-lg p-4 max-h-96 overflow-y-auto">
        {testResults.length === 0 ? (
          <p className="text-gray-500 italic">No test results yet. Click a test button above.</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">What to Check:</h3>
        <ul className="text-green-700 space-y-1">
          <li>• Check your Rollbar dashboard for new error reports</li>
          <li>• Verify that errors appear with the correct context and source information</li>
          <li>• Make sure both client and server errors are being captured</li>
          <li>• Test in both development and production environments</li>
        </ul>
      </div>
    </div>
  );
}
