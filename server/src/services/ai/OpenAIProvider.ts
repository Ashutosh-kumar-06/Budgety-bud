import { AIProvider, ChatMessage } from './types';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private endpoint = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = env.OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('OPENAI_API_KEY is not set');
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) throw new AppError('OpenAI API key not configured', 500);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new AppError('Error communicating with OpenAI', 502);
    }

    const data: any = await response.json();
    return data.choices[0].message.content;
  }
}
