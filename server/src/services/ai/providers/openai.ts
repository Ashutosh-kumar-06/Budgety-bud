/**
 * PocketBuddy — OpenAI Provider Adapter
 * =======================================
 * Implements the AIProvider interface using plain `fetch` calls
 * to the OpenAI Chat Completions API.  No openai npm package needed.
 *
 * Endpoint: https://api.openai.com/v1/chat/completions
 */

import {
  AIProvider,
  AIProviderConfig,
  ChatMessage,
  ChatOptions,
  ChatResponse,
} from '../types';
import { AppError } from '../../../types';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new AppError('OpenAI API key is not configured', 500, false);
    }
    this.apiKey = config.apiKey;
    this.defaultModel = config.model || 'gpt-4o';
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const model = options?.model ?? this.defaultModel;

    const body = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
    };

    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new AppError(
        `OpenAI request failed: ${(err as Error).message}`,
        502,
      );
    }

    const data = await response.json();

    // ── Handle API-level errors ──────────────────────────
    if (!response.ok) {
      const errMsg = data?.error?.message ?? 'Unknown OpenAI error';
      const status = response.status;

      if (status === 429) {
        throw new AppError('OpenAI rate limit exceeded — try again later', 429);
      }
      if (status === 401) {
        throw new AppError('Invalid OpenAI API key', 500, false);
      }

      throw new AppError(`OpenAI error (${status}): ${errMsg}`, 502);
    }

    // ── Parse successful response ────────────────────────
    const choice = data.choices?.[0];
    if (!choice?.message?.content) {
      throw new AppError('Empty response from OpenAI', 502);
    }

    return {
      content: choice.message.content,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens: data.usage.total_tokens ?? 0,
          }
        : undefined,
      model: data.model ?? model,
      provider: this.name,
    };
  }
}
