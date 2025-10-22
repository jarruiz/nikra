# 🔐 Configuración de Tokens JWT

## 📋 Configuración Actual

### **JWT Token (Acceso)**
- **Duración**: 24 horas
- **Variable**: `JWT_EXPIRES_IN=24h`
- **Uso**: Autenticación en endpoints protegidos

### **Refresh Token**
- **Duración**: 7 días
- **Variable**: `JWT_REFRESH_EXPIRES_IN=7d`
- **Uso**: Renovar tokens de acceso sin re-login

## 🔄 Flujo de Autenticación

### **1. Login Inicial**
```json
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "fullName": "Nombre Usuario"
  }
}
```

### **2. Usar Token de Acceso**
```bash
# Incluir en headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **3. Renovar Token (cuando expire)**
```json
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## ⏰ Duración Recomendada por Entorno

### **Desarrollo**
- **JWT**: 1-2 horas
- **Refresh**: 7 días

### **Producción**
- **JWT**: 24 horas
- **Refresh**: 7-30 días

### **Alta Seguridad**
- **JWT**: 15-30 minutos
- **Refresh**: 1-7 días

## 🔧 Cambiar Duración de Tokens

### **En Render Dashboard:**
1. Ve a tu servicio `nikra-backend`
2. Pestaña **"Environment"**
3. Edita `JWT_EXPIRES_IN`:
   - `15m` = 15 minutos
   - `1h` = 1 hora
   - `24h` = 24 horas
   - `7d` = 7 días

### **En Código:**
```typescript
// src/config/jwt.config.ts
export const JwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Cambiar aquí
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
```

## 🚨 Solución a Errores Comunes

### **Error: "Token expirado"**
- **Causa**: JWT token expiró
- **Solución**: Usar refresh token para obtener nuevo token

### **Error: "Refresh token expirado"**
- **Causa**: Refresh token expiró
- **Solución**: Usuario debe hacer login nuevamente

### **Error: "Token inválido"**
- **Causa**: Token malformado o secret incorrecto
- **Solución**: Verificar formato del token y configuración

## 📱 Implementación en Frontend

### **JavaScript/TypeScript**
```typescript
// Guardar tokens
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);

// Usar token en peticiones
const token = localStorage.getItem('access_token');
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Renovar token automáticamente
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
  } else {
    // Redirigir a login
    window.location.href = '/login';
  }
}
```

## 🔒 Mejores Prácticas

### **Seguridad**
- ✅ Usar HTTPS en producción
- ✅ Tokens seguros y únicos
- ✅ Rotar secrets periódicamente
- ✅ Logout al expirar refresh token

### **UX (Experiencia de Usuario)**
- ✅ Renovar tokens automáticamente
- ✅ Mostrar tiempo restante de sesión
- ✅ Logout suave sin pérdida de datos
- ✅ Recordar usuario (opcional)

### **Desarrollo**
- ✅ Logs de autenticación
- ✅ Testing de tokens
- ✅ Manejo de errores
- ✅ Timeouts apropiados
