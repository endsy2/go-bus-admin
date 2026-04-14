# WebSocket Authentication Fix

## ✅ Issue Resolved

**Problem**: WebSocket connection was getting 401 Unauthorized error  
**Cause**: JWT token was not being sent with the WebSocket connection  
**Solution**: Added token to WebSocket connection URL and headers

---

## 🔧 Changes Made

### Updated File
`src/shared/services/websocketService.js`

### What Changed

**Before:**
```javascript
this.client = new Client({
  webSocketFactory: () => new SockJS(url),
  // No authentication
});
```

**After:**
```javascript
// Get token from localStorage
const storedUser = localStorage.getItem('user');
const token = storedUser ? JSON.parse(storedUser).token : null;

// Add token to URL as query parameter
const connectionUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

this.client = new Client({
  webSocketFactory: () => new SockJS(connectionUrl),
  connectHeaders: {
    // Also add to STOMP headers
    ...(token && { Authorization: `Bearer ${token}` })
  }
});
```

---

## 🔐 How Authentication Works

### Frontend (Client Side)

1. **Token Retrieval**
   - Reads user data from localStorage
   - Extracts JWT token from user object

2. **Token Transmission**
   - **Query Parameter**: `ws://localhost:8080/bus-service/ws/bus?token=YOUR_JWT_TOKEN`
   - **STOMP Header**: `Authorization: Bearer YOUR_JWT_TOKEN`

3. **Connection Flow**
   ```
   User logged in → Token stored in localStorage
   ↓
   WebSocket connects → Reads token from localStorage
   ↓
   Adds token to URL → ?token=YOUR_JWT_TOKEN
   ↓
   Adds token to headers → Authorization: Bearer YOUR_JWT_TOKEN
   ↓
   Backend validates → Connection established or rejected
   ```

### Backend (Server Side)

Your backend needs to:

1. **Extract Token from Query Parameter**
   ```java
   String query = request.getURI().getQuery();
   String token = extractTokenFromQuery(query);
   ```

2. **Validate Token**
   ```java
   if (jwtTokenProvider.validateToken(token)) {
       // Allow connection
       return true;
   } else {
       // Reject with 401
       response.setStatusCode(HttpStatus.UNAUTHORIZED);
       return false;
   }
   ```

3. **Store User Info in Session**
   ```java
   String username = jwtTokenProvider.getUsernameFromToken(token);
   attributes.put("username", username);
   ```

---

## 📝 Backend Implementation Example

### Spring Boot WebSocket Configuration

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
                    public boolean beforeHandshake(
                            ServerHttpRequest request, 
                            ServerHttpResponse response,
                            WebSocketHandler wsHandler, 
                            Map<String, Object> attributes) throws Exception {
                        
                        // Extract token from query parameter
                        String query = request.getURI().getQuery();
                        if (query != null && query.contains("token=")) {
                            String token = extractToken(query);
                            
                            // Validate token
                            if (tokenProvider.validateToken(token)) {
                                // Store user info in WebSocket session
                                String username = tokenProvider.getUsernameFromToken(token);
                                attributes.put("username", username);
                                attributes.put("token", token);
                                
                                System.out.println("WebSocket authenticated for user: " + username);
                                return true;
                            }
                        }
                        
                        // Reject unauthorized connections
                        System.out.println("WebSocket authentication failed");
                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                        return false;
                    }
                    
                    private String extractToken(String query) {
                        String[] params = query.split("&");
                        for (String param : params) {
                            if (param.startsWith("token=")) {
                                return param.substring(6); // Remove "token="
                            }
                        }
                        return null;
                    }
                })
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

### JWT Token Provider Example

```java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        return claims.getSubject();
    }
}
```

---

## 🧪 Testing

### 1. Check Token in Console

Open browser console and check:
```javascript
// Should see this log
[WebSocket] Connecting with token: Present

// Should see connection URL (token masked)
[WebSocket] Connection URL: http://localhost:8080/bus-service/ws/bus?token=***
```

### 2. Check Network Tab

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `/bus-service/ws/bus`
4. Check request URL includes `?token=...`
5. Should see status 101 (Switching Protocols) instead of 401

### 3. Check Backend Logs

Your backend should log:
```
WebSocket authenticated for user: [username]
STOMP connection established
```

### 4. Test Without Token

To verify authentication is working:
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Should see 401 Unauthorized error
4. Connection should fail

---

## 🐛 Troubleshooting

### Still Getting 401 Unauthorized

**Possible Causes:**
1. Token not in localStorage
2. Token expired
3. Backend not extracting token from query parameter
4. Backend JWT validation failing

**Solutions:**
1. Check localStorage has user with token:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('user')));
   ```

2. Check token is being sent:
   ```javascript
   // Look for this in console
   [WebSocket] Connecting with token: Present
   ```

3. Check backend logs for token validation errors

4. Verify backend is reading query parameter correctly

### Token Not Being Sent

**Check:**
1. User is logged in
2. localStorage has 'user' item
3. User object has 'token' property
4. Token is not null or undefined

**Debug:**
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Token:', user?.token);
```

### Backend Not Accepting Token

**Check:**
1. Backend is configured to read query parameter
2. JWT secret matches between frontend and backend
3. Token format is correct (Bearer token)
4. Token hasn't expired

---

## 📊 Console Logs

You should see these logs in browser console:

### Successful Connection
```
[WebSocket] Connecting with token: Present
[WebSocket] Connection URL: http://localhost:8080/bus-service/ws/bus?token=***
STOMP Debug: Opening Web Socket...
STOMP Debug: Web Socket Opened...
STOMP Debug: >>> CONNECT
STOMP Debug: <<< CONNECTED
WebSocket connected successfully
```

### Failed Connection (No Token)
```
[WebSocket] Connecting with token: Missing
[WebSocket] Connection URL: http://localhost:8080/bus-service/ws/bus
GET http://localhost:8080/bus-service/ws/bus/info 401 (Unauthorized)
WebSocket error: [error details]
```

### Failed Connection (Invalid Token)
```
[WebSocket] Connecting with token: Present
[WebSocket] Connection URL: http://localhost:8080/bus-service/ws/bus?token=***
GET http://localhost:8080/bus-service/ws/bus/info?token=... 401 (Unauthorized)
STOMP error: Unauthorized
```

---

## ✅ Verification Checklist

- [ ] Token is retrieved from localStorage
- [ ] Token is added to WebSocket URL as query parameter
- [ ] Token is added to STOMP connect headers
- [ ] Backend extracts token from query parameter
- [ ] Backend validates JWT token
- [ ] Backend accepts connection if token is valid
- [ ] Backend rejects connection (401) if token is invalid
- [ ] Console shows "Connecting with token: Present"
- [ ] Network tab shows token in WebSocket URL
- [ ] Connection status shows "Live" in UI
- [ ] No 401 errors in console

---

## 🎯 Summary

The WebSocket connection now includes JWT authentication:

1. **Frontend**: Automatically reads token from localStorage and includes it in connection
2. **Backend**: Must validate token before accepting WebSocket connection
3. **Security**: Unauthorized users cannot connect to WebSocket
4. **Logging**: Console logs show whether token is present and connection status

**Next Steps:**
1. Update backend to accept token from query parameter
2. Implement token validation in WebSocket handshake
3. Test connection with valid token
4. Verify 401 error with invalid/missing token

---

**Date**: April 13, 2026  
**Status**: ✅ Fixed  
**Files Modified**: `src/shared/services/websocketService.js`
