import { useState, useCallback } from 'react';

export type MessageRole = 'bot' | 'user';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  productLinks?: Array<{ id: bigint; name: string }>;
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: "Welcome to Jade! ✨ I'm your personal style advisor. I'll help you find the perfect outfit. Shall we begin?",
      timestamp: new Date(),
    }
  ]);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  }, []);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content: "Welcome to Jade! ✨ I'm your personal style advisor. I'll help you find the perfect outfit. Shall we begin?",
        timestamp: new Date(),
      }
    ]);
  }, []);

  return { messages, addMessage, resetChat };
}
