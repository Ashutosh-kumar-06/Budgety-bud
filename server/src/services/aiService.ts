import { AIFactory } from './ai/AIFactory';
import { ChatMessage } from './ai/types';
import * as transactionService from './transactionService';
import * as userService from './userService';

export const processUserChat = async (userId: string, userMessage: string): Promise<string> => {
  // We can fetch user context (balance, recent transactions) to make the AI smarter
  const profile = await userService.getUserProfile(userId);
  const transactions = await transactionService.getTransactions(userId);
  const recentTransactions = transactions.slice(0, 5); // Last 5

  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `You are PocketBuddy, a friendly and concise AI Financial & Wellness Assistant for college students.
User context: Name: ${profile.name}, Current Balance: $${profile.balance}.
Recent transactions: ${JSON.stringify(recentTransactions.map(t => ({ amount: t.amount, type: t.type, category: t.category })))}.
Provide actionable, brief, and supportive advice.`,
  };

  const messages: ChatMessage[] = [
    systemPrompt,
    { role: 'user', content: userMessage },
  ];

  const provider = AIFactory.getProvider();
  const reply = await provider.chat(messages);

  return reply;
};
