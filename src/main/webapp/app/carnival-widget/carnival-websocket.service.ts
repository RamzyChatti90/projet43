import { Injectable } from '@angular/core';
import { Observable, Subject, EMPTY } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap } from 'rxjs/operators';

// --- Interfaces ---

/**
 * Interface for messages sent by the user to the AI.
 */
export interface CarnivalUserMessage {
  type: 'user_message';
  content: string;
}

/**
 * Interface for the payload of a ticket suggestion, mirroring the backend's CarnivalTicketRequestVM.
 */
export interface CarnivalTicketSuggestionPayload {
  title: string;
  description: string;
  type: string; // e.g., 'BUG', 'FEATURE', 'SUPPORT'
  priority: string; // e.g., 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  suggestedByAI: boolean;
  originalUserInput: string;
}

/**
 * Interface for messages received from the AI.
 */
export interface CarnivalAIMessage {
  type: 'ai_response' | 'ticket_suggestion'; // Type of AI response
  content?: string; // The chat message content (optional, for 'ai_response' type)
  ticket?: CarnivalTicketSuggestionPayload; // The suggested ticket data (optional, for 'ticket_suggestion' type)
}

@Injectable({
  providedIn: 'root'
})
export class CarnivalWebsocketService {
  private socket$!: WebSocketSubject<CarnivalUserMessage | CarnivalAIMessage>;
  private messagesSubject = new Subject<CarnivalAIMessage>();
  public messages$: Observable<CarnivalAIMessage> = this.messagesSubject.asObservable();

  // Placeholder for the WebSocket URL. In a real JHipster app, this would be configured
  // (e.g., from environment.ts or a configuration service) to point to the backend's gateway.
  private readonly WEBSOCKET_URL = 'ws://localhost:8080/api/carnival-widget/websocket';

  constructor() {}

  /**
   * Establishes a WebSocket connection to the YAMZY API via the backend gateway.
   * If already connected or an attempt is ongoing, this method does nothing.
   */
  public connect(): void {
    // Only connect if not already connected or the previous socket is closed
    if (!this.socket$ || this.socket$.closed) {
      console.log('CarnivalWebsocketService: Attempting to connect to WebSocket at', this.WEBSOCKET_URL);

      this.socket$ = webSocket<CarnivalUserMessage | CarnivalAIMessage>({
        url: this.WEBSOCKET_URL,
        // Observer for when the WebSocket connection successfully opens
        openObserver: {
          next: () => {
            console.log('CarnivalWebsocketService: WebSocket connection established.');
          }
        },
        // Observer for when the WebSocket connection closes
        closeObserver: {
          next: () => {
            console.log('CarnivalWebsocketService: WebSocket connection closed.');
            // Complete the messages subject to inform all subscribers that the stream is no longer active
            this.messagesSubject.complete();
          }
        },
        // Function to serialize outgoing messages into a string (JSON) format for the WebSocket
        serializer: (msg: CarnivalUserMessage) => JSON.stringify(msg),
        // Function to deserialize incoming messages from the WebSocket into our defined interface
        deserializer: (event: MessageEvent) => {
          try {
            return JSON.parse(event.data) as CarnivalAIMessage;
          } catch (e) {
            console.error('CarnivalWebsocketService: Error parsing incoming WebSocket message:', e, 'Raw data:', event.data);
            throw e; // Re-throw to be caught by the catchError operator below
          }
        }
      });

      // Subscribe to the WebSocket to start receiving messages and handle stream errors
      this.socket$.pipe(
        // Tap into the stream to push received messages to our internal Subject
        tap(message => this.messagesSubject.next(message)),
        // Handle any errors that occur within the WebSocket stream
        catchError(error => {
          console.error('CarnivalWebsocketService: WebSocket stream error:', error);
          // Push the error to subscribers
          this.messagesSubject.error(error);
          // Return EMPTY to complete the observable, preventing further emissions from this stream
          return EMPTY;
        })
      ).subscribe({
        error: err => console.error('CarnivalWebsocketService: WebSocket subscription error:', err),
        complete: () => console.log('CarnivalWebsocketService: WebSocket subscription completed.')
      });
    }
  }

  /**
   * Sends a user message to the AI via the WebSocket connection.
   * @param message The user's input string.
   */
  public sendMessage(message: string): void {
    if (this.socket$ && !this.socket$.closed) {
      const userMessage: CarnivalUserMessage = {
        type: 'user_message',
        content: message
      };
      this.socket$.next(userMessage);
    } else {
      console.error('CarnivalWebsocketService: WebSocket is not connected. Cannot send message:', message);
      // In a production scenario, you might want to queue the message or attempt to reconnect automatically.
    }
  }

  /**
   * Disconnects the WebSocket connection.
   */
  public disconnect(): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.complete(); // This completes the WebSocketSubject and closes the underlying WebSocket connection
      console.log('CarnivalWebsocketService: WebSocket disconnected.');
    }
  }
}