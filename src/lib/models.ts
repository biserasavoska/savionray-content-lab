export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPerToken: number;
  type: 'fast' | 'balanced' | 'advanced';
  api: 'responses' | 'chat';
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective for most content generation tasks',
    maxTokens: 4096,
    costPerToken: 0.000002,
    type: 'fast',
    api: 'chat'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Most capable model for high-quality content generation',
    maxTokens: 4096,
    costPerToken: 0.00001,
    type: 'balanced',
    api: 'chat'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced model for complex content generation',
    maxTokens: 8192,
    costPerToken: 0.00002,
    type: 'advanced',
    api: 'chat'
  }
]; 