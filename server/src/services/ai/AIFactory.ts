import { AIProvider } from './types';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { env } from '../../config/env';

export class AIFactory {
  static getProvider(): AIProvider {
    switch (env.AI_PROVIDER.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      case 'gemini':
        return new GeminiProvider();
      default:
        console.warn(`Unsupported AI_PROVIDER: ${env.AI_PROVIDER}. Defaulting to OpenAI.`);
        return new OpenAIProvider();
    }
  }
}
