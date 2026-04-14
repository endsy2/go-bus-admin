# WebSocket CORS Error Fix

## 🔍 Problem Identified

```
Access to XMLHttpRequest at 'http://localhost:8080/bus-service/ws/bus/info?t=1776099384988' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header contains multiple values 
'http://localhost:3000, http://localhost:3000', but only one is allowed.
```

**Root Cause:** The backend is setting the `Access-Control-Allow-Origin` header **twice**, resulting in duplicate values.

**Status:** Backend returns 200 OK ✅ but CORS headers are misconfigured ❌

---

## ✅ Solution (Backend Fix Required)

The backend has CORS configured in **multiple places**, causing the header to be set twice. Your backend developer needs to configure CORS in **only ONE place**.

### Option 1: Configure CORS in WebSocket Config (Recommended)

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/bus-service/ws/bus")
                .setAllowedOrigins("http://localhost:3000")  // Set ONCE here
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

**Remove CORS from:**
- Global CORS configuration
- Security configuration
- Filter chains
- Controller annotations

### Option 2: Use Global CORS Configuration

If you prefer global CORS configuration, remove it from WebSocket config:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3000")  // Set ONCE here
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

Then in WebSocket config, **remove** `.setAllowedOrigins()`:

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/bus-service/ws/bus")
            // .setAllowedOrigins("http://localhost:3000")  // REMOVE THIS
            .withSockJS();
}
```

### Option 3: Use @CrossOrigin Annotation (Not Recommended for WebSocket)

If using `@CrossOrigin` annotation on controllers, remove it for WebSocket endpoints:

```java
// REMOVE @CrossOrigin from WebSocket related endpoints
// @CrossOrigin(origins = "http://localhost:3000")  // REMOVE THIS
@Controller
public class WebSocketController {
    // ...
}
```

---

## 🔍 How to Find Duplicate CORS Configuration

### Check These Files:

1. **WebSocketConfig.java**
   ```java
   // Look for:
   .setAllowedOrigins("http://localhost:3000")
   ```

2. **SecurityConfig.java**
   ```java
   // Look for:
   .cors().configurationSource(...)
   ```

3. **CorsConfig.java**
   ```java
   // Look for:
   registry.addMapping("/**").allowedOrigins(...)
   ```

4. **Application.properties**
   ```properties
   # Look for:
   spring.web.cors.allowed-origins=http://localhost:3000
   ```

5. **Filter Classes**
   ```java
   // Look for:
   response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
   ```

### Common Duplicate Scenarios:

**Scenario 1: WebSocket + Global CORS**
```java
// WebSocketConfig.java
.setAllowedOrigins("http://localhost:3000")  // ❌ First time

// CorsConfig.java
.allowedOrigins("http://localhost:3000")     // ❌ Second time (DUPLICATE!)
```

**Scenario 2: Security + WebSocket**
```java
// SecurityConfig.java
.cors().configurationSource(...)             // ❌ First time

// WebSocketConfig.java
.setAllowedOrigins("http://localhost:3000")  // ❌ Second time (DUPLICATE!)
```

**Scenario 3: Filter + WebSocket**
```java
// CorsFilter.java
response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");  // ❌ First time

// WebSocketConfig.java
.setAllowedOrigins("http://localhost:3000")  // ❌ Second time (DUPLICATE!)
```

---

## ✅ Recommended Configuration

### Complete Working Example

**1. WebSocketConfig.java** (Configure CORS here)
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/bus-service/ws/bus")
                .setAllowedOriginPatterns("*")  // Allow all origins (development)
                // OR
                .setAllowedOrigins("http://localhost:3000")  // Specific origin (production)
                .withSockJS();
    }
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

**2. SecurityConfig.java** (Don't configure CORS here)
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/bus-service/ws/bus/**").permitAll()
                .anyRequest().authenticated()
            )
            .csrf().disable();
            // .cors().disable();  // Don't configure CORS here
        
        return http.build();
    }
}
```

**3. Remove any CorsConfig.java or CorsFilter.java**

---

## 🧪 Testing the Fix

### 1. Check Response Headers

After backend fix, open DevTools → Network tab → Click on the `/info` request → Check Response Headers:

**Before (Problem):**
```
Access-Control-Allow-Origin: http://localhost:3000, http://localhost:3000
```

**After (Fixed):**
```
Access-Control-Allow-Origin: http://localhost:3000
```

### 2. Check Console

After fix, you should see:
```
[WebSocket] Stored user: Found
[WebSocket] Token extracted: eyJhbGciOiJIUzI1NiIs...
[WebSocket] Connecting with token: Present
[WebSocket] Creating SockJS connection to: http://localhost:8080/bus-service/ws/bus?token=***TOKEN***
STOMP Debug: Opening Web Socket...
STOMP Debug: Web Socket Opened...
STOMP Debug: >>> CONNECT
STOMP Debug: <<< CONNECTED
[WebSocket] Connected successfully
```

### 3. Check UI

After fix, the BookingsPage should show:
- 🟢 "Live" indicator (green)
- "Real-time updates enabled" message

---

## 📋 Backend Checklist

- [ ] Identify all places where CORS is configured
- [ ] Remove duplicate CORS configurations
- [ ] Keep CORS configuration in ONE place only
- [ ] Use `.setAllowedOrigins("http://localhost:3000")` in WebSocketConfig
- [ ] OR use global CORS config and remove from WebSocketConfig
- [ ] Test `/info` endpoint returns correct CORS headers
- [ ] Verify `Access-Control-Allow-Origin` appears only once
- [ ] Test WebSocket connection succeeds

---

## 🎯 Quick Fix Commands

### For Backend Developer:

1. **Search for duplicate CORS configurations:**
   ```bash
   grep -r "setAllowedOrigins" src/
   grep -r "Access-Control-Allow-Origin" src/
   grep -r "addCorsMappings" src/
   grep -r "@CrossOrigin" src/
   ```

2. **Remove duplicates and keep only one:**
   - Keep in `WebSocketConfig.java`
   - Remove from all other files

3. **Restart backend server**

4. **Test:**
   ```bash
   curl -I http://localhost:8080/bus-service/ws/bus/info
   ```
   
   Should show:
   ```
   HTTP/1.1 200 OK
   Access-Control-Allow-Origin: http://localhost:3000
   ```
   
   NOT:
   ```
   Access-Control-Allow-Origin: http://localhost:3000, http://localhost:3000
   ```

---

## 💡 Key Points

1. **CORS should be configured in ONE place only**
   - Either in WebSocketConfig
   - Or in global CORS configuration
   - Never in both

2. **Common mistake:**
   - Configuring CORS in multiple places
   - Each configuration adds the header
   - Browser rejects duplicate headers

3. **Best practice for WebSocket:**
   - Configure CORS in `WebSocketConfig.registerStompEndpoints()`
   - Don't configure CORS globally for WebSocket endpoints
   - Keep REST API CORS separate from WebSocket CORS

---

## 🎉 Summary

**Problem:** CORS header is being set twice  
**Cause:** CORS configured in multiple places in backend  
**Solution:** Remove duplicate CORS configurations, keep only one  
**Impact:** WebSocket will connect successfully after backend fix

**The frontend is working correctly** - this is purely a backend configuration issue.

---

## 📞 For Backend Developer

Please check these files and remove duplicate CORS configurations:
1. `WebSocketConfig.java` - Keep CORS here
2. `SecurityConfig.java` - Remove CORS from here
3. `CorsConfig.java` - Delete this file if it exists
4. `CorsFilter.java` - Delete this file if it exists
5. Any `@CrossOrigin` annotations - Remove from WebSocket controllers

After fixing, restart the backend server and the WebSocket should connect successfully!
