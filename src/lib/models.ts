export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  maxOutputTokens?: number;
  costPerToken: number;
  outputCostPerToken?: number;
  type: 'fast' | 'balanced' | 'advanced' | 'reasoning' | 'flagship';
  api: 'responses' | 'chat' | 'both';
  supportsReasoning?: boolean;
  supportsGPT5Features?: boolean;
  reasoningFeatures?: {
    summaries?: boolean;
    encryptedContent?: boolean;
    toolUse?: boolean;
    stepByStep?: boolean;
    confidence?: boolean;
  };
  gpt5Features?: {
    verbosityControl?: boolean;
    reasoningEffort?: boolean;
    longContext?: boolean;
  };
  useCases?: string[];
  strengths?: string[];
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Advanced model for complex content generation with high accuracy',
    maxTokens: 8192,
    costPerToken: 0.00002,
    type: 'advanced',
    api: 'chat',
    useCases: ['Complex content creation', 'Detailed analysis', 'Creative writing'],
    strengths: ['High accuracy', 'Creative capabilities', 'Broad knowledge']
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Most capable model for high-quality content generation with balanced performance',
    maxTokens: 4096,
    costPerToken: 0.00001,
    type: 'balanced',
    api: 'chat',
    useCases: ['General content creation', 'Quick responses', 'Standard analysis'],
    strengths: ['Fast response', 'Cost-effective', 'Good quality']
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and cost-effective for most content generation tasks',
    maxTokens: 4096,
    costPerToken: 0.000002,
    type: 'fast',
    api: 'chat',
    useCases: ['Quick content generation', 'Simple tasks', 'Cost-sensitive applications'],
    strengths: ['Very fast', 'Lowest cost', 'Reliable']
  },
  // Enhanced reasoning models with comprehensive features
  {
    id: 'o4-mini',
    name: 'O4 Mini (Reasoning)',
    description: 'Advanced reasoning model for complex content analysis and generation with step-by-step thinking',
    maxTokens: 4096,
    costPerToken: 0.000015,
    type: 'reasoning',
    api: 'responses',
    supportsReasoning: true,
    reasoningFeatures: {
      summaries: true,
      encryptedContent: true,
      toolUse: true,
      stepByStep: true,
      confidence: true
    },
    useCases: ['Complex content analysis', 'Strategic planning', 'Detailed reasoning'],
    strengths: ['Step-by-step reasoning', 'High confidence scores', 'Detailed explanations']
  },
  {
    id: 'o3',
    name: 'O3 (Advanced Reasoning)',
    description: 'State-of-the-art reasoning model for sophisticated content creation with advanced analytical capabilities',
    maxTokens: 8192,
    costPerToken: 0.00003,
    type: 'reasoning',
    api: 'responses',
    supportsReasoning: true,
    reasoningFeatures: {
      summaries: true,
      encryptedContent: true,
      toolUse: true,
      stepByStep: true,
      confidence: true
    },
    useCases: ['Advanced content strategy', 'Complex problem solving', 'Research and analysis'],
    strengths: ['Most advanced reasoning', 'Highest accuracy', 'Comprehensive analysis']
  },
  // GPT-5 Models - Latest OpenAI flagship models with enhanced capabilities
  {
    id: 'gpt-5',
    name: 'GPT-5',
    description: 'OpenAI flagship model for deep reasoning, complex coding, and agentic workflows with 400K context',
    maxTokens: 400000,
    maxOutputTokens: 128000,
    costPerToken: 0.00125, // $1.25 per 1M input tokens
    outputCostPerToken: 0.01, // $10.00 per 1M output tokens
    type: 'flagship',
    api: 'both',
    supportsGPT5Features: true,
    gpt5Features: {
      verbosityControl: true,
      reasoningEffort: true,
      longContext: true
    },
    useCases: ['Complex content strategy', 'Long-form content', 'Expert-level analysis', 'Advanced reasoning'],
    strengths: ['PhD-level expertise', 'Massive 400K context', 'Enhanced reasoning', 'Deep thinking']
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    description: 'Cost-effective GPT-5 variant for most content creation tasks with 400K context',
    maxTokens: 400000,
    maxOutputTokens: 128000,
    costPerToken: 0.00025, // $0.25 per 1M input tokens
    outputCostPerToken: 0.002, // $2.00 per 1M output tokens
    type: 'balanced',
    api: 'both',
    supportsGPT5Features: true,
    gpt5Features: {
      verbosityControl: true,
      reasoningEffort: true,
      longContext: true
    },
    useCases: ['Regular content creation', 'Social media posts', 'Content analysis', 'Strategic planning'],
    strengths: ['Cost-effective', 'Fast response', 'Good quality', 'Large context']
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    description: 'Ultra-fast, low-cost GPT-5 variant for high-volume operations with 400K context',
    maxTokens: 400000,
    maxOutputTokens: 128000,
    costPerToken: 0.00005, // $0.05 per 1M input tokens
    outputCostPerToken: 0.0004, // $0.40 per 1M output tokens
    type: 'fast',
    api: 'both',
    supportsGPT5Features: true,
    gpt5Features: {
      verbosityControl: true,
      reasoningEffort: true,
      longContext: true
    },
    useCases: ['Bulk processing', 'Real-time suggestions', 'Simple tasks', 'High-volume operations'],
    strengths: ['Ultra-low cost', 'Very fast', 'High volume', 'Efficient']
  }
]; 