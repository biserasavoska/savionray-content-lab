import React from 'react';
import { CpuChipIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

import { AVAILABLE_MODELS } from '@/lib/models';

interface ReasoningOptionsProps {
  selectedModel: string;
  includeReasoning: boolean;
  reasoningSummary: boolean;
  encryptedReasoning: boolean;
  onIncludeReasoningChange: (value: boolean) => void;
  onReasoningSummaryChange: (value: boolean) => void;
  onEncryptedReasoningChange: (value: boolean) => void;
}

const ReasoningOptions: React.FC<ReasoningOptionsProps> = ({
  selectedModel,
  includeReasoning,
  reasoningSummary,
  encryptedReasoning,
  onIncludeReasoningChange,
  onReasoningSummaryChange,
  onEncryptedReasoningChange,
}) => {
  const selectedModelData = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const supportsReasoning = selectedModelData?.supportsReasoning;

  if (!supportsReasoning) {
    return null;
  }

  return (
    <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex items-center space-x-2">
        <CpuChipIcon className="h-5 w-5 text-orange-600" />
        <h3 className="text-sm font-medium text-orange-900">Advanced Reasoning Options</h3>
      </div>
      
      <div className="space-y-3">
        {/* Enable Reasoning */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="includeReasoning"
            checked={includeReasoning}
            onChange={(e) => onIncludeReasoningChange(e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="includeReasoning" className="text-sm text-orange-800">
            Enable advanced reasoning for better content quality
          </label>
        </div>

        {/* Reasoning Summary */}
        {includeReasoning && selectedModelData?.reasoningFeatures?.summaries && (
          <div className="flex items-center space-x-3 ml-6">
            <input
              type="checkbox"
              id="reasoningSummary"
              checked={reasoningSummary}
              onChange={(e) => onReasoningSummaryChange(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="reasoningSummary" className="text-sm text-blue-800 flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Include reasoning summary (shows AI's thought process)
            </label>
          </div>
        )}

        {/* Encrypted Reasoning */}
        {includeReasoning && selectedModelData?.reasoningFeatures?.encryptedContent && (
          <div className="flex items-center space-x-3 ml-6">
            <input
              type="checkbox"
              id="encryptedReasoning"
              checked={encryptedReasoning}
              onChange={(e) => onEncryptedReasoningChange(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="encryptedReasoning" className="text-sm text-green-800 flex items-center">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              Use encrypted reasoning (enhanced privacy)
            </label>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded">
        <p><strong>Benefits:</strong> Reasoning models provide more sophisticated content analysis and generation capabilities.</p>
        {reasoningSummary && (
          <p className="mt-1"><strong>Summary:</strong> You'll see the AI's reasoning process for transparency.</p>
        )}
        {encryptedReasoning && (
          <p className="mt-1"><strong>Privacy:</strong> Reasoning data is encrypted and not stored on OpenAI servers.</p>
        )}
      </div>
    </div>
  );
};

export default ReasoningOptions; 