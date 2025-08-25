# 🔧 Auth0 API Setup - Schritt für Schritt

## 1. Auth0 Dashboard → APIs erstellen

### Gehe zu: https://manage.auth0.com
1. **Linke Seite:** `Applications` → `APIs` 
2. **Button:** `+ Create API`

### API Konfiguration:
```
Name: CrudAI API
Identifier: https://crudai-api
Signing Algorithm: RS256
```

### Settings:
```
✅ Allow Offline Access: Enabled
✅ Allow Skipping User Consent: Enabled
✅ Token Expiration (Seconds): 86400 (24 hours)
✅ Allow Skipping User Consent: Enabled
```

## 2. API Permissions (Scopes) definieren

Gehe zu: **APIs → CrudAI API → Permissions**

Füge diese Scopes hinzu:
```
read:profile     - Read user profile
write:profile    - Update user profile  
read:chats       - Read user's chats
write:chats      - Create/update chats
delete:chats     - Delete chats
read:messages    - Read messages in chats
write:messages   - Send messages
read:ai          - Use AI features
```

## 3. Application Settings anpassen

Gehe zu: **Applications → CrudAiApp**

### Machine to Machine:
```
✅ CrudAI API: Authorized
✅ Scopes: Alle auswählen (read:profile, write:profile, etc.)
```

## 4. Test die API

Nach der Erstellung solltest du haben:
- ✅ API Identifier: `https://crudai-api`
- ✅ Signing Algorithm: RS256  
- ✅ JWKS Endpoint: `https://dev-f7ttgvlvcizan1uj.eu.auth0.com/.well-known/jwks.json`

## 5. Application konfigurieren

In **Applications → CrudAiApp → Settings**:

### Application URIs:
```
Allowed Callback URLs: http://localhost:5173
Allowed Logout URLs: http://localhost:5173
Allowed Web Origins: http://localhost:5173
Allowed Origins (CORS): http://localhost:5173
```

### Advanced Settings → Grant Types:
```
✅ Authorization Code
✅ Refresh Token  
✅ Implicit (optional)
```

---

## ✅ Nach dem Setup

Wenn du das gemacht hast, sag mir Bescheid! Dann aktivieren wir:
1. 🔧 Backend: Echte Auth0 JWT Validation
2. 🔧 Frontend: Auth0 Token mit API Audience  
3. 🔧 Protected Routes mit richtigen Scopes
4. 🔧 Token Refresh Implementation

Die API `https://crudai-api` sollte dann existieren und funktionieren! 🚀
