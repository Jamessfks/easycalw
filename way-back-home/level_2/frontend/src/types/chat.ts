// Chat message types

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    highlightNodes?: string[];
    highlightEdges?: string[];
}

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    attachments?: { id: string; path: string; mime_type: string }[];
}

export interface ChatResponse {
    answer: string;
    gql_query?: string;
    nodes_to_highlight: string[];
    edges_to_highlight: string[];
    suggested_followups: string[];
    conversation_id?: string;
}
