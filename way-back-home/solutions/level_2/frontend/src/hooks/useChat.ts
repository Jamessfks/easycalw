import { useState } from 'react';
import { chatService } from '../services/chatService';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about the survivor network.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (content: string) => {
        setMessages(prev => [...prev, { role: 'user', content }]);
        setIsLoading(true);
        try {
            const response = await chatService.sendMessage(content);
            setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
            // We can handle highlighting nodes here or return it to be handled by a coordinator
            return response;
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the server.' }]);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        sendMessage,
        isLoading
    };
};
