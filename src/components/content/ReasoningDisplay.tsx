import React from 'react';
import { CpuChipIcon, DocumentTextIcon, ShieldCheckIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ReasoningInfo {
  summary?: string;
  reasoningId?: string;
  encryptedContent?: string;
}

interface ReasoningDisplayProps {
  reasoning?: ReasoningInfo;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const ReasoningDisplay: React.FC<ReasoningDisplayProps> = ({
  reasoning,
  isVisible,
  onToggleVisibility,
}) => {
  if (!reasoning) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="h-5 w-5 text-orange-600" />
          <h3 className="text-sm font-medium text-gray-900">AI Reasoning Process</h3>
        </div>
        <button
          onClick={onToggleVisibility}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <EyeIcon className="h-4 w-4" />
          <span>{isVisible ? 'Hide' : 'Show'} Reasoning</span>
        </button>
      </div>

      {isVisible && (
        <div className="space-y-3">
          {/* Reasoning Summary */}
          {reasoning.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Reasoning Summary</span>
              </div>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{reasoning.summary}</p>
            </div>
          )}

          {/* Reasoning ID */}
          {reasoning.reasoningId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Reasoning ID</span>
                <span className="text-xs text-gray-500 font-mono">{reasoning.reasoningId}</span>
              </div>
            </div>
          )}

          {/* Encrypted Content Indicator */}
          {reasoning.encryptedContent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Encrypted Reasoning</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                This reasoning data is encrypted for enhanced privacy and security.
              </p>
            </div>
          )}

          {/* Information */}
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <p>
              <strong>What is reasoning?</strong> This shows how the AI model analyzed your request 
              and arrived at the generated content. It provides transparency into the AI's decision-making process.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasoningDisplay; 