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
const DEFAULT_MODEL = "gpt-4o";

// Smart model routing for optimal performance and cost
export function getOptimalGPT5Model(
  taskComplexity: 'simple' | 'medium' | 'complex' | 'strategic',
  urgency: 'real-time' | 'standard' | 'batch',
  budget: 'cost-conscious' | 'balanced' | 'premium'
): { model: string; gpt5Options: GPT5Options } {
  // Real-time tasks always use nano
  if (urgency === 'real-time') {
    return {
      model: 'gpt-5-nano',
      gpt5Options: {
        verbosity: 'low',
        reasoningEffort: 'minimal',
        maxOutputTokens: 1000
      }
    };
  }

  // Strategic/complex tasks with premium budget use full GPT-5
  if (taskComplexity === 'strategic' || (taskComplexity === 'complex' && budget === 'premium')) {
    return {
      model: 'gpt-5',
      gpt5Options: {
        verbosity: 'high',
        reasoningEffort: 'high',
        maxOutputTokens: 4000
      }
    };
  }

  // Cost-conscious simple tasks use nano
  if (taskComplexity === 'simple' && budget === 'cost-conscious') {
    return {
      model: 'gpt-5-nano',
      gpt5Options: {
        verbosity: 'low',
        reasoningEffort: 'minimal',
        maxOutputTokens: 1000
      }
    };
  }

  // Default to mini for most use cases
  return {
    model: 'gpt-5-mini',
    gpt5Options: {
      verbosity: 'medium',
      reasoningEffort: 'medium',
      maxOutputTokens: 2000
    }
  };
}

type ContentFormat = 'linkedin' | 'twitter' | 'instagram' | 'facebook';

// GPT-5 specific types
type GPT5Verbosity = 'low' | 'medium' | 'high';
type GPT5ReasoningEffort = 'minimal' | 'low' | 'medium' | 'high';

interface GPT5Options {
  verbosity?: GPT5Verbosity;
  reasoningEffort?: GPT5ReasoningEffort;
  maxOutputTokens?: number;
}

interface GenerateContentOptions {
  title: string;
  description: string;
  format: string;
  tone?: string;
  targetAudience?: string;
  model?: string;
  includeReasoning?: boolean;
  reasoningSummary?: boolean;
  encryptedReasoning?: boolean;
  // GPT-5 specific options
  gpt5Options?: GPT5Options;
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
  gpt5Options,
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

    // GPT-5 models use enhanced API with new parameters
    if (selectedModel.supportsGPT5Features) {
      try {
        return await generateWithGPT5API(openai, selectedModel, prompt, gpt5Options || {});
      } catch (gpt5Error: any) {
        // If GPT-5 model fails, fallback to GPT-4o
        console.warn(`GPT-5 model ${selectedModel.id} failed:`, gpt5Error.message);
        console.log('Falling back to GPT-4o model...');
        
        const fallbackModel = AVAILABLE_MODELS.find(m => m.id === 'gpt-4o');
        if (!fallbackModel) {
          throw new Error('Fallback model not available');
        }
        
        return await generateWithChatAPI(openai, fallbackModel, prompt);
      }
    }
    // Use Responses API for reasoning models, Chat API for others
    else if (selectedModel.api === 'responses' && selectedModel.supportsReasoning) {
      try {
        return await generateWithReasoningAPI(openai, selectedModel, prompt, {
          includeReasoning,
          reasoningSummary,
          encryptedReasoning
        });
      } catch (reasoningError: any) {
        // If reasoning model fails (e.g., organization not verified), fallback to GPT-4o
        console.warn(`Reasoning model ${selectedModel.id} failed:`, reasoningError.message);
        console.log('Falling back to GPT-4o model...');
        
        const fallbackModel = AVAILABLE_MODELS.find(m => m.id === 'gpt-4o');
        if (!fallbackModel) {
          throw new Error('Fallback model not available');
        }
        
        return await generateWithChatAPI(openai, fallbackModel, prompt);
      }
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

// New function for GPT-5 API with enhanced parameters
async function generateWithGPT5API(
  openai: any,
  model: any,
  prompt: string,
  gpt5Options: GPT5Options
): Promise<GeneratedContent> {
  const {
    verbosity = 'medium',
    reasoningEffort = 'medium',
    maxOutputTokens = model.maxOutputTokens || 2000
  } = gpt5Options;

  // GPT-5 can use both Chat Completions and Responses API
  // Use Chat Completions for better compatibility initially
  const requestConfig: any = {
    model: model.id,
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
    verbosity: verbosity,
    reasoning_effort: reasoningEffort,
    max_tokens: Math.min(maxOutputTokens, model.maxOutputTokens || 128000)
  };

  console.log('Using GPT-5 API with config:', requestConfig);

  const response = await openai.chat.completions.create(requestConfig);

  const content = response.choices[0]?.message?.content || '';
  console.log('GPT-5 API response:', content);

  if (!content) {
    throw new Error('No content generated from GPT-5 model');
  }

  // Parse the structured response (same format as other models)
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

  console.log('Processed GPT-5 content:', result);
  return result;
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
    // Remove temperature for reasoning models - they don't support it
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
  
  console.log('Responses API response:', JSON.stringify(response, null, 2));

  // Extract content from response using proper structure
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

// New specialized reasoning functions
export async function analyzeContentWithReasoning({
  content,
  contentType,
  targetAudience,
  brandVoice,
  model = 'o4-mini',
  includeStepByStep = true,
  includeConfidence = true
}: {
  content: string;
  contentType: string;
  targetAudience: string;
  brandVoice: string;
  model?: string;
  includeStepByStep?: boolean;
  includeConfidence?: boolean;
}): Promise<{
  analysis: any;
  reasoning: {
    steps: string[];
    confidence: number;
    summary: string;
  };
}> {
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === model);
  if (!selectedModel?.supportsReasoning) {
    throw new Error(`Model ${model} does not support reasoning`);
  }

  const prompt = `Analyze this ${contentType} content step by step:

Content: "${content}"

Target Audience: ${targetAudience}
Brand Voice: ${brandVoice}

Please provide a detailed analysis including:
1. Content quality assessment
2. Audience alignment
3. Brand voice consistency
4. Engagement potential
5. Improvement suggestions

Format your response as:
Analysis:
[Your detailed analysis]

Confidence Score:
[0-100 score with explanation]

Key Insights:
[3-5 key insights]

Recommendations:
[3-5 specific recommendations]`;

  const openai = getOpenAIClient();
  
  const requestConfig: any = {
    model: selectedModel.id,
    input: [{ role: 'user', content: prompt }],
    reasoning: {
      summary: 'auto'
    }
  };

  if (includeStepByStep) {
    requestConfig.reasoning.step_by_step = true;
  }

  const response = await openai.responses.create(requestConfig);
  
  const messageOutput = response.output.find((item: any) => item.type === 'message');
  const reasoningOutput = response.output.find((item: any) => item.type === 'reasoning');

  const responseContent = messageOutput?.content?.[0]?.text || '';
  
  // Parse the structured analysis
  const analysisMatch = responseContent.match(/Analysis:\s*([\s\S]*?)(?=Confidence Score:|$)/);
  const confidenceMatch = responseContent.match(/Confidence Score:\s*(\d+)/);
  const insightsMatch = responseContent.match(/Key Insights:\s*([\s\S]*?)(?=Recommendations:|$)/);
  const recommendationsMatch = responseContent.match(/Recommendations:\s*([\s\S]*?)$/);

  return {
    analysis: {
      content: analysisMatch?.[1]?.trim() || '',
      confidence: parseInt(confidenceMatch?.[1] || '0'),
      insights: insightsMatch?.[1]?.trim().split('\n').filter((s: string) => s.trim()) || [],
      recommendations: recommendationsMatch?.[1]?.trim().split('\n').filter((s: string) => s.trim()) || []
    },
    reasoning: {
      steps: reasoningOutput?.steps?.map((step: any) => step.content) || [],
      confidence: reasoningOutput?.confidence || 0,
      summary: reasoningOutput?.summary?.[0]?.text || ''
    }
  };
}

export async function generateStrategicContent({
  topic,
  audience,
  goals,
  constraints,
  model = 'o3',
  includeReasoning = true
}: {
  topic: string;
  audience: string;
  goals: string[];
  constraints: string[];
  model?: string;
  includeReasoning?: boolean;
}): Promise<{
  strategy: any;
  content: GeneratedContent;
  reasoning?: {
    steps: string[];
    confidence: number;
    summary: string;
  };
}> {
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === model);
  if (!selectedModel?.supportsReasoning) {
    throw new Error(`Model ${model} does not support reasoning`);
  }

  const prompt = `Create a strategic content plan and generate content for:

Topic: ${topic}
Target Audience: ${audience}
Goals: ${goals.join(', ')}
Constraints: ${constraints.join(', ')}

Please provide:
1. Strategic analysis of the content approach
2. Content strategy recommendations
3. Generated content that aligns with the strategy

Format your response as:
Strategy Analysis:
[Your strategic analysis]

Content Strategy:
[3-5 strategic recommendations]

Post Text:
[Generated content]

Hashtags:
[Strategic hashtags]

Call to Action:
[Strategic call to action]`;

  const openai = getOpenAIClient();
  
  const requestConfig: any = {
    model: selectedModel.id,
    input: [{ role: 'user', content: prompt }]
  };

  if (includeReasoning) {
    requestConfig.reasoning = {
      summary: 'auto',
      step_by_step: true
    };
  }

  const response = await openai.responses.create(requestConfig);
  
  const messageOutput = response.output.find((item: any) => item.type === 'message');
  const reasoningOutput = response.output.find((item: any) => item.type === 'reasoning');

  const responseContent = messageOutput?.content?.[0]?.text || '';
  
  // Parse the structured response
  const strategyMatch = responseContent.match(/Strategy Analysis:\s*([\s\S]*?)(?=Content Strategy:|$)/);
  const contentStrategyMatch = responseContent.match(/Content Strategy:\s*([\s\S]*?)(?=Post Text:|$)/);
  const postTextMatch = responseContent.match(/Post Text:\s*([\s\S]*?)(?=Hashtags:|$)/);
  const hashtagsMatch = responseContent.match(/Hashtags:\s*([\s\S]*?)(?=Call to Action:|$)/);
  const callToActionMatch = responseContent.match(/Call to Action:\s*([\s\S]*?)$/);

  const result: any = {
    strategy: {
      analysis: strategyMatch?.[1]?.trim() || '',
      recommendations: contentStrategyMatch?.[1]?.trim().split('\n').filter((s: string) => s.trim()) || []
    },
    content: {
      postText: postTextMatch?.[1]?.trim() || '',
      hashtags: hashtagsMatch?.[1]
        ? hashtagsMatch[1]
            .trim()
            .split(/\s+/)
            .filter((tag: string) => tag.startsWith('#'))
            .map((tag: string) => tag.substring(1))
        : [],
      callToAction: callToActionMatch?.[1]?.trim() || ''
    }
  };

  if (includeReasoning && reasoningOutput) {
    result.reasoning = {
      steps: reasoningOutput.steps?.map((step: any) => step.content) || [],
      confidence: reasoningOutput.confidence || 0,
      summary: reasoningOutput.summary?.[0]?.text || ''
    };
  }

  return result;
}

export async function generateStepByStepContent({
  topic,
  steps,
  model = 'o4-mini',
  includeReasoning = true
}: {
  topic: string;
  steps: string[];
  model?: string;
  includeReasoning?: boolean;
}): Promise<{
  content: GeneratedContent;
  reasoning: {
    steps: string[];
    confidence: number;
    summary: string;
  };
}> {
  const selectedModel = AVAILABLE_MODELS.find(m => m.id === model);
  if (!selectedModel?.supportsReasoning) {
    throw new Error(`Model ${model} does not support reasoning`);
  }

  const prompt = `Create content about "${topic}" following these steps:
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

Please think through each step carefully and create engaging content that follows this process.

Format your response as:
Post Text:
[Content following the step-by-step process]

Hashtags:
[Relevant hashtags]

Call to Action:
[Compelling call to action]`;

  const openai = getOpenAIClient();
  
  const requestConfig: any = {
    model: selectedModel.id,
    input: [{ role: 'user', content: prompt }],
    reasoning: {
      summary: 'auto',
      step_by_step: true
    }
  };

  const response = await openai.responses.create(requestConfig);
  
  const messageOutput = response.output.find((item: any) => item.type === 'message');
  const reasoningOutput = response.output.find((item: any) => item.type === 'reasoning');

  const content = messageOutput?.content?.[0]?.text || '';
  
  // Parse the structured response
  const postTextMatch = content.match(/Post Text:\s*([\s\S]*?)(?=Hashtags:|$)/);
  const hashtagsMatch = content.match(/Hashtags:\s*([\s\S]*?)(?=Call to Action:|$)/);
  const callToActionMatch = content.match(/Call to Action:\s*([\s\S]*?)$/);

  return {
    content: {
      postText: postTextMatch?.[1]?.trim() || '',
      hashtags: hashtagsMatch?.[1]
        ? hashtagsMatch[1]
            .trim()
            .split(/\s+/)
            .filter((tag: string) => tag.startsWith('#'))
            .map((tag: string) => tag.substring(1))
        : [],
      callToAction: callToActionMatch?.[1]?.trim() || ''
    },
    reasoning: {
      steps: reasoningOutput?.steps?.map((step: any) => step.content) || [],
      confidence: reasoningOutput?.confidence || 0,
      summary: reasoningOutput?.summary?.[0]?.text || ''
    }
  };
}

export default getOpenAIClient(); 