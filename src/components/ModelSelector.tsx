import { AIModel } from '@/lib/models'

export interface ModelSelectorProps {
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
  models: AIModel[]
}

export default function ModelSelector({ selectedModel, setSelectedModel, models }: ModelSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        AI Model
      </label>
      <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {models.map((model) => (
          <div
            key={model.id}
            className={`relative rounded-lg border p-4 cursor-pointer hover:border-red-500 ${
              selectedModel.id === model.id ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            onClick={() => setSelectedModel(model)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{model.name}</p>
                  <p className="text-gray-500">{model.description}</p>
                </div>
              </div>
              {selectedModel.id === model.id && (
                <div className="shrink-0 text-red-600">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Max tokens: {model.maxTokens.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 