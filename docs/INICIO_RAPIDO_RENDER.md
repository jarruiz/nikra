# ⚡ Inicio Rápido - Despliegue en Render

Guía express para desplegar tu aplicación en Render en menos de 10 minutos.

## 🚀 Pasos Rápidos

### 1️⃣ Crear Cuenta en Render

Ve a [render.com](https://render.com) y crea una cuenta (puedes usar GitHub para login).

---

### 2️⃣ Conectar Repositorio

1. Click en **"New +"** → **"Blueprint"**
2. Conecta tu cuenta de GitHub/GitLab
3. Selecciona el repositorio `cca-ceuta-backend`
4. Render detectará el archivo `render.yaml`
5. Click en **"Apply"**

---

### 3️⃣ Configurar Secrets JWT

Render creará automáticamente:
- ✅ Base de datos PostgreSQL
- ✅ Servicio Web
- ✅ Variables de entorno básicas

**Pero necesitas configurar manualmente los JWT secrets:**

1. Ve al servicio web recién creado
2. Click en **"Environment"**
3. Busca y edita:

```bash
JWT_SECRET = <pega-aqui-un-valor-seguro>
JWT_REFRESH_SECRET = <pega-aqui-otro-valor-seguro>
```

**Genera los valores con este comando:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ejecuta el comando **dos veces** para obtener dos valores diferentes.

4. Click en **"Save Changes"**

---

### 4️⃣ Ejecutar Migraciones

Una vez que el despliegue termine (verás "Live" en verde):

1. En tu servicio web, click en **"Shell"**
2. Ejecuta:

```bash
npm run migration:run
```

3. Verifica que las migraciones se ejecutaron:

```bash
npm run migration:show
```

---

### 5️⃣ ¡Verificar que Funciona!

Abre tu navegador y ve a:

```
https://tu-servicio.onrender.com/api/docs
```

Deberías ver la documentación de Swagger UI. 🎉

---

## 📋 Checklist de Verificación

Antes de considerar el despliegue completo:

- [ ] La aplicación muestra "Live" en verde en Render
- [ ] Puedes acceder a `/api/docs` sin errores
- [ ] Las migraciones se ejecutaron correctamente
- [ ] Los JWT secrets están configurados (no los valores por defecto)
- [ ] El disco persistente está configurado (para archivos)
- [ ] Las variables de entorno de la base de datos están correctas

---

## 🐛 Problemas Comunes

### ❌ "Application Error" al acceder a la URL

**Causa**: Probablemente las variables de base de datos no están correctas.

**Solución**:
1. Ve a **"Environment"** en tu servicio
2. Verifica que `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` estén configurados
3. Si usaste Blueprint, deberían estar autoconfiguradas

---

### ❌ Build falla con errores de TypeScript

**Causa**: Dependencias faltantes o código con errores.

**Solución**:
1. Revisa los logs de build en Render
2. Verifica que el código compile localmente: `npm run build`
3. Asegúrate de que todas las dependencias estén en `package.json`

---

### ❌ Migraciones no se ejecutan

**Causa**: TypeORM no encuentra el archivo `ormconfig.ts`.

**Solución**:
1. Verifica que `ormconfig.ts` esté en la raíz del proyecto
2. Ejecuta manualmente desde el Shell: `npm run migration:run`

---

### ❌ Los archivos subidos desaparecen después de redesplegar

**Causa**: No has configurado el disco persistente.

**Solución**:
1. Ve a tu servicio → **"Disks"**
2. Click en **"Add Disk"**
3. Configura:
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `10 GB`

---

## 🔄 Redesplegar

Render despliega automáticamente cuando haces push a la rama `main` (o la configurada).

**Para redesplegar manualmente:**

1. Ve a tu servicio web
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📚 Recursos Adicionales

- **Guía Completa**: [DESPLIEGUE_RENDER.md](./DESPLIEGUE_RENDER.md)
- **Variables de Entorno**: [VARIABLES_ENTORNO.md](./VARIABLES_ENTORNO.md)
- **Render Docs**: https://render.com/docs

---

## 🎯 Próximos Pasos

Después de un despliegue exitoso:

1. ✅ Configura un dominio personalizado
2. ✅ Conecta tu aplicación frontend
3. ✅ Configura CORS para tu dominio frontend
4. ✅ Configura monitoreo y alertas
5. ✅ Planifica backups de la base de datos

---

## 💰 Costos Estimados

Para una aplicación en producción pequeña/mediana:

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| **Web Service** | Starter | $7/mes |
| **PostgreSQL** | Starter | $7/mes |
| **Disk (10GB)** | Incluido | $0 |
| **Total** | | **~$14/mes** |

**Nota**: Render ofrece $5 de crédito gratis al mes, así que el costo real podría ser ~$9/mes.

Para desarrollo/testing, puedes usar el plan Free (expira en 90 días).

---

## 📞 ¿Necesitas Ayuda?

- 📖 Revisa la [Guía Completa](./DESPLIEGUE_RENDER.md)
- 🌐 [Render Community](https://community.render.com)
- 📧 Email: creative.feelve@gmail.com

---

**¡Feliz despliegue!** 🚀

