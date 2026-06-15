/**
 * PocketBuddy — Anthropic (Claude) Provider Adapter
 * ===================================================
 * Implements the AIProvider interface using plain `fetch` calls
 * to the Anthropic Messages API.
 *
 * Key difference from OpenAI: the system prompt is a separate
 * top-level parameter, not a message in the messages array.
 *
 * Endpoint: https://api.anthropic.com/v1/messages
 */

import {
  AIProvider,
  AIProviderConfig,
  ChatMessage,
  ChatOptions,
  ChatResponse,
} from '../types';
import { AppError } from '../../../types';

export class AnthropicProvider implements AIProvider {
  public readonly name = 'anthropic';
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new AppError('Anthropic API key is not configured', 500, false);
    }
    this.apiKey = config.apiKey;
    this.defaultModel = config.model || 'claude-sonnet-4-20250514';
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const model = options?.model ?? this.defaultModel;

    // Anthropic requires the system message as a separate param
    const systemMsg = messages.find((m) => m.role === 'system');
    const nonSystemMsgs = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const body: Record<string, unknown> = {
      model,
      max_tokens: options?.maxTokens ?? 1024,
      messages: nonSystemMsgs,
    };

    if (systemMsg) {
      body.system = systemMsg.content;
    }

    if (options?.temperature !== undefined) {
      body.temperature = options.temperature;
    }

    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new AppError(
        `Anthropic request failed: ${(err as Error).message}`,
        502,
      );
    }

    const data = await response.json();

    // ── Handle API-level errors ──────────────────────────
    if (!response.ok) {
      const errMsg = data?.error?.message ?? 'Unknown Anthropic error';
      const status = response.status;

      if (status === 429) {
        throw new AppError('Anthropic rate limit exceeded — try again later', 429);
      }
      if (status === 401) {
        throw new AppError('Invalid Anthropic API key', 500, false);
      }

      throw new AppError(`Anthropic error (${status}): ${errMsg}`, 502);
    }

    // ── Parse successful response ────────────────────────
    // Anthropic returns content as an array of content blocks
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === 'text',
    );
    if (!textBlock?.text) {
      throw new AppError('Empty response from Anthropic', 502);
    }

    return {
      content: textBlock.text,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens ?? 0,
            completionTokens: data.usage.output_tokens ?? 0,
            totalTokens:
              (data.usage.input_tokens ?? 0) + (data.usage.output_tokens ?? 0),
          }
        : undefined,
      model: data.model ?? model,
      provider: this.name,
    };
  }
}
