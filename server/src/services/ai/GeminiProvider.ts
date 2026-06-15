import { AIProvider, ChatMessage } from './types';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';

export class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY is not set');
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) throw new AppError('Gemini API key not configured', 500);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${this.apiKey}`;

    let systemText = '';
    const contents = [];
    
    for (const m of messages) {
      if (m.role === 'system') {
        systemText += m.content + '\\n\\n';
      } else {
        const role = m.role === 'assistant' ? 'model' : 'user';
        let text = m.content;
        if (role === 'user' && systemText) {
          text = systemText + text;
          systemText = '';
        }
        contents.push({ role, parts: [{ text }] });
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      throw new AppError('Error communicating with Gemini', 502);
    }

    const data: any = await response.json();
    if (!data.candidates || data.candidates.length === 0) {
      throw new AppError('No response from Gemini', 502);
    }
    
    return data.candidates[0].content.parts[0].text;
  }
}
