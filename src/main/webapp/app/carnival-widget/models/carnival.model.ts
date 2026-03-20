export interface ICarnivalChatMessage {
  id?: string; // Unique identifier for the message, useful for tracking in UI
  sender: 'user' | 'ai' | 'system';
  content: string; // The text content of the message
  timestamp: Date | string; // When the message was sent/received
  type: 'text' | 'ticket_suggestion' | 'loading' | 'error'; // Type of content, e.g., pure text, an AI ticket suggestion, a loading indicator
  ticketSuggestion?: ICarnivalTicketSuggestion; // Present if type is 'ticket_suggestion'
  isAcknowledged?: boolean; // For user messages, if the AI has processed it
}

export interface ICarnivalTicketSuggestion {
  id?: string; // Client-side ID for tracking this specific suggestion in the UI
  title: string;
  description: string;
  type: string; // e.g., 'BUG', 'FEATURE', 'SUPPORT', 'QUESTION'
  priority: string; // e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  suggestedByAI: boolean; // Should always be true for AI suggestions
  originalUserInput: string; // The user input that prompted this suggestion
  status?: 'pending' | 'confirmed' | 'rejected' | 'dispatched' | 'failed'; // Status of the suggestion in the UI flow
  dispatchDetails?: {
    externalTicketId: string;
    externalSystem: string;
    url?: string;
  };
  error?: string; // For handling dispatch failures
}

/**
 * Interface for messages sent from the Carnival widget (client) to the YAMZY AI WebSocket API.
 */
export interface ICarnivalWebSocketClientMessage {
  type: 'USER_CHAT_MESSAGE' | 'USER_TICKET_CONFIRMATION' | 'USER_TICKET_REJECTION';
  payload: {
    message?: string; // For USER_CHAT_MESSAGE
    ticketSuggestionId?: string; // Identifier for the suggestion being confirmed/rejected
    ticketDetails?: Omit<ICarnivalTicketSuggestion, 'id' | 'status' | 'dispatchDetails' | 'error'>; // Full details when confirming, potentially with user edits
  };
}

/**
 * Interface for messages received from the YAMZY AI WebSocket API (server) by the Carnival widget.
 */
export interface ICarnivalWebSocketServerMessage {
  type: 'AI_CHAT_MESSAGE' | 'AI_TICKET_SUGGESTION' | 'TICKET_DISPATCH_CONFIRMED' | 'TICKET_DISPATCH_FAILED' | 'ERROR';
  payload: {
    message?: string; // For AI_CHAT_MESSAGE or ERROR (general error message)
    suggestion?: ICarnivalTicketSuggestion; // For AI_TICKET_SUGGESTION
    ticketSuggestionId?: string; // Identifier for the suggestion that was confirmed/failed to dispatch
    dispatchDetails?: {
      externalTicketId: string;
      externalSystem: string;
      url?: string;
    }; // For TICKET_DISPATCH_CONFIRMED
    errorMessage?: string; // For TICKET_DISPATCH_FAILED or ERROR
  };
}

/**
 * Interface for the state of the Carnival widget.
 * Useful for local storage or global state management.
 */
export interface ICarnivalWidgetState {
  isOpen: boolean;
  chatMessages: ICarnivalChatMessage[];
  currentConversationId?: string; // To track a specific conversation with the AI
  isTyping?: boolean; // To indicate if the AI is typing
}