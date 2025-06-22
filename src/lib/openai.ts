import OpenAI from 'openai';
import { AVAILABLE_MODELS } from './models';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Initialize the OpenAI client with API key from environment variable
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  return new OpenAI({ apiKey });
};

// Check if API key is available
const isApiKeyAvailable = () => {
  return !!process.env.OPENAI_API_KEY;
};

// Model configurations
interface ModelConfig {
  api: 'chat' | 'responses';
  maxTokens: number;
  temperature?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  id?: string;
}

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-3.5-turbo-0125': {
    api: 'chat',
    maxTokens: 4096,
    temperature: 0.7
  },
  'gpt-4-0125-preview': {
    api: 'chat',
    maxTokens: 8192,
    temperature: 0.7
  },
  'o4-mini': {
    api: 'responses',
    maxTokens: 2048,
    reasoningEffort: 'high'
  }
};

// Default model configuration
const DEFAULT_MODEL = "gpt-3.5-turbo";

type ContentFormat = 'linkedin' | 'twitter' | 'instagram' | 'facebook';

interface GenerateContentOptions {
  title: string;
  description: string;
  format: ContentFormat;
  tone?: string;
  targetAudience?: string;
  model?: string;
}

interface GeneratedContent {
  postText: string;
  hashtags: string[];
  callToAction: string;
}

interface ChatResponse {
  message: string;
  content?: {
    postText: string;
    hashtags: string[];
    callToAction: string;
  };
}

interface ChatRequest {
  message: string;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  idea: {
    title: string;
    description: string;
  };
  model: string;
}

async function generateWithResponsesAPI(prompt: string, model: ModelConfig) {
  try {
    console.log('Using Completions API with model:', model.id);
    const openai = getOpenAIClient();
    
    // Only use completions API for models that support it
    if (!model.id || model.id.includes('gpt-4') || model.id.includes('gpt-3.5')) {
      throw new Error(`Model ${model.id} requires chat completions API`);
    }
    
    const response = await openai.completions.create({
      model: model.id,
      prompt: prompt,
      max_tokens: model.maxTokens,
      temperature: 0.7,
    });

    const content = response.choices[0]?.text || '';
    console.log('Completions API response:', content);
    return content;
  } catch (error) {
    console.error('Error in completions API:', error);
    throw error;
  }
}

async function generateWithChatAPI(prompt: string, model: ModelConfig) {
  try {
    console.log('Using Chat API with model:', model.id);
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: model.id || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional content creator who writes engaging and informative content. Your responses must always follow the exact format specified in the user prompt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: model.maxTokens,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('Chat API response:', content);
    return content;
  } catch (error) {
    console.error('Error in chat API:', error);
    throw error;
  }
}

export async function generateSocialContent({
  title,
  description,
  format,
  tone = 'professional',
  targetAudience = 'professionals',
  model = DEFAULT_MODEL,
}: GenerateContentOptions): Promise<GeneratedContent> {
  try {
    const selectedModel = AVAILABLE_MODELS.find(m => m.id === model);
    if (!selectedModel) {
      throw new Error(`Invalid model selected: ${model}`);
    }

    const prompt = `Create a ${format} post about: ${title}\n\nContext: ${description}\n\nTone: ${tone}\nTarget Audience: ${targetAudience}\n\nCreate an engaging and informative post that captures attention and drives engagement. Format your response exactly as follows:

Post Text:
[Write the main content here]

Hashtags:
[List relevant hashtags here, each starting with #]

Call to Action:
[Write a compelling call to action here]`;
    
    console.log('Generating content with prompt:', prompt);
    
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: selectedModel.id || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a professional content creator who writes engaging and informative content. Your responses must always follow the exact format specified in the user prompt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: selectedModel.maxTokens || 4096,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('Raw API response:', content);

    if (!content) {
      throw new Error('No content generated');
    }

    const postTextMatch = content.match(/Post Text:\s*([\s\S]*?)(?=Hashtags:|$)/);
    const hashtagsMatch = content.match(/Hashtags:\s*([\s\S]*?)(?=Call to Action:|$)/);
    const callToActionMatch = content.match(/Call to Action:\s*([\s\S]*?)$/);

    console.log('Content matches:', { postTextMatch, hashtagsMatch, callToActionMatch });

    // Provide default values if matches are not found
    const postText = (postTextMatch?.[1] || '').trim().replace(/###/g, '');
    const hashtags = hashtagsMatch?.[1]
      ? hashtagsMatch[1]
          .trim()
          .replace(/###/g, '')
          .split(/\s+/)
          .filter(tag => tag.startsWith('#'))
          .map(tag => tag.substring(1))
      : [];
    const callToAction = (callToActionMatch?.[1] || '').trim().replace(/###/g, '');

    const result = {
      postText,
      hashtags,
      callToAction,
    };

    console.log('Processed content:', result);
    return result;
  } catch (error: unknown) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred during content generation.');
    }
  }
}

export async function generateVisualPrompt(description: string) {
  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert at creating detailed visual descriptions for image generation."
        },
        {
          role: "user",
          content: `Create a detailed visual prompt based on this description: ${description}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('No visual prompt generated');
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating visual prompt:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate visual prompt: ${error.message}`);
    }
    throw new Error('Failed to generate visual prompt: An unexpected error occurred');
  }
}

export async function generateImage(prompt: string) {
  if (!prompt) {
    throw new Error('A prompt is required to generate an image.');
  }

  try {
    const openai = getOpenAIClient();
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data || !response.data[0]?.url) {
      throw new Error('No image URL generated');
    }

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('Failed to generate image: An unexpected error occurred');
  }
}

export async function generateChatResponse({
  message,
  conversation,
  idea,
  model: modelId,
}: ChatRequest): Promise<ChatResponse> {
  try {
    const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (!selectedModel) {
      throw new Error(`Invalid model selected: ${modelId}`);
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: selectedModel.id || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a helpful content creation assistant. You're helping with an idea titled "${idea.title}". 
          
Description: ${idea.description}

Be conversational, helpful, and provide specific suggestions for content creation.`
        },
        ...conversation,
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: selectedModel.maxTokens || 4096,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    
    return {
      message: content,
    };
  } catch (error) {
    console.error('Error generating chat response:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
    throw new Error('Failed to generate chat response: An unexpected error occurred');
  }
}

export default getOpenAIClient(); 