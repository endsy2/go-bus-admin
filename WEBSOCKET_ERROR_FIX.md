# WebSocket Error Fix - May 2026

## 🔍 Issues Identified

### 1. **Hardcoded IP Address**
- WebSocket URL was hardcoded to `http://192.168.1.8:8080/bus-service/ws/bus`
- This causes connection failures when IP changes or on different networks

### 2. **Missing Token Validation**
- No check if authentication token exists before attempting connection
- Silent failures when user is not logged in

### 3. **Poor Error Messages**
- Generic error messages don't help identify the root cause
- Missing connection close event handling

## ✅ Fixes Applied

### 1. **Dynamic URL Configuration**
```javascript
// Now uses environment variable or defaults to localhost
const wsUrl = url || process.env.REACT_APP_WS_URL || 'http://localhost:8080/bus-service/ws/bus';
```

### 2. **Token Validation**
```javascript
if (!token) {
  console.error('[WebSocket] No authentication token found');
  reject(new Error('Authentication token not found. Please login again.'));
  return;
}
```

### 3. **Enhanced Error Handling**
- Added `onWebSocketClose` handler to detect abnormal closures
- Better error messages with emojis for visibility
- Reduced debug logging (only shows important messages)

### 4. **Improved Reconnection**
- Passes URL to reconnection attempts
- Better logging of reconnection status

## 🔧 Configuration

### Environment Variable Setup

Create or update `.env` file:

```env
# WebSocket Configuration
REACT_APP_WS_URL=http://localhost:8080/bus-service/ws/bus

# For production
# REACT_APP_WS_URL=https://your-domain.com/bus-service/ws/bus
```

### For Different Environments

**Development (localhost):**
```env
REACT_APP_WS_URL=http://localhost:8080/bus-service/ws/bus
```

**Local Network:**
```env
REACT_APP_WS_URL=http://192.168.1.8:8080/bus-service/ws/bus
```

**Production:**
```env
REACT_APP_WS_URL=https://api.yourdomain.com/bus-service/ws/bus
```

## 🐛 Common Errors & Solutions

### Error 1: "Authentication token not found"
**Cause**: User not logged in or token expired  
**Solution**: 
- Ensure user is logged in
- Check localStorage for 'user' object with 'token' field
- Re-login if token is missing

### Error 2: "WebSocket connection failed"
**Cause**: Backend not running or wrong URL  
**Solution**:
- Verify backend is running on the specified URL
- Check CORS configuration on backend
- Verify WebSocket endpoint is accessible

### Error 3: "STOMP connection error"
**Cause**: STOMP protocol error or authentication failure  
**Solution**:
- Check backend logs for authentication errors
- Verify JWT token is valid
- Ensure WebSocket security configuration allows the token

### Error 4: "Abnormal closure (code 1006)"
**Cause**: Network issue, server crash, or firewall blocking  
**Solution**:
- Check network connectivity
- Verify backend server is running
- Check firewall/proxy settings
- Ensure WebSocket protocol is allowed

## 📊 Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 1000 | Normal closure | No action needed |
| 1001 | Going away | Server shutting down |
| 1006 | Abnormal closure | Check network/server |
| 1008 | Policy violation | Check authentication |
| 1011 | Server error | Check backend logs |

## 🔍 Debugging

### Enable Detailed Logging

Temporarily enable full STOMP debug:

```javascript
debug: (str) => {
  console.log('[STOMP]', str); // Log everything
}
```

### Check Connection Status

In browser console:
```javascript
// Check if WebSocket is connected
websocketService.isConnected()

// Check active subscriptions
websocketService.subscriptions
```

### Monitor Network Tab

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection attempts
4. Check status codes and messages

## 🧪 Testing

### Test Connection
```javascript
import websocketService from 'shared/services/websocketService';

// Test connection
websocketService.connect()
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Failed:', err));
```

### Test Subscription
```javascript
// Subscribe to a topic
const subscription = websocketService.subscribe(
  '/topic/schedule/123/seats',
  (data) => console.log('Received:', data)
);
```

### Test Send Message
```javascript
// Send a message
websocketService.send('/app/seat/select', {
  scheduleId: 123,
  seatNumber: 'A1',
  userId: 456
});
```

## 📝 Best Practices

1. **Always check connection status** before sending messages
2. **Handle connection failures gracefully** with user-friendly messages
3. **Use environment variables** for URLs (never hardcode)
4. **Implement proper cleanup** in useEffect hooks
5. **Log important events** but avoid excessive logging
6. **Test on different networks** (localhost, LAN, production)

## 🚀 Next Steps

1. **Add connection status indicator** in UI
2. **Implement retry logic** with exponential backoff
3. **Add offline queue** for messages sent while disconnected
4. **Monitor connection health** with heartbeat checks
5. **Add metrics** for connection success/failure rates

## 📚 Related Documentation

- [WebSocket Architecture](./WEBSOCKET_ARCHITECTURE.md)
- [WebSocket Auth Fix](./WEBSOCKET_AUTH_FIX.md)
- [WebSocket CORS Fix](./WEBSOCKET_CORS_FIX.md)
- [WebSocket README](./WEBSOCKET_README.md)

---

**Last Updated**: May 6, 2026  
**Status**: Fixed ✅  
**Version**: 2.0
