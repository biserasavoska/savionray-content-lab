import React from 'react';
import { AVAILABLE_MODELS, AIModel } from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <h4 className="font-medium text-gray-900">{model.name}</h4>
                  <p className="text-gray-500">{model.description}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  model.type === 'fast'
                    ? 'bg-green-100 text-green-800'
                    : model.type === 'balanced'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {model.type}
              </span>
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