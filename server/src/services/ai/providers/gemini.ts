/**
 * PocketBuddy — Google Gemini Provider Adapter
 * ==============================================
 * Implements the AIProvider interface using plain `fetch` calls
 * to the Gemini generateContent API.
 *
 * Key differences from OpenAI/Anthropic:
 *   - API key goes in the URL query string, not a header.
 *   - Message format uses `parts` arrays, not plain `content` strings.
 *   - System instruction is a separate top-level field.
 *
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 */

import {
  AIProvider,
  AIProviderConfig,
  ChatMessage,
  ChatOptions,
  ChatResponse,
} from '../types';
import { AppError } from '../../../types';

/** Map our role names to Gemini's expected role names. */
function mapRole(role: 'system' | 'user' | 'assistant'): string {
  // Gemini uses 'model' instead of 'assistant'
  return role === 'assistant' ? 'model' : role;
}

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private readonly apiKey: string;
  private readonly defaultModel: string;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new AppError('Gemini API key is not configured', 500, false);
    }
    this.apiKey = config.apiKey;
    this.defaultModel = config.model || 'gemini-2.0-flash';
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    const model = options?.model ?? this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    // Extract system instruction (Gemini handles it as a separate field)
    const systemMsg = messages.find((m) => m.role === 'system');
    const conversationMsgs = messages.filter((m) => m.role !== 'system');

    // Build Gemini's `contents` format
    const contents = conversationMsgs.map((m) => ({
      role: mapRole(m.role),
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    };

    if (systemMsg) {
      body.systemInstruction = {
        parts: [{ text: systemMsg.content }],
      };
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new AppError(
        `Gemini request failed: ${(err as Error).message}`,
        502,
      );
    }

    const data = await response.json();

    // ── Handle API-level errors ──────────────────────────
    if (!response.ok) {
      const errMsg =
        data?.error?.message ?? JSON.stringify(data?.error) ?? 'Unknown Gemini error';
      const status = response.status;

      if (status === 429) {
        throw new AppError('Gemini rate limit exceeded — try again later', 429);
      }
      if (status === 400 && errMsg.includes('API key')) {
        throw new AppError('Invalid Gemini API key', 500, false);
      }

      throw new AppError(`Gemini error (${status}): ${errMsg}`, 502);
    }

    // ── Parse successful response ────────────────────────
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.find(
      (p: { text?: string }) => typeof p.text === 'string',
    );

    if (!textPart?.text) {
      // Check for safety-block or empty response
      const blockReason = candidate?.finishReason;
      if (blockReason === 'SAFETY') {
        throw new AppError(
          'Response blocked by Gemini safety filters',
          422,
        );
      }
      throw new AppError('Empty response from Gemini', 502);
    }

    // Gemini token usage is in `usageMetadata`
    const usage = data.usageMetadata;

    return {
      content: textPart.text,
      usage: usage
        ? {
            promptTokens: usage.promptTokenCount ?? 0,
            completionTokens: usage.candidatesTokenCount ?? 0,
            totalTokens: usage.totalTokenCount ?? 0,
          }
        : undefined,
      model,
      provider: this.name,
    };
  }
}
