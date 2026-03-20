import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs'; // For Promise-based API calls

// --- Interfaces for data models ---
export interface CarnivalTicketRequest {
  title: string;
  description: string;
  type: string;
  priority: string;
  suggestedByAI: boolean;
  originalUserInput: string;
}

export interface CarnivalMessage {
  id: string; // Unique identifier for each message
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  type: 'chat' | 'ticket-suggestion'; // 'chat' or 'ticket-suggestion'
  ticketSuggestion?: CarnivalTicketRequest;
  status?: 'pending' | 'confirmed' | 'rejected'; // For ticket suggestions
}

@Component({
  selector: 'app-carnival-widget',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, HttpClientModule],
  template: `
    <div class="carnival-widget-container">
      <!-- Floating Widget Toggle Button -->
      <button class="carnival-toggle-button" (click)="toggleWidget()">
        <span *ngIf="!isWidgetOpen">🎪</span>
        <span *ngIf="isWidgetOpen">✖️</span>
      </button>

      <!-- Widget Chat Window -->
      <div class="carnival-chat-window" *ngIf="isWidgetOpen">
        <div class="carnival-header">CARNIVAL AI Chat & Ticketing</div>
        <div class="carnival-messages" #messageContainer>
          <div *ngFor="let message of messages" class="message" [ngClass]="message.sender">
            <div class="message-content">
              <strong>{{ message.sender === 'user' ? 'You' : 'Carnival AI' }}:</strong>
              <p>{{ message.text }}</p>
              <ng-container *ngIf="message.type === 'ticket-suggestion' && message.ticketSuggestion">
                <div class="ticket-suggestion" [ngClass]="message.status">
                  <h4>Ticket Suggestion:</h4>
                  <p><strong>Title:</strong> {{ message.ticketSuggestion.title }}</p>
                  <p><strong>Description:</strong> {{ message.ticketSuggestion.description }}</p>
                  <p><strong>Type:</strong> {{ message.ticketSuggestion.type }}</p>
                  <p><strong>Priority:</strong> {{ message.ticketSuggestion.priority }}</p>
                  <div *ngIf="message.status === 'pending'" class="ticket-actions">
                    <button class="confirm-button" (click)="confirmTicket(message.id)">Confirm</button>
                    <button class="reject-button" (click)="rejectTicket(message.id)">Reject</button>
                  </div>
                  <div *ngIf="message.status === 'confirmed'" class="ticket-status confirmed">✅ Ticket Confirmed!</div>
                  <div *ngIf="message.status === 'rejected'" class="ticket-status rejected">❌ Ticket Rejected.</div>
                </div>
              </ng-container>
              <span class="timestamp">{{ message.timestamp | date:'shortTime' }}</span>
            </div>
          </div>
          <div *ngIf="isLoading" class="message ai loading">
            <div class="message-content">
              <strong>Carnival AI:</strong>
              <p>Thinking...</p>
            </div>
          </div>
        </div>
        <div class="carnival-input-area">
          <input
            [(ngModel)]="userInput"
            (keyup.enter)="sendMessage()"
            placeholder="Type your message..."
            [disabled]="isLoading"
          />
          <button (click)="sendMessage()" [disabled]="!userInput.trim() || isLoading">Send</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .carnival-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .carnival-toggle-button {
      background-color: #ff5252; /* CARNIVAL red */
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease-in-out;
    }

    .carnival-toggle-button:hover {
      transform: scale(1.05);
    }

    .carnival-chat-window {
      position: absolute;
      bottom: 80px; /* Above the toggle button */
      right: 0;
      width: 350px;
      height: 500px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .carnival-header {
      background-color: #ff5252;
      color: white;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
    }

    .carnival-messages {
      flex-grow: 1;
      padding: 10px;
      overflow-y: auto;
      background-color: #f0f2f5;
    }

    .message {
      display: flex;
      margin-bottom: 10px;
    }

    .message.user {
      justify-content: flex-end;
    }

    .message.ai {
      justify-content: flex-start;
    }

    .message-content {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 18px;
      line-height: 1.4;
      position: relative;
    }

    .message.user .message-content {
      background-color: #007bff; /* JHipster primary blue */
      color: white;
      border-bottom-right-radius: 4px;
    }

    .message.ai .message-content {
      background-color: #e4e6eb;
      color: #333;
      border-bottom-left-radius: 4px;
    }

    .message p {
      margin: 0;
    }

    .timestamp {
      display: block;
      font-size: 0.7em;
      color: #777;
      text-align: right;
      margin-top: 5px;
    }

    .carnival-input-area {
      display: flex;
      padding: 10px;
      border-top: 1px solid #eee;
    }

    .carnival-input-area input {
      flex-grow: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 20px;
      margin-right: 10px;
      outline: none;
    }

    .carnival-input-area button {
      background-color: #ff5252;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 10px 15px;
      cursor: pointer;
      font-weight: bold;
    }

    .carnival-input-area button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .ticket-suggestion {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 8px;
      padding: 10px;
      margin-top: 10px;
      color: #664d03;
    }
    .ticket-suggestion h4 {
      margin-top: 0;
      color: #664d03;
    }
    .ticket-suggestion p {
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .ticket-actions {
      margin-top: 10px;
      display: flex;
      gap: 10px;
    }
    .ticket-actions button {
      padding: 8px 15px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-weight: bold;
    }
    .confirm-button {
      background-color: #28a745; /* Green */
      color: white;
    }
    .reject-button {
      background-color: #dc3545; /* Red */
      color: white;
    }
    .ticket-status {
      margin-top: 10px;
      padding: 5px 10px;
      border-radius: 5px;
      font-weight: bold;
    }
    .ticket-status.confirmed {
      background-color: #d4edda;
      color: #155724;
    }
    .ticket-status.rejected {
      background-color: #f8d7da;
      color: #721c24;
    }
  `,
})
export class CarnivalWidgetComponent implements OnInit, OnDestroy {
  isWidgetOpen = false;
  messages: CarnivalMessage[] = [];
  userInput = '';
  isLoading = false;

  private webSocket: WebSocket | undefined;
  private readonly WEBSOCKET_URL = 'ws://localhost:8080/websocket/yamzy'; // Example WebSocket endpoint for YAMZY API
  private readonly API_URL = '/api/carnival/tickets/confirm-dispatch'; // Endpoint for ticket confirmation

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Optionally connect on init if widget should be open by default or in specific scenarios
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  toggleWidget(): void {
    this.isWidgetOpen = !this.isWidgetOpen;
    if (this.isWidgetOpen) {
      this.connectWebSocket();
    } else {
      this.disconnectWebSocket();
    }
  }

  private connectWebSocket(): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected.');
      return;
    }

    this.webSocket = new WebSocket(this.WEBSOCKET_URL);

    this.webSocket.onopen = (event) => {
      console.log('WebSocket connected:', event);
      // Send a welcome message from AI or initial context if needed
      this.messages.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: 'Hello! I am Carnival AI. How can I assist you today?',
        timestamp: new Date(),
        type: 'chat',
      });
      this.scrollToBottom();
    };

    this.webSocket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      this.isLoading = false;
      try {
        const aiResponse = JSON.parse(event.data);
        this.handleAiMessage(aiResponse);
      } catch (e) {
        console.error('Failed to parse AI message:', e);
        this.messages.push({
          id: this.generateUniqueId(),
          sender: 'ai',
          text: 'Sorry, I received an invalid response from the AI.',
          timestamp: new Date(),
          type: 'chat',
        });
      }
      this.scrollToBottom();
    };

    this.webSocket.onerror = (event) => {
      console.error('WebSocket error:', event);
      this.isLoading = false;
      this.messages.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: 'Connection error. Please try again later.',
        timestamp: new Date(),
        type: 'chat',
      });
      this.disconnectWebSocket(); // Attempt to reconnect or show error
      this.scrollToBottom();
    };

    this.webSocket.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.isLoading = false;
      if (this.isWidgetOpen) { // Only show message if widget is intended to be open
        this.messages.push({
          id: this.generateUniqueId(),
          sender: 'ai',
          text: 'WebSocket connection closed. Attempting to reconnect...',
          timestamp: new Date(),
          type: 'chat',
        });
        // Optional: Reconnect logic here
        // setTimeout(() => this.connectWebSocket(), 3000);
      }
      this.scrollToBottom();
    };
  }

  private disconnectWebSocket(): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.close();
      this.webSocket = undefined;
      console.log('WebSocket disconnected.');
    }
  }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) {
      return;
    }

    const userMessage: CarnivalMessage = {
      id: this.generateUniqueId(),
      sender: 'user',
      text: this.userInput,
      timestamp: new Date(),
      type: 'chat',
    };
    this.messages.push(userMessage);

    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.isLoading = true;
      // YAMZY API expects a JSON object. The structure `query` and `originalUserInput` is an example.
      this.webSocket.send(JSON.stringify({ query: this.userInput, originalUserInput: this.userInput }));
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
      this.messages.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: 'Error: Not connected to AI. Please reopen the widget to establish connection.',
        timestamp: new Date(),
        type: 'chat',
      });
      this.isLoading = false;
    }

    this.userInput = '';
    this.scrollToBottom();
  }

  private handleAiMessage(aiResponse: any): void {
    // Expected structure of AI response from YAMZY (adapt based on actual API spec):
    // { type: 'chat', content: '...' }
    // { type: 'ticket_suggestion', content: { title: '...', description: '...', type: '...', priority: '...' }, originalUserInput: '...' }

    if (aiResponse.type === 'ticket_suggestion' && aiResponse.content) {
      const suggestedTicket: CarnivalTicketRequest = {
        title: aiResponse.content.title || 'Untitled Ticket',
        description: aiResponse.content.description || 'No description provided.',
        type: aiResponse.content.type || 'Task',
        priority: aiResponse.content.priority || 'Medium',
        suggestedByAI: true,
        originalUserInput: aiResponse.originalUserInput || '',
      };

      this.messages.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: 'I suggest creating a ticket based on your request:',
        timestamp: new Date(),
        type: 'ticket-suggestion',
        ticketSuggestion: suggestedTicket,
        status: 'pending',
      });
    } else { // Default to a standard chat message
      this.messages.push({
        id: this.generateUniqueId(),
        sender: 'ai',
        text: aiResponse.content || 'I did not understand your request.',
        timestamp: new Date(),
        type: 'chat',
      });
    }
  }

  async confirmTicket(messageId: string): Promise<void> {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message && message.type === 'ticket-suggestion' && message.ticketSuggestion && message.status === 'pending') {
      message.status = 'pending_confirmation'; // Indicate UI is waiting for API response
      try {
        // Send the ticket suggestion to the backend for confirmation and dispatch
        await lastValueFrom(this.http.post<any>(this.API_URL, message.ticketSuggestion));
        message.status = 'confirmed';
        message.text = 'Ticket suggestion confirmed!'; // Update message text for clarity
        console.log('Ticket confirmed and dispatched:', message.ticketSuggestion);
      } catch (error) {
        console.error('Failed to confirm and dispatch ticket:', error);
        message.status = 'pending'; // Revert status if API fails
        alert('Failed to confirm ticket. Please try again.');
      } finally {
        this.scrollToBottom();
      }
    }
  }

  rejectTicket(messageId: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message && message.type === 'ticket-suggestion' && message.status === 'pending') {
      message.status = 'rejected';
      message.text = 'Ticket suggestion rejected.'; // Update message text for clarity
      console.log('Ticket suggestion rejected.');
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    // Using setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      const messageContainer = document.querySelector('.carnival-messages');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}