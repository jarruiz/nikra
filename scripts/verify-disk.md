# 🔍 Verificación de Estado del Disco Persistente

## ⚠️ Problema Detectado

El disco persistente muestra **0 GB de uso** a pesar de estar configurado con 10 GB y montado en `/app/uploads`.

## 🔧 Pasos para Diagnosticar

### 1️⃣ Conectarse al Shell de Render

1. Ve al dashboard de Render
2. Selecciona el servicio `nikra-backend`
3. Ve a la pestaña **"Shell"** 
4. Se abrirá una terminal interactiva

### 2️⃣ Ejecutar Comandos de Verificación

```bash
# Verificar que el directorio existe
ls -la /app/

# Ver contenido de uploads (si existe)
ls -la /app/uploads/

# Ver subdirectorios
ls -la /app/uploads/avatars/
ls -la /app/uploads/campaigns/
ls -la /app/uploads/associates/

# Verificar uso de espacio en disco
df -h /app/uploads

# Ver permisos
stat /app/uploads

# Ver si hay archivos
find /app/uploads -type f 2>/dev/null | head -20

# Ver tamaño total
du -sh /app/uploads/*
```

### 3️⃣ Verificar Configuración del Disco en Render

**En el Dashboard de Render:**
1. Ve a **Settings**
2. Ve a la sección **"Disks"**
3. Verifica que el disco esté configurado correctamente:
   - **Name:** `uploads`
   - **Mount Path:** `/app/uploads`
   - **Size:** `10 GB`
   - **Status:** `Active` o `Mounted`

### 4️⃣ Verificar Logs de la Aplicación

En la pestaña **"Logs"** del dashboard, busca mensajes como:
```
📁 UploadService: Ruta base configurada como: /app/uploads
💾 Guardando archivo en: /app/uploads/...
✅ Archivo guardado exitosamente: ...
```

## 🐛 Posibles Causas

1. **Disco no montado correctamente:**
   - El disco puede no estar montado en la ruta especificada
   - Verificar que el mount path sea exactamente `/app/uploads`

2. **Imágenes no se están subiendo:**
   - Verificar que los usuarios estén realmente subiendo imágenes
   - Revisar errores en los logs de la aplicación

3. **Imágenes se están guardando en otra ubicación:**
   - El código puede estar usando una ruta diferente
   - Verificar la configuración de `NODE_ENV`

4. **Permisos incorrectos:**
   - El proceso de la aplicación puede no tener permisos para escribir en `/app/uploads`

## 🛠️ Soluciones

### Si el disco no está montado:

1. Ve a **Settings > Disks** en el dashboard de Render
2. Elimina el disco existente si está mal configurado
3. Crea un nuevo disco con:
   - **Name:** `uploads`
   - **Mount Path:** `/app/uploads`
   - **Size:** `10 GB`
4. Guarda y espera a que Render monte el disco
5. Haz un nuevo deploy del servicio

### Si los archivos no se están subiendo:

1. Intenta subir una imagen desde Swagger UI
2. Revisa los logs inmediatamente después
3. Busca errores relacionados con permisos o rutas

### Si el código está usando una ruta incorrecta:

Verificar que `NODE_ENV=production` esté configurado en las variables de entorno de Render.

## 📊 Resultado Esperado

Después de subir imágenes, el gráfico de uso del disco debería mostrar:
- Al menos algunos MB de uso
- La línea del gráfico debería subir después de subir archivos
- Los comandos en el shell deberían mostrar archivos en los directorios

