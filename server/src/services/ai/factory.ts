/**
 * PocketBuddy — AI Provider Factory
 * ====================================
 * Strategy Pattern factory that creates the correct AIProvider
 * based on configuration.
 *
 * `getAIProvider()` is the main entry point — it lazily creates
 * and caches a singleton so the app re-uses one provider instance.
 */

import { AIProvider, ChatMessage } from './types';
import { env } from '../../config/env';

// Import the root-level provider implementations (not ./providers/)
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';

/** Module-level singleton — lazily created on first call. */
let cachedProvider: AIProvider | null = null;

/**
 * Get the application-wide AIProvider singleton.
 * Reads `env.AI_PROVIDER` for provider name and the corresponding API key.
 *
 * The result is cached — subsequent calls return the same instance.
 * Call `resetAIProvider()` if you need to force re-creation (testing).
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const provider = env.AI_PROVIDER || 'openai';

  switch (provider) {
    case 'openai':
      cachedProvider = new OpenAIProvider();
      break;
    case 'anthropic':
      cachedProvider = new AnthropicProvider();
      break;
    case 'gemini':
      cachedProvider = new GeminiProvider();
      break;
    default:
      throw new Error(
        `Unknown AI provider: "${provider}". Supported: openai, anthropic, gemini`,
      );
  }

  console.log(`🤖  AI provider initialized: ${provider}`);
  return cachedProvider;
}

/**
 * Reset the cached provider (useful in tests or if hot-reloading config).
 */
export function resetAIProvider(): void {
  cachedProvider = null;
}
