import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(url = 'http://192.168.1.8:8080/bus-service/ws/bus') {
    if (this.client?.connected) {
      console.log('[WebSocket] Already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Get authentication token from localStorage
        const storedUser = localStorage.getItem('user');
        console.log('[WebSocket] Stored user:', storedUser ? 'Found' : 'Not found');
        
        let token = null;
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token;
            console.log('[WebSocket] Token extracted:', token ? `${token.substring(0, 20)}...` : 'Missing');
          } catch (e) {
            console.error('[WebSocket] Failed to parse stored user:', e);
          }
        }
        
        console.log('[WebSocket] Connecting with token:', token ? 'Present' : 'Missing');

        // Add token as query parameter if it exists
        const connectionUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
        console.log('[WebSocket] Connection URL:', connectionUrl.replace(token || '', '***TOKEN***'));

        this.client = new Client({
          webSocketFactory: () => {
            console.log('[WebSocket] Creating SockJS connection to:', connectionUrl.replace(token || '', '***TOKEN***'));
            return new SockJS(connectionUrl);
          },
          connectHeaders: {
            // Also try to add authorization header (for STOMP level)
            ...(token && { Authorization: `Bearer ${token}` })
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('[WebSocket] Connected successfully');
            this.reconnectAttempts = 0;
            resolve();
          },
          onStompError: (frame) => {
            console.error('[WebSocket] STOMP error:', frame);
            reject(new Error(frame.headers?.message || 'STOMP connection error'));
          },
          onWebSocketError: (error) => {
            console.error('[WebSocket] WebSocket error:', error);
            reject(error);
          },
          onDisconnect: () => {
            console.log('[WebSocket] Disconnected');
            this.handleReconnect();
          }
        });

        console.log('[WebSocket] Activating client...');
        this.client.activate();
      } catch (error) {
        console.error('[WebSocket] Failed to create WebSocket client:', error);
        reject(error);
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(topic, callback) {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected. Attempting to connect...');
      this.connect().then(() => {
        this.subscribe(topic, callback);
      }).catch(error => {
        console.error('Failed to connect for subscription:', error);
      });
      return null;
    }

    try {
      const subscription = this.client.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      this.subscriptions.set(topic, subscription);
      console.log(`Subscribed to topic: ${topic}`);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return null;
    }
  }

  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((subscription, topic) => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from topic: ${topic}`);
    });
    this.subscriptions.clear();
  }

  send(destination, body) {
    if (!this.client?.connected) {
      console.error('[WebSocket] Cannot send message: Not connected');
      throw new Error('WebSocket not connected');
    }

    try {
      console.log(`[WebSocket] Sending message to ${destination}:`, body);
      this.client.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
      console.log('[WebSocket] Message sent successfully');
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.client) {
      this.unsubscribeAll();
      this.client.deactivate();
      this.client = null;
      console.log('WebSocket disconnected');
    }
  }

  isConnected() {
    return this.client?.connected || false;
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
