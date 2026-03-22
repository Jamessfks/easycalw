import { create } from 'zustand';
import type { ChatMessage, ChatResponse } from '../types/chat';
import { chatService } from '../services/chatService';
import * as api from '../services/api';

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    suggestions: string[];
    conversationId: string | null;

    // Actions
    sendMessage: (message: string, files?: File[]) => Promise<ChatResponse | null>;
    loadSuggestions: () => Promise<void>;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [
        {
            role: 'assistant',
            content: 'Mission Control AI online. Scanning survivor network... Ready to process your queries. What would you like to know about the survivors?',
            timestamp: new Date().toISOString(),
        },
    ],
    isLoading: false,
    suggestions: [
        'Who can help with medical emergencies?',
        'Show me all survivors and their locations',
        'What urgent needs exist?',
        'How are the survivors connected?',
    ],
    conversationId: null,

    sendMessage: async (message, files?: File[]) => {
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
            // Add visual indicator for files if needed in local state
        };

        set((state) => ({
            messages: [...state.messages, userMessage],
            isLoading: true,
        }));

        try {
            // Upload files if present
            let uploadedAttachments: { id: string; path: string; mime_type: string }[] = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => api.uploadFile(file));
                uploadedAttachments = await Promise.all(uploadPromises);
            }

            const response = await chatService.sendMessage(message, get().conversationId, uploadedAttachments);

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.answer,
                timestamp: new Date().toISOString(),
                highlightNodes: response.nodes_to_highlight,
                highlightEdges: response.edges_to_highlight,
            };

            set((state) => ({
                messages: [...state.messages, assistantMessage],
                isLoading: false,
                conversationId: response.conversation_id || state.conversationId,
                suggestions: response.suggested_followups.length > 0
                    ? response.suggested_followups
                    : state.suggestions,
            }));

            return response;
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                role: 'system',
                content: `Error: ${error.message || 'Failed to send message. Please try again.'}`,
                timestamp: new Date().toISOString(),
            };

            set((state) => ({
                messages: [...state.messages, errorMessage],
                isLoading: false,
            }));

            return null;
        }
    },

    loadSuggestions: async () => {
        try {
            const suggestions = await chatService.getSuggestions();
            set({ suggestions });
        } catch (error) {
            console.error('Failed to load suggestions');
        }
    },

    clearChat: () => set({
        messages: [
            {
                role: 'assistant',
                content: 'Chat cleared. Mission Control AI ready for new queries.',
                timestamp: new Date().toISOString(),
            },
        ],
        conversationId: null,
    }),
}));
