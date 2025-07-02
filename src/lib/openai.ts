import { AVAILABLE_MODELS } from './models';

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  const { OpenAI } = require('openai');
  return new OpenAI({
    apiKey: apiKey,
  });
};

const isApiKeyAvailable = () => {
  return !!process.env.OPENAI_API_KEY;
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
  includeReasoning?: boolean;
  reasoningSummary?: boolean;
  encryptedReasoning?: boolean;
}

interface GeneratedContent {
  postText: string;
  hashtags: string[];
  callToAction: string;
  reasoning?: {
    summary?: string;
    reasoningId?: string;
    encryptedContent?: string;
  };
}

interface ChatResponse {
  message: string;
  content?: {
    postText: string;
    hashtags: string[];
    callToAction: string;
  };
  reasoning?: {
    summary?: string;
    reasoningId?: string;
    encryptedContent?: string;
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
  includeReasoning?: boolean;
}

// Enhanced content generation with reasoning support
export async function generateSocialContent({
  title,
  description,
  format,
  tone = 'professional',
  targetAudience = 'professionals',
  model = DEFAULT_MODEL,
  includeReasoning = false,
  reasoningSummary = false,
  encryptedReasoning = false,
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

    // Use Responses API for reasoning models, Chat API for others
    if (selectedModel.api === 'responses' && selectedModel.supportsReasoning) {
      return await generateWithReasoningAPI(openai, selectedModel, prompt, {
        includeReasoning,
        reasoningSummary,
        encryptedReasoning
      });
    } else {
      return await generateWithChatAPI(openai, selectedModel, prompt);
    }
  } catch (error: unknown) {
    console.error('Error generating content:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate content: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred during content generation.');
    }
  }
}

// New function for reasoning API
async function generateWithReasoningAPI(
  openai: any, 
  model: any, 
  prompt: string, 
  options: {
    includeReasoning: boolean;
    reasoningSummary: boolean;
    encryptedReasoning: boolean;
  }
): Promise<GeneratedContent> {
  const input = [{ role: 'user', content: prompt }];
  
  const requestConfig: any = {
    model: model.id,
    input,
    temperature: 0.7,
  };

  // Add reasoning features based on options
  if (options.includeReasoning) {
    requestConfig.reasoning = {};
    if (options.reasoningSummary) {
      requestConfig.reasoning.summary = 'auto';
    }
  }

  if (options.encryptedReasoning) {
    requestConfig.include = ['reasoning.encrypted_content'];
    requestConfig.store = false; // Required for encrypted content
  }

  console.log('Using Responses API with config:', requestConfig);

  const response = await openai.responses.create(requestConfig);
  
  console.log('Responses API response:', JSON.stringify(response.model_dump(), null, 2));

  // Extract content from response
  const messageOutput = response.output.find((item: any) => item.type === 'message');
  const reasoningOutput = response.output.find((item: any) => item.type === 'reasoning');

  if (!messageOutput?.content?.[0]?.text) {
    throw new Error('No content generated from reasoning model');
  }

  const content = messageOutput.content[0].text;
  
  // Parse the structured response
  const postTextMatch = content.match(/Post Text:\s*([\s\S]*?)(?=Hashtags:|$)/);
  const hashtagsMatch = content.match(/Hashtags:\s*([\s\S]*?)(?=Call to Action:|$)/);
  const callToActionMatch = content.match(/Call to Action:\s*([\s\S]*?)$/);

  const postText = (postTextMatch?.[1] || '').trim().replace(/###/g, '');
  const hashtags = hashtagsMatch?.[1]
    ? hashtagsMatch[1]
        .trim()
        .replace(/###/g, '')
        .split(/\s+/)
        .filter((tag: string) => tag.startsWith('#'))
        .map((tag: string) => tag.substring(1))
    : [];
  const callToAction = (callToActionMatch?.[1] || '').trim().replace(/###/g, '');

  const result: GeneratedContent = {
    postText,
    hashtags,
    callToAction,
  };

  // Add reasoning information if available
  if (reasoningOutput && options.includeReasoning) {
    result.reasoning = {
      reasoningId: reasoningOutput.id,
    };

    if (options.reasoningSummary && reasoningOutput.summary?.[0]?.text) {
      result.reasoning.summary = reasoningOutput.summary[0].text;
    }

    if (options.encryptedReasoning && reasoningOutput.encrypted_content) {
      result.reasoning.encryptedContent = reasoningOutput.encrypted_content;
    }
  }

  console.log('Processed reasoning content:', result);
  return result;
}

// Existing function for Chat API (updated)
async function generateWithChatAPI(openai: any, model: any, prompt: string): Promise<GeneratedContent> {
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
    max_tokens: model.maxTokens || 4096,
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
        .filter((tag: string) => tag.startsWith('#'))
        .map((tag: string) => tag.substring(1))
      : [];
  const callToAction = (callToActionMatch?.[1] || '').trim().replace(/###/g, '');

  const result = {
    postText,
    hashtags,
    callToAction,
  };

  console.log('Processed content:', result);
  return result;
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