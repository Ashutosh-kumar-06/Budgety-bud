export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  chat(messages: ChatMessage[]): Promise<string>;
  streamChat?(messages: ChatMessage[], onChunk: (chunk: string) => void): Promise<void>;
}
