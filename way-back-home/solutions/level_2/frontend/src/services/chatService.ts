import { api } from './api';
import type { ChatRequest, ChatResponse } from '../types/chat';

export const chatService = {
    // Send message to AI
    async sendMessage(message: string, conversationId?: string | null, attachments?: { id: string; path: string; mime_type: string }[]): Promise<ChatResponse> {
        const request: ChatRequest = {
            message,
            conversation_id: conversationId || undefined,
            attachments,
        };

        const response = await api.post('/api/chat', request);
        return response.data;
    },

    // Get suggested questions (if backend supports this endpoint)
    async getSuggestions(): Promise<string[]> {
        try {
            const response = await api.get('/api/chat/suggestions');
            return response.data;
        } catch (error) {
            // Return default suggestions if endpoint doesn't exist
            return [
                'Who can help with medical emergencies?',
                'Show me all survivors and their locations',
                'What urgent needs exist?',
                'How are the survivors connected?',
            ];
        }
    },
};
