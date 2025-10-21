# ✅ Checklist de Despliegue en Render

Usa este checklist para asegurarte de que tu despliegue en Render es exitoso.

---

## 📋 Antes de Desplegar

### Preparación del Código

- [ ] El código está commiteado y pusheado al repositorio (GitHub/GitLab/Bitbucket)
- [ ] La rama `main` está actualizada
- [ ] El proyecto compila sin errores: `npm run build`
- [ ] Las migraciones están creadas y probadas localmente
- [ ] El archivo `render.yaml` está en la raíz del proyecto
- [ ] Has leído la [Guía de Inicio Rápido](./docs/INICIO_RAPIDO_RENDER.md)

### Cuenta y Accesos

- [ ] Tienes una cuenta en [Render](https://render.com)
- [ ] Has conectado tu cuenta de Git (GitHub/GitLab) a Render
- [ ] Tienes acceso al repositorio que vas a desplegar

### Variables de Entorno Preparadas

- [ ] Has generado `JWT_SECRET` (mínimo 32 caracteres aleatorios)
- [ ] Has generado `JWT_REFRESH_SECRET` (diferente del anterior)
- [ ] Tienes los valores guardados en un lugar seguro (1Password, LastPass, etc.)

---

## 🚀 Durante el Despliegue

### Paso 1: Crear Servicios en Render

**Opción A: Usando Blueprint (Recomendado)**
- [ ] New + → Blueprint
- [ ] Repositorio seleccionado
- [ ] Render detecta `render.yaml`
- [ ] Click en "Apply"

**Opción B: Manual**
- [ ] Servicio PostgreSQL creado
  - [ ] Name: `nikra-db`
  - [ ] Database: `nikra_db`
  - [ ] User: `nikra_user`
  - [ ] Region: Frankfurt (o tu preferida)
  - [ ] Plan: Starter o superior
  - [ ] **Credenciales guardadas**

- [ ] Servicio Web creado
  - [ ] Name: `nikra-backend`
  - [ ] Region: Misma que la base de datos
  - [ ] Branch: `main`
  - [ ] Runtime: Node
  - [ ] Build Command: `npm ci && npm run build`
  - [ ] Start Command: `npm run start:prod`
  - [ ] Plan: Starter o superior

### Paso 2: Configurar Variables de Entorno

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`
- [ ] `DB_HOST` = (desde PostgreSQL o autocompletado)
- [ ] `DB_PORT` = `5432`
- [ ] `DB_USERNAME` = (desde PostgreSQL o autocompletado)
- [ ] `DB_PASSWORD` = (desde PostgreSQL o autocompletado)
- [ ] `DB_DATABASE` = `nikra_db`
- [ ] `JWT_SECRET` = (tu valor generado)
- [ ] `JWT_EXPIRES_IN` = `15m`
- [ ] `JWT_REFRESH_SECRET` = (tu otro valor generado)
- [ ] `JWT_REFRESH_EXPIRES_IN` = `7d`

**Verificación de Secrets:**
- [ ] `JWT_SECRET` tiene al menos 32 caracteres
- [ ] `JWT_REFRESH_SECRET` es diferente de `JWT_SECRET`
- [ ] NO usas valores por defecto como "secret" o "password"

### Paso 3: Configurar Disco Persistente

- [ ] Ve a tu servicio web → "Disks"
- [ ] Click en "Add Disk"
- [ ] Name: `uploads`
- [ ] Mount Path: `/app/uploads`
- [ ] Size: `10 GB` (o según necesites)
- [ ] Click en "Save"

### Paso 4: Esperar el Despliegue

- [ ] El build se completa sin errores
- [ ] El servicio muestra estado "Live" (verde)
- [ ] No hay errores en los logs

---

## 🔍 Después del Despliegue

### Ejecutar Migraciones

- [ ] Ve al servicio web → "Shell"
- [ ] Ejecuta: `npm run migration:run`
- [ ] Verifica: `npm run migration:show`
- [ ] Las migraciones se ejecutaron correctamente

### Verificar Funcionalidad

- [ ] Puedes acceder a la URL: `https://tu-servicio.onrender.com`
- [ ] Swagger UI funciona: `https://tu-servicio.onrender.com/api/docs`
- [ ] La documentación muestra todos los endpoints
- [ ] No hay errores 500 o 404

### Pruebas Básicas de API

- [ ] Endpoint de health check responde: `GET /`
- [ ] Puedes registrar un usuario: `POST /auth/register`
- [ ] Puedes hacer login: `POST /auth/login`
- [ ] Recibes un token JWT válido
- [ ] Puedes acceder a rutas protegidas con el token

### Verificar Base de Datos

- [ ] Las tablas existen en PostgreSQL
- [ ] Puedes crear registros
- [ ] Puedes leer registros
- [ ] Las relaciones funcionan correctamente

### Verificar Uploads

- [ ] Puedes subir un avatar: `POST /upload/avatar`
- [ ] El archivo se guarda correctamente
- [ ] Puedes acceder al archivo subido
- [ ] El archivo persiste después de un redeploy

---

## 🔐 Seguridad

### Verificaciones de Seguridad

- [ ] HTTPS está habilitado (Render lo hace automáticamente)
- [ ] Los secrets NO están en el código fuente
- [ ] Los secrets NO están en el repositorio Git
- [ ] CORS está configurado correctamente (si aplica)
- [ ] Rate limiting funciona (opcional, según configuración)

### Backup de Información Crítica

- [ ] Credenciales de PostgreSQL guardadas
- [ ] JWT secrets guardados en lugar seguro
- [ ] URL del servicio documentada
- [ ] Variables de entorno documentadas

---

## 📊 Configuración Opcional

### Dominio Personalizado (Opcional)

- [ ] Ve a Settings → Custom Domains
- [ ] Añade tu dominio: `api.tudominio.com`
- [ ] Configura el registro CNAME en tu DNS
- [ ] Verifica que el dominio funciona
- [ ] SSL se configura automáticamente

### CORS (Si tienes frontend en otro dominio)

- [ ] Añade variable: `CORS_ORIGIN=https://tu-frontend.com`
- [ ] Actualiza el código para usar esta variable
- [ ] Redesplegar si es necesario

### Monitoreo (Opcional pero recomendado)

- [ ] Configura alertas en Render Dashboard
- [ ] Integra con servicio de monitoreo (Sentry, LogRocket, etc.)
- [ ] Configura notificaciones por email

### Auto-Deploy (Recomendado)

- [ ] Ve a Settings → Build & Deploy
- [ ] Habilita "Auto-Deploy"
- [ ] Selecciona rama: `main`
- [ ] Ahora cada push desplegará automáticamente

---

## 🐛 Solución de Problemas

Si algo falla, verifica:

### Build Fails

- [ ] Revisa los logs de build en Render
- [ ] Verifica que `package.json` tiene todas las dependencias
- [ ] Prueba `npm ci && npm run build` localmente
- [ ] Verifica que no hay errores de TypeScript

### Application Error

- [ ] Revisa los logs de la aplicación
- [ ] Verifica que las variables de entorno están correctas
- [ ] Verifica que la base de datos está funcionando
- [ ] Intenta reiniciar el servicio

### No se conecta a la Base de Datos

- [ ] Verifica que las variables `DB_*` están correctas
- [ ] Verifica que la base de datos está en la misma región
- [ ] Verifica que la base de datos está "Live"
- [ ] Prueba la conexión desde el Shell: `psql $DATABASE_URL`

### Migraciones Fallan

- [ ] Verifica que `ormconfig.ts` está en la raíz
- [ ] Revisa los logs para ver el error específico
- [ ] Verifica que las migraciones funcionan localmente
- [ ] Intenta ejecutar manualmente desde el Shell

### Archivos Desaparecen

- [ ] Verifica que el disco persistente está configurado
- [ ] Verifica que el mount path es `/app/uploads`
- [ ] Verifica que tu código guarda en la ruta correcta

---

## 📈 Métricas de Éxito

Tu despliegue es exitoso si:

- ✅ Estado del servicio: "Live"
- ✅ Response time < 500ms en promedio
- ✅ 0 errores en los últimos logs
- ✅ Todas las pruebas de API pasan
- ✅ Los archivos subidos persisten
- ✅ Las migraciones están actualizadas

---

## 🎯 Próximos Pasos

Después de un despliegue exitoso:

- [ ] Documenta la URL del servicio
- [ ] Comparte la documentación Swagger con tu equipo
- [ ] Conecta tu aplicación frontend
- [ ] Configura backups de base de datos
- [ ] Planifica el monitoreo y alertas
- [ ] Considera actualizar a un plan superior si es necesario

---

## 📞 Recursos de Ayuda

Si necesitas ayuda:

- 📖 [Guía Completa de Despliegue](./docs/DESPLIEGUE_RENDER.md)
- ⚡ [Inicio Rápido](./docs/INICIO_RAPIDO_RENDER.md)
- 🔐 [Variables de Entorno](./docs/VARIABLES_ENTORNO.md)
- 📋 [Plantilla de Configuración](./docs/PLANTILLA_RENDER.txt)
- 🎯 [Diagrama de Arquitectura](./docs/DIAGRAMA_DESPLIEGUE.md)

**Soporte del Proyecto:**
- Email: creative.feelve@gmail.com
- Equipo: Equipo Desarrollo Nikra

**Soporte de Render:**
- Docs: https://render.com/docs
- Community: https://community.render.com

---

## 💰 Estimación de Costos

Para referencia:

| Componente | Plan | Costo Mensual |
|------------|------|---------------|
| Web Service | Starter | $7 |
| PostgreSQL | Starter | $7 |
| Disco 10GB | Incluido | $0 |
| **TOTAL** | | **~$14/mes** |

_Nota: Con el crédito gratuito de $5/mes de Render = ~$9/mes real_

---

**¡Feliz despliegue!** 🚀

_Última actualización: Octubre 2025_

