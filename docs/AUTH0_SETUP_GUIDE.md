# 🔐 Auth0 Configuration Guide

## Problem
❌ **403 Forbidden** beim Auth0 Login + **HTTPS URI Validation Error**
```
GET https://dev-f7ttgvlvcizan1uj.eu.auth0.com/authorize?client_id=... 403 (Forbidden)
Error: 'Object didn't pass validation for format absolute-https-uri-or-empty: http://localhost:5173'
```

## Lösung: Auth0 Dashboard Konfiguration

### 1. 🌐 Auth0 Dashboard öffnen
- Gehe zu: https://manage.auth0.com
- Login mit deinem Auth0 Account
- Wähle deine Application: **CrudAiApp**

### 2. ⚙️ Application Settings konfigurieren

#### **🚨 WICHTIG: Initiate Login URI**
```
Initiate Login URI: LEER LASSEN (oder https://localhost:5173)
```
❌ **NICHT:** `http://localhost:5173` (HTTP nicht erlaubt)
✅ **RICHTIG:** Feld leer lassen oder `https://localhost:5173`

#### **Application URLs:**
```
Allowed Callback URLs:
http://localhost:5173, http://localhost:5173/callback

Allowed Logout URLs:
http://localhost:5173

Allowed Web Origins:
http://localhost:5173

Allowed Origins (CORS):
http://localhost:5173
```

#### **Application Properties:**
```
Application Type: Single Page Application
Token Endpoint Authentication Method: None
Initiate Login URI: LEER LASSEN (wichtig!)
```

#### **Basic Information (Optional):**
```
Name: CrudAiApp
Description: AI-powered CRUD application with Auth0 authentication
Application Logo URL: (leer lassen oder https:// URL)
```

#### **Advanced Settings → Grant Types:**
✅ Authorization Code
✅ Refresh Token
✅ Implicit (optional)

### 3. 🔧 API Configuration (falls nicht vorhanden)

#### **Gehe zu APIs → Create API:**
```
Name: CrudAI API
Identifier: https://crudai-api
Signing Algorithm: RS256
```

#### **API Settings:**
```
Allow Offline Access: ✅ Enabled
Allow Skipping User Consent: ✅ Enabled
```

### 4. 💾 Einstellungen speichern
- Klicke **"Save Changes"** bei allen Änderungen
- Warte ~30 Sekunden bis die Änderungen aktiv sind

### 5. 🧪 Test
Nach der Konfiguration sollte der Login funktionieren:
```
http://localhost:5173
```

## 🚨 Häufige Probleme

### Problem: Callback URL nicht erlaubt
**Lösung:** Stelle sicher, dass `http://localhost:5173` in den "Allowed Callback URLs" steht

### Problem: CORS Fehler
**Lösung:** Füge `http://localhost:5173` zu "Allowed Origins (CORS)" hinzu

### Problem: API Audience nicht gefunden
**Lösung:** Erstelle eine API mit der Identifier `https://crudai-api`

### Problem: Redirect URI Mismatch
**Lösung:** Überprüfe, dass die URLs exakt übereinstimmen (keine trailing slashes)

## 📋 Checkliste

- [ ] Allowed Callback URLs konfiguriert
- [ ] Allowed Logout URLs konfiguriert  
- [ ] Allowed Web Origins konfiguriert
- [ ] Allowed Origins (CORS) konfiguriert
- [ ] API mit Identifier `https://crudai-api` erstellt
- [ ] Application Type = "Single Page Application"
- [ ] Grant Types: Authorization Code + Refresh Token aktiviert
- [ ] Einstellungen gespeichert und ~30s gewartet

## 🎯 Erwartetes Ergebnis

Nach der Konfiguration solltest du:
1. ✅ Erfolgreich auf den Login Button klicken können
2. ✅ Zur Auth0 Login-Seite weitergeleitet werden
3. ✅ Nach dem Login zurück zur App geleitet werden
4. ✅ Als eingeloggter User authentifiziert sein

## 🔍 Debug Tipps

Wenn es immer noch nicht funktioniert:

1. **Browser Developer Tools öffnen** (F12)
2. **Network Tab** → Auth0 Requests anschauen
3. **Console Tab** → JavaScript Fehler prüfen
4. **Application Tab** → LocalStorage nach Auth0 Tokens suchen

## 📞 Support

Falls Probleme bestehen:
1. Screenshots der Auth0 Dashboard Einstellungen machen
2. Browser Console Errors kopieren
3. Network Tab Response Details prüfen
