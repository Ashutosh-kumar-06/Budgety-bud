import { AIProvider } from './types'

class MockAIProvider implements AIProvider {
  async generateResponse(prompt: string): Promise<string> {
    // Mock responses for different types of queries
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('budget')) {
      return "Great question about budgeting! Here are some tips: 1) Set realistic limits based on your income, 2) Track expenses regularly, 3) Use the 50/30/20 rule (needs/wants/savings)"
    }

    if (lowerPrompt.includes('save') || lowerPrompt.includes('saving')) {
      return "Saving is a great habit! Start small with 5-10% of your income. Try the 52-week challenge or automate transfers to a savings account."
    }

    if (lowerPrompt.includes('stress') || lowerPrompt.includes('anxiety')) {
      return "I hear you. Financial stress is common for students. Remember: This is temporary, you have control, and small steps matter. Would you like to talk about specific concerns?"
    }

    return `That's an interesting question. Based on what I know about personal finance and wellness, I'd recommend thinking about your goals, creating a plan, and tracking your progress. Is there something specific you'd like help with?`
  }
}

export default MockAIProvider
