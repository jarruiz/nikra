# 🚀 Instrucciones de Despliegue - PASO A PASO

## ✅ PASO COMPLETADO: Secrets Generados

Los secrets han sido generados exitosamente:

- ✅ JWT_SECRET: `02109ef774f5de049efd13c6768168bb678d85b171ecf585242dc440642b6958`
- ✅ JWT_REFRESH_SECRET: `7296927508544324c23b6c4eb6c91c2242d4612ef06c3c7febda4435cd86420c`
- ✅ DB_USERNAME: `nikra_user_f57c8f88`
- ✅ DB_PASSWORD: `6M4iQNKFxIykD3IDhFbgKg`

**⚠️ GUARDA ESTOS VALORES EN UN LUGAR SEGURO (1Password, LastPass, etc.)**

---

## 📋 SIGUIENTES PASOS

### PASO 1: Commitear y Pushear el Código ✅

```bash
# Desde la raíz del proyecto
cd ..

# Ver qué archivos se van a commitear
git status

# Agregar archivos
git add .

# Commitear (los secrets NO se incluyen, están en .gitignore)
git commit -m "feat: add Render deployment configuration with automated scripts"

# Pushear a tu rama principal
git push origin main
```

**✅ Verifica:** Los archivos `.env.render` y `render-variables.txt` NO deben aparecer en Git (están protegidos).

---

### PASO 2: Crear Servicios en Render 🌐

#### Opción A: Usando Blueprint (MÁS FÁCIL - RECOMENDADO) 🎯

1. **Ve a [Render Dashboard](https://dashboard.render.com)**

2. **Click en "New +" → "Blueprint"**

3. **Conecta tu repositorio Git:**
   - Selecciona GitHub/GitLab/Bitbucket
   - Autoriza el acceso si es necesario
   - Selecciona el repositorio: `cca-ceuta-backend`

4. **Render detectará automáticamente `render.yaml`:**
   - Verás la configuración de:
     - ✅ Web Service (nikra-backend)
     - ✅ PostgreSQL Database (nikra-db)
     - ✅ Variables de entorno básicas
     - ✅ Disco persistente (10GB)

5. **Click en "Apply"**
   - Render comenzará a crear los servicios
   - Esto tomará ~5-10 minutos

6. **Espera a que los servicios se creen:**
   - Database: Aparecerá primero (2-3 min)
   - Web Service: Aparecerá después y comenzará el build

---

#### Opción B: Manual (Más control)

<details>
<summary>Click aquí para ver instrucciones manuales</summary>

##### 2.1. Crear Base de Datos PostgreSQL

1. En Render Dashboard: **"New +" → "PostgreSQL"**
2. Configurar:
   - Name: `nikra-db`
   - Database: `nikra_db`
   - User: `nikra_user_f57c8f88`
   - Region: **Frankfurt**
   - Plan: **Starter** ($7/mes) o Free para pruebas
3. Click **"Create Database"**
4. **GUARDA las credenciales** que aparecen

##### 2.2. Crear Web Service

1. **"New +" → "Web Service"**
2. Conectar repositorio
3. Configurar:
   - Name: `nikra-backend`
   - Region: **Frankfurt** (misma que la BD)
   - Branch: `main`
   - Runtime: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start:prod`
   - Plan: **Starter** ($7/mes)
4. Click **"Create Web Service"**

</details>

---

### PASO 3: Configurar Variables de Entorno (JWT Secrets) 🔐

**IMPORTANTE:** Aunque uses Blueprint, los JWT secrets deben configurarse manualmente.

1. **En Render Dashboard, ve a tu servicio web `nikra-backend`**

2. **Click en "Environment" en el menú lateral**

3. **Busca y actualiza estas variables:**

   Busca `JWT_SECRET` y cambia su valor a:
   ```
   02109ef774f5de049efd13c6768168bb678d85b171ecf585242dc440642b6958
   ```

   Busca `JWT_REFRESH_SECRET` y cambia su valor a:
   ```
   7296927508544324c23b6c4eb6c91c2242d4612ef06c3c7febda4435cd86420c
   ```

4. **Click en "Save Changes"**

5. **Render redesplegará automáticamente** (esto toma ~5 minutos)

---

### PASO 4: Esperar el Despliegue ⏳

1. **Ve a tu servicio web en Render Dashboard**

2. **Observa los logs en tiempo real:**
   - Click en "Logs" en el menú lateral
   - Verás el proceso de build y deploy

3. **Espera hasta ver:**
   ```
   🚀 Aplicación ejecutándose en: http://localhost:3000
   📚 Documentación Swagger: http://localhost:3000/api/docs
   ```

4. **El estado debe cambiar a "Live" (verde)** ✅

---

### PASO 5: Ejecutar Migraciones de Base de Datos 🗄️

**Una vez que el servicio esté "Live":**

1. **En tu servicio web, click en "Shell"** (menú lateral)

2. **Ejecuta en el terminal de Render:**
   ```bash
   npm run migration:run
   ```

3. **Verifica que las migraciones se ejecutaron:**
   ```bash
   npm run migration:show
   ```

4. **Deberías ver:**
   ```
   ✓ InitialSetup
   ✓ AddImageFields
   ```

---

### PASO 6: Verificar el Despliegue ✅

#### 6.1. Obtén tu URL

En Render Dashboard, tu servicio web mostrará una URL como:
```
https://nikra-backend.onrender.com
```

#### 6.2. Verificar manualmente

Abre en tu navegador:
```
https://tu-servicio.onrender.com/api/docs
```

Deberías ver la documentación Swagger UI con todos tus endpoints.

#### 6.3. Verificar automáticamente (desde tu terminal local)

```bash
# Desde el directorio deploy
cd deploy

# Ejecutar verificación automática
./verify-deployment.sh https://tu-servicio.onrender.com
```

---

## 🎉 ¡DESPLIEGUE COMPLETADO!

Si todo funcionó correctamente:

✅ Tu aplicación está corriendo en Render  
✅ Base de datos PostgreSQL configurada  
✅ Migraciones ejecutadas  
✅ Swagger UI accesible  
✅ Todos los endpoints funcionando  

---

## 📊 Información de tu Despliegue

### URLs Importantes

- 🌐 **Aplicación:** `https://tu-servicio.onrender.com`
- 📚 **Swagger UI:** `https://tu-servicio.onrender.com/api/docs`
- 🗄️ **PostgreSQL:** (solo accesible internamente desde Render)

### Secrets Configurados

Los siguientes secrets están configurados:

| Variable | Valor (primeros/últimos 8 caracteres) |
|----------|----------------------------------------|
| JWT_SECRET | `02109ef7...642b6958` |
| JWT_REFRESH_SECRET | `72969275...cd86420c` |
| DB_USERNAME | `nikra_user_f57c8f88` |
| DB_PASSWORD | `6M4i...bgKg` |

**🔒 Archivo completo:** `deploy/.env.render`

---

## 🔄 Próximos Pasos Opcionales

### 1. Configurar Dominio Personalizado

1. En tu servicio web: **Settings → Custom Domains**
2. Click **"Add Custom Domain"**
3. Ingresa: `api.tudominio.com`
4. Configura el DNS según las instrucciones

### 2. Configurar CORS para tu Frontend

Si tu frontend está en otro dominio:

1. En **Environment**, añade:
   ```
   CORS_ORIGIN=https://tu-frontend.com
   ```

2. Actualiza `src/config/bootstrap/security.config.ts` si es necesario

### 3. Configurar Auto-Deploy

1. En **Settings → Build & Deploy**
2. Habilita **"Auto-Deploy"**
3. Selecciona rama: `main`

Ahora cada push desplegará automáticamente.

### 4. Configurar Alertas y Monitoreo

1. En Render Dashboard → **Notifications**
2. Configura alertas por email para:
   - Deploy failures
   - Service down
   - High resource usage

---

## 🆘 Solución de Problemas

### El build falla

```bash
# Verifica que el código compile localmente
npm run build
```

### La aplicación no responde

1. Revisa los logs en Render: **Logs** en menú lateral
2. Verifica que las variables de entorno estén configuradas
3. Verifica que la base de datos esté "Live"

### Las migraciones fallan

```bash
# En Render Shell, verifica la conexión a la BD
echo $DATABASE_URL

# Intenta ejecutar las migraciones con output verbose
npm run typeorm migration:run
```

### No puedo acceder a /api/docs

1. Verifica que el servicio esté "Live"
2. Espera ~30 segundos después del deploy
3. Revisa los logs para errores

---

## 📞 Recursos y Soporte

### Documentación

- [Guía Completa de Deploy](../docs/DESPLIEGUE_RENDER.md)
- [Variables de Entorno](../docs/VARIABLES_ENTORNO.md)
- [Checklist Completo](../CHECKLIST_DESPLIEGUE.md)
- [Regiones de Render](../docs/REGIONES_RENDER.md)

### Links Útiles

- [Render Dashboard](https://dashboard.render.com)
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com)

### Soporte

- Email: creative.feelve@gmail.com
- Equipo: Equipo Desarrollo Nikra

---

## 💰 Costos Estimados

| Servicio | Plan | Costo |
|----------|------|-------|
| Web Service | Starter | $7/mes |
| PostgreSQL | Starter | $7/mes |
| Disco 10GB | Incluido | $0 |
| **TOTAL** | | **$14/mes** |

_Con crédito gratuito de $5/mes → ~$9/mes real_

---

**Generado:** 2025-10-20 22:21:04  
**Secrets válidos hasta:** Rotación recomendada en 3-6 meses

¡Feliz despliegue! 🚀

