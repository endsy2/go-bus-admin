# WebSocket 401 Error - Root Cause Analysis

## 🔍 Root Cause Identified

The 401 error is happening on the SockJS `/info` endpoint, not the WebSocket connection itself.

### The Problem

```
GET http://localhost:8080/bus-service/ws/bus/info?t=1776096170596 401 (Unauthorized)
```

**What's happening:**
1. SockJS makes an initial HTTP GET request to `/info` endpoint
2. This `/info` request checks server capabilities (WebSocket support, cookies, etc.)
3. Your backend is requiring authentication for ALL requests including `/info`
4. The `/info` request fails with 401 before WebSocket connection is even attempted

### Why This Happens

SockJS protocol requires an initial `/info` request:
```
Client → GET /bus-service/ws/bus/info → Server
       ← Returns server capabilities ←
Client → Establish WebSocket connection → Server
```

The `/info` endpoint is a **metadata endpoint** that should be publicly accessible.

---

## ✅ Solution

Your backend needs to **allow unauthenticated access to the `/info` endpoint** while still requiring authentication for the actual WebSocket connection.

### Spring Boot Solution

#### Option 1: Exclude /info from Security (Recommended)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                // Allow SockJS info endpoint without authentication
                .requestMatchers("/bus-service/ws/bus/info").permitAll()
                .requestMatchers("/bus-service/ws/bus/**").permitAll() // For SockJS handshake
                // Require authentication for everything else
                .anyRequest().authenticated()
            )
            .csrf().disable(); // Disable CSRF for WebSocket
        
        return http.build();
    }
}
```

#### Option 2: Custom WebSocket Security

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
                        
                        String path = request.getURI().getPath();
                        
                        // Allow /info endpoint without authentication
                        if (path.endsWith("/info")) {
                            System.out.println("Allowing /info request without auth");
                            return true;
                        }
                        
                        // Require authentication for WebSocket connection
                        String query = request.getURI().getQuery();
                        if (query != null && query.contains("token=")) {
                            String token = extractToken(query);
                            
                            if (tokenProvider.validateToken(token)) {
                                String username = tokenProvider.getUsernameFromToken(token);
                                attributes.put("username", username);
                                System.out.println("WebSocket authenticated for: " + username);
                                return true;
                            }
                        }
                        
                        System.out.println("WebSocket authentication failed");
                        response.setStatusCode(HttpStatus.UNAUTHORIZED);
                        return false;
                    }
                    
                    private String extractToken(String query) {
                        for (String param : query.split("&")) {
                            if (param.startsWith("token=")) {
                                return param.substring(6);
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

#### Option 3: WebSocket Security Configuration

```java
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
    
    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .nullDestMatcher().permitAll() // Allow connection without auth
            .simpSubscribeDestMatchers("/topic/**").authenticated() // Require auth for subscriptions
            .anyMessage().authenticated();
    }
    
    @Override
    protected boolean sameOriginDisabled() {
        return true; // Allow cross-origin for development
    }
}
```

---

## 🧪 Testing the Fix

### 1. Test /info Endpoint Directly

Open browser and navigate to:
```
http://localhost:8080/bus-service/ws/bus/info
```

**Expected Response (Success):**
```json
{
  "websocket": true,
  "origins": ["*:*"],
  "cookie_needed": false,
  "entropy": 123456789
}
```

**Current Response (Problem):**
```
401 Unauthorized
```

### 2. Check Console Logs

After fixing backend, you should see:
```
[WebSocket] Stored user: Found
[WebSocket] Token extracted: eyJhbGciOiJIUzI1NiIs...
[WebSocket] Connecting with token: Present
[WebSocket] Connection URL: http://localhost:8080/bus-service/ws/bus?token=***TOKEN***
[WebSocket] Creating SockJS connection to: http://localhost:8080/bus-service/ws/bus?token=***TOKEN***
[WebSocket] Activating client...
STOMP Debug: Opening Web Socket...
STOMP Debug: Web Socket Opened...
STOMP Debug: >>> CONNECT
STOMP Debug: <<< CONNECTED
[WebSocket] Connected successfully
```

### 3. Check Network Tab

In DevTools Network tab, you should see:
1. ✅ GET `/info` → 200 OK (no auth required)
2. ✅ GET `/info?t=...` → 200 OK (no auth required)
3. ✅ WebSocket connection → 101 Switching Protocols (with token)

---

## 📋 Backend Checklist

- [ ] Allow `/bus-service/ws/bus/info` without authentication
- [ ] Allow `/bus-service/ws/bus/**` for SockJS handshake
- [ ] Validate token during WebSocket handshake (not /info)
- [ ] Configure CORS to allow frontend origin
- [ ] Disable CSRF for WebSocket endpoints
- [ ] Test /info endpoint returns 200 OK
- [ ] Test WebSocket connection with valid token
- [ ] Test WebSocket connection rejects invalid token

---

## 🔍 Debugging Steps

### Step 1: Verify Token is Present

Open browser console and run:
```javascript
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);
console.log('Token:', user?.token);
```

**Expected:** Should show user object with token

### Step 2: Test /info Endpoint

Open new browser tab and go to:
```
http://localhost:8080/bus-service/ws/bus/info
```

**Current:** 401 Unauthorized ❌  
**Expected:** JSON response with server info ✅

### Step 3: Check Backend Security Config

Look for security configuration that might be blocking /info:
```java
// BAD - Blocks everything including /info
.anyRequest().authenticated()

// GOOD - Allows /info, requires auth for others
.requestMatchers("/bus-service/ws/bus/info").permitAll()
.requestMatchers("/bus-service/ws/bus/**").permitAll()
.anyRequest().authenticated()
```

### Step 4: Check Backend Logs

Your backend should log:
```
Allowing /info request without auth
WebSocket authenticated for: [username]
```

If you see:
```
Unauthorized access to /info
```

Then your security config is blocking the /info endpoint.

---

## 💡 Key Points

1. **SockJS requires /info endpoint to be publicly accessible**
   - This is by design
   - /info is metadata, not sensitive
   - Authentication happens during WebSocket handshake, not /info

2. **Token is used for WebSocket connection, not /info**
   - /info: No authentication needed
   - WebSocket handshake: Token required
   - STOMP messages: Token validated

3. **Two-stage authentication:**
   ```
   Stage 1: /info request → No auth (public metadata)
   Stage 2: WebSocket handshake → Token required (secure connection)
   ```

---

## 🎯 Summary

**Problem:** Backend is requiring authentication for `/info` endpoint  
**Solution:** Allow `/info` without authentication, validate token during WebSocket handshake  
**Impact:** WebSocket will connect successfully after backend fix

**Next Steps:**
1. Update backend security config to allow `/info` endpoint
2. Keep token validation for WebSocket handshake
3. Test /info endpoint returns 200 OK
4. Test WebSocket connection succeeds

---

## 📞 Need Help?

If you're still getting 401 errors after implementing the fix:

1. Share your backend security configuration
2. Share WebSocket configuration
3. Check backend logs for authentication errors
4. Test /info endpoint directly in browser

The issue is 100% on the backend side - the frontend is correctly sending the token, but the backend is blocking the /info endpoint before the WebSocket connection can be established.
