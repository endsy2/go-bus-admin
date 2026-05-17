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

  connect(url) {
    // Use provided URL or construct from environment variable or default to localhost
    const wsUrl = url || process.env.REACT_APP_WS_URL || 'wss://go-bus-gateway-service-production.up.railway.app/bus-service/ws/bus';
    
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
            // Try both 'token' and 'accessToken' fields
            token = userData.token || userData.accessToken;
            console.log('[WebSocket] Token extracted:', token ? `${token.substring(0, 20)}...` : 'Missing');
            console.log('[WebSocket] User data keys:', Object.keys(userData));
          } catch (e) {
            console.error('[WebSocket] Failed to parse stored user:', e);
          }
        } else {
          console.warn('[WebSocket] No user data in localStorage');
        }

        if (!token) {
          const errorMsg = 'Authentication token not found. Please login again.';
          console.error('[WebSocket]', errorMsg);
          console.error('[WebSocket] Please ensure user is logged in');
          reject(new Error(errorMsg));
          return;
        }
        
        console.log('[WebSocket] Connecting to:', wsUrl);

        // Add token as query parameter if available
        const connectionUrl = token ? `${wsUrl}?token=${encodeURIComponent(token)}` : wsUrl;

        this.client = new Client({
          webSocketFactory: () => {
            console.log('[WebSocket] Creating SockJS connection');
            return new SockJS(connectionUrl);
          },
          connectHeaders: token ? {
            Authorization: `Bearer ${token}`
          } : {},
          debug: (str) => {
            // Only log important debug messages
            if (str.includes('ERROR') || str.includes('CONNECT') || str.includes('DISCONNECT')) {
              console.log('[STOMP]', str);
            }
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log('[WebSocket] ✅ Connected successfully');
            this.reconnectAttempts = 0;
            resolve();
          },
          onStompError: (frame) => {
            console.error('[WebSocket] ❌ STOMP error:', frame);
            const errorMessage = frame.headers?.message || 'STOMP connection error';
            
            // Check if it's an authentication error
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('Authentication')) {
              console.error('[WebSocket] Authentication failed - token may be invalid or expired');
              console.error('[WebSocket] Please try logging out and logging in again');
            }
            
            reject(new Error(errorMessage));
          },
          onWebSocketError: (error) => {
            console.error('[WebSocket] ❌ WebSocket error:', error);
            reject(error);
          },
          onWebSocketClose: (event) => {
            console.log('[WebSocket] Connection closed:', event.reason || 'Unknown reason');
            if (event.code === 1006) {
              console.error('[WebSocket] Abnormal closure - possible network issue or server down');
            } else if (event.code === 1008) {
              console.error('[WebSocket] Policy violation - likely authentication issue');
            }
          },
          onDisconnect: () => {
            console.log('[WebSocket] Disconnected');
            this.handleReconnect(wsUrl);
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

  handleReconnect(url) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(url).catch(error => {
          console.error('[WebSocket] Reconnection failed:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
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
