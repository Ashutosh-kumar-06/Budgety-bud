import { AIProvider, ChatMessage } from './types';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private endpoint = 'https://api.anthropic.com/v1/messages';

  constructor() {
    this.apiKey = env.ANTHROPIC_API_KEY;
    if (!this.apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set');
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) throw new AppError('Anthropic API key not configured', 500);

    // Anthropic API separates system prompt from messages
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const filteredMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        system: systemMessage,
        messages: filteredMessages,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API Error:', errorData);
      throw new AppError('Error communicating with Anthropic', 502);
    }

    const data: any = await response.json();
    return data.content[0].text;
  }
}
