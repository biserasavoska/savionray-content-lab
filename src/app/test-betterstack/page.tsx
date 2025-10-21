'use client';

import { useState } from 'react';

export default function TestBetterStackPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testServerError = async () => {
    try {
      const response = await fetch('/api/test-betterstack?type=error');
      const data = await response.json();
      addResult(`Server error test: ${data.message}`);
    } catch (error) {
      addResult(`Server error test failed: ${error}`);
    }
  };

  const testServerWarning = async () => {
    try {
      const response = await fetch('/api/test-betterstack?type=warning');
      const data = await response.json();
      addResult(`Server warning test: ${data.message}`);
    } catch (error) {
      addResult(`Server warning test failed: ${error}`);
    }
  };

  const testServerInfo = async () => {
    try {
      const response = await fetch('/api/test-betterstack?type=info');
      const data = await response.json();
      addResult(`Server info test: ${data.message}`);
    } catch (error) {
      addResult(`Server info test failed: ${error}`);
    }
  };

  const testServerMetric = async () => {
    try {
      const response = await fetch('/api/test-betterstack?type=metric');
      const data = await response.json();
      addResult(`Server metric test: ${data.message}`);
    } catch (error) {
      addResult(`Server metric test failed: ${error}`);
    }
  };

  const testUserAction = async () => {
    try {
      const response = await fetch('/api/test-betterstack?type=user-action');
      const data = await response.json();
      addResult(`User action test: ${data.message}`);
    } catch (error) {
      addResult(`User action test failed: ${error}`);
    }
  };

  const testCustomMessage = async () => {
    try {
      const response = await fetch('/api/test-betterstack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Custom test message from client',
          level: 'info',
          type: 'custom'
        }),
      });
      const data = await response.json();
      addResult(`Custom message test: ${data.message}`);
    } catch (error) {
      addResult(`Custom message test failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Better Stack Integration Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Instructions</h2>
        <p className="text-blue-700">
          This page tests Better Stack integration by sending various types of logs and metrics.
          Check your Better Stack dashboard to see the test events.
        </p>
        <p className="text-blue-700 mt-2">
          <strong>Note:</strong> Make sure to set up your Better Stack source token in environment variables.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Server-Side Tests:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={testServerInfo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Info
          </button>
          <button 
            onClick={testServerWarning}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Warning
          </button>
          <button 
            onClick={testServerError}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Error
          </button>
          <button 
            onClick={testServerMetric}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Server Metric
          </button>
          <button 
            onClick={testUserAction}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test User Action
          </button>
          <button 
            onClick={testCustomMessage}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Test Custom Message
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          <button 
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Results
          </button>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No test results yet. Click the buttons above to test Better Stack integration.</p>
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
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Environment Setup Required</h3>
        <p className="text-yellow-700 mb-2">
          To enable Better Stack logging, add the following environment variable:
        </p>
        <code className="bg-yellow-100 px-2 py-1 rounded text-sm">
          BETTERSTACK_SOURCE_TOKEN=your_source_token_here
        </code>
        <p className="text-yellow-700 mt-2 text-sm">
          Get your source token from your Better Stack dashboard.
        </p>
      </div>
    </div>
  );
}


