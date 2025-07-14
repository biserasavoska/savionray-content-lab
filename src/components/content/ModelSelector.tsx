import React from 'react';
import { 
  CpuChipIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

import { AVAILABLE_MODELS, AIModel } from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fast':
        return 'bg-green-100 text-green-800';
      case 'balanced':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'reasoning':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reasoning':
        return <CpuChipIcon className="h-4 w-4" />;
      case 'advanced':
        return <SparklesIcon className="h-4 w-4" />;
      case 'balanced':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'fast':
        return <SparklesIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select AI Model</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AVAILABLE_MODELS.map((model) => (
          <div
            key={model.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-colors ${
              selectedModel === model.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onModelChange(model.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900">{model.name}</h4>
                  <p className="text-gray-500 text-xs">{model.description}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeColor(model.type)}`}
              >
                {getTypeIcon(model.type)}
                <span className="ml-1">{model.type}</span>
              </span>
            </div>

            {/* Reasoning Features */}
            {model.supportsReasoning && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-xs text-gray-600">
                  <CpuChipIcon className="h-3 w-3 mr-1" />
                  <span>Advanced Reasoning</span>
                </div>
                
                {model.reasoningFeatures && (
                  <div className="flex flex-wrap gap-1">
                    {model.reasoningFeatures.summaries && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700">
                        <DocumentTextIcon className="h-3 w-3 mr-1" />
                        Summaries
                      </span>
                    )}
                    {model.reasoningFeatures.encryptedContent && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-50 text-green-700">
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        Encrypted
                      </span>
                    )}
                    {model.reasoningFeatures.toolUse && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-50 text-purple-700">
                        <SparklesIcon className="h-3 w-3 mr-1" />
                        Tool Use
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cost Information */}
            <div className="mt-2 text-xs text-gray-500">
              Cost: ${(model.costPerToken * 1000).toFixed(4)} per 1K tokens
            </div>

            {selectedModel === model.id && (
              <div className="absolute -top-px -right-px -bottom-px -left-px rounded-lg border-2 border-blue-500 pointer-events-none" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector; 