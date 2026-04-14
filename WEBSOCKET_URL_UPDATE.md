# WebSocket URL Update Summary

## ✅ Update Complete

**Date**: April 13, 2026  
**Change**: Updated WebSocket URL from `ws://localhost:8082/ws/bus` to `ws://localhost:8080/bus-service/ws/bus`

---

## 📝 Changes Made

### Source Code Files (2 files)

1. **`src/shared/services/websocketService.js`**
   - Updated default URL in `connect()` method
   - Old: `http://localhost:8082/ws/bus`
   - New: `http://localhost:8080/bus-service/ws/bus`

2. **`src/features/bookings/components/WebSocketTester/WebSocketTester.jsx`**
   - Updated displayed WebSocket URL in UI
   - Old: `ws://localhost:8082/ws/bus`
   - New: `ws://localhost:8080/bus-service/ws/bus`

### Documentation Files (8 files)

All documentation files have been updated with the new URL:

1. **`WEBSOCKET_README.md`** - Updated backend requirements and troubleshooting
2. **`WEBSOCKET_QUICK_START.md`** - Updated testing methods and configuration
3. **`WEBSOCKET_IMPLEMENTATION.md`** - Updated technical documentation
4. **`WEBSOCKET_ARCHITECTURE.md`** - Updated architecture diagrams
5. **`WEBSOCKET_SUMMARY.md`** - Updated feature summary
6. **`WEBSOCKET_IMPLEMENTATION_NOTES.md`** - Updated development notes
7. **`WEBSOCKET_CHECKLIST.md`** - Updated testing checklist
8. **`WEBSOCKET_FINAL_SUMMARY.md`** - Updated final summary

---

## 🔧 New Configuration

### WebSocket Connection
- **URL**: `ws://localhost:8080/bus-service/ws/bus`
- **Protocol**: STOMP over SockJS
- **Port**: 8080 (shared with main backend)
- **Path**: `/bus-service/ws/bus`

### Backend Requirements
Your backend must now:
1. Expose WebSocket endpoint at `/bus-service/ws/bus` on port 8080
2. Use STOMP protocol over SockJS
3. Publish events to `/topic/schedule/{scheduleId}/seats`
4. Configure CORS for frontend origin

---

## 🧪 Testing

### Verify the Update

1. **Check the Service File**
   ```bash
   grep "connect(url" src/shared/services/websocketService.js
   ```
   Should show: `connect(url = 'http://localhost:8080/bus-service/ws/bus')`

2. **Start the Application**
   ```bash
   npm start
   ```

3. **Open BookingsPage**
   - Navigate to Bookings section
   - Look for connection status indicator

4. **Check Browser Console**
   - Should see: "Connecting to WebSocket..."
   - Should see: "STOMP Debug:" messages with new URL

5. **Use WebSocketTester**
   - Add WebSocketTester component to any page
   - Verify displayed URL shows: `ws://localhost:8080/bus-service/ws/bus`

### Backend Setup

Ensure your backend is configured to:
1. Listen on port 8080
2. Expose WebSocket endpoint at `/bus-service/ws/bus`
3. Accept SockJS connections
4. Support STOMP protocol

Example Spring Boot configuration:
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/bus-service/ws/bus")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

---

## 🔒 Authentication

The WebSocket connection now includes JWT token authentication:

### How It Works
1. Token is retrieved from localStorage (stored user data)
2. Token is passed as query parameter: `?token=YOUR_JWT_TOKEN`
3. Token is also included in STOMP connect headers: `Authorization: Bearer YOUR_JWT_TOKEN`
4. Backend validates the token before accepting the connection

### Backend Requirements
Your backend must:
1. Accept token as query parameter in WebSocket handshake
2. Validate JWT token before establishing connection
3. Return 401 Unauthorized if token is invalid or missing

Example Spring Boot configuration:
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/bus-service/ws/bus")
                .setAllowedOrigins("http://localhost:3000")
                .addInterceptors(new HttpSessionHandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, 
                                                 ServerHttpResponse response,
                                                 WebSocketHandler wsHandler, 
                                                 Map<String, Object> attributes) throws Exception {
                        // Extract token from query parameter
                        String query = request.getURI().getQuery();
                        if (query != null && query.contains("token=")) {
                            String token = query.split("token=")[1].split("&")[0];
                            // Validate token
                            if (tokenProvider.validateToken(token)) {
                                attributes.put("token", token);
                                return true;
                            }
                        }
                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                        return false;
                    }
                })
                .withSockJS();
    }
}
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: Shows "Offline" status

**Solutions**:
1. Verify backend is running on port 8080
2. Check endpoint is accessible: `http://localhost:8080/bus-service/ws/bus`
3. Verify CORS is configured for `http://localhost:3000`
4. Check browser console for connection errors
5. Ensure SockJS is enabled on backend

### Backend Not Found

**Problem**: 404 error when connecting

**Solutions**:
1. Verify backend path is `/bus-service/ws/bus` (not `/ws/bus`)
2. Check backend routing configuration
3. Ensure WebSocket endpoint is registered correctly
4. Test endpoint with curl or Postman

### CORS Errors

**Problem**: CORS policy blocking connection

**Solutions**:
1. Add frontend origin to backend CORS configuration
2. Allow credentials if needed
3. Check allowed origins include `http://localhost:3000`
4. Verify preflight requests are handled

---

## 📊 Verification Checklist

- [x] Updated `websocketService.js` with new URL
- [x] Updated `WebSocketTester.jsx` with new URL
- [x] Updated all documentation files
- [x] Verified no references to old URL remain
- [x] Verified new URL appears in 17 locations
- [ ] Backend configured with new endpoint
- [ ] Connection tested and working
- [ ] Events received successfully

---

## 🎯 Next Steps

1. **Update Backend Configuration**
   - Configure WebSocket endpoint at `/bus-service/ws/bus`
   - Ensure it's accessible on port 8080
   - Test endpoint is responding

2. **Test Connection**
   - Start frontend application
   - Open BookingsPage
   - Verify "Live" indicator appears
   - Check browser console for connection logs

3. **Test Events**
   - Book a seat via mobile app or API
   - Verify toast notification appears
   - Confirm booking list updates automatically

4. **Verify Documentation**
   - Review updated documentation
   - Ensure all team members are aware of new URL
   - Update any external documentation if needed

---

## 📝 Notes

### Why This Change?

The URL was updated to align with the backend architecture where:
- Main backend runs on port 8080
- Bus service is accessible at `/bus-service` path
- WebSocket endpoint is at `/bus-service/ws/bus`

This provides:
- **Consistency**: All services on same port
- **Simplicity**: Single port for all backend communication
- **Scalability**: Easier to add more services under different paths
- **Production Ready**: Matches typical microservice gateway pattern

### Environment Variables

For production or different environments, you can make the URL configurable:

```javascript
// In websocketService.js
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/bus-service/ws/bus';

connect(url = WS_URL) {
  // ...
}
```

Then set in `.env` file:
```
REACT_APP_WS_URL=wss://your-production-domain.com/bus-service/ws/bus
```

---

## ✨ Summary

All references to the old WebSocket URL (`ws://localhost:8082/ws/bus`) have been successfully updated to the new URL (`ws://localhost:8080/bus-service/ws/bus`).

**Files Updated**: 10 files (2 source + 8 documentation)  
**References Updated**: 17 locations  
**Old References Remaining**: 0  
**Status**: ✅ Complete

The WebSocket implementation is now configured to connect to the bus service on port 8080 with the path `/bus-service/ws/bus`.
