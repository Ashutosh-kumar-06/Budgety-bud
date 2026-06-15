import { AIProvider } from './types'

class OpenAIProvider implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      // TODO: Implement OpenAI API call
      // This is a placeholder implementation
      return `OpenAI response to: "${prompt}"`
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to get response from OpenAI')
    }
  }
}

export default OpenAIProvider
