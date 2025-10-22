# 🔄 Ejecutar Migraciones en Render

## Ejecución Automática (Configurada por Defecto)

La aplicación está configurada para ejecutar migraciones automáticamente en producción:

```typescript
// src/app.module.ts línea 51
migrationsRun: process.env.NODE_ENV === 'production'
```

### Cuando se Ejecutan las Migraciones

Las migraciones se ejecutan automáticamente:
- ✅ Al iniciar la aplicación después de un nuevo deploy
- ✅ Cada vez que Render reinicia el servicio
- ✅ Cuando hay migraciones pendientes

### Ver Logs de Migración

1. Ve a tu dashboard de Render: https://dashboard.render.com/
2. Selecciona el servicio `nikra-backend`
3. Click en la pestaña **Logs**
4. Busca mensajes como:
   ```
   [TypeORM] Running migration UpdateUserFields1760850000000
   [TypeORM] Migration UpdateUserFields1760850000000 has been executed successfully
   ```

---

## Ejecución Manual (Si es Necesario)

### Opción 1: Shell de Render (Recomendado)

Render permite ejecutar comandos en tu servicio:

1. **Ir al Dashboard:**
   ```
   https://dashboard.render.com/
   ```

2. **Seleccionar el Servicio:**
   - Click en `nikra-backend`

3. **Abrir Shell:**
   - En el menú superior derecho, click en **"Shell"**
   - Se abrirá una terminal conectada a tu contenedor

4. **Ejecutar Migración:**
   ```bash
   npm run migration:run
   ```

### Opción 2: SSH Temporal (Para Debugging)

Si necesitas acceso SSH temporal:

```bash
# Desde tu terminal local
render ssh nikra-backend
```

Luego ejecuta:
```bash
cd /opt/render/project/src
npm run migration:run
```

### Opción 3: Crear Script de Post-Deploy

Ya tienes un script en `scripts/post-deploy.sh`, pero si necesitas mejorarlo:

```bash
#!/bin/bash
set -e

echo "🔄 Ejecutando migraciones..."
npm run migration:run

echo "✅ Migraciones completadas"
```

Y en `render.yaml`, agregar:

```yaml
services:
  - type: web
    name: nikra-backend
    # ... otras configuraciones
    buildCommand: npm install --include=dev && npx nest build && bash scripts/post-deploy.sh
```

---

## Comandos Útiles de Migraciones

### Ver Migraciones Pendientes
```bash
npm run typeorm migration:show
```

### Ejecutar Migraciones
```bash
npm run migration:run
```

### Revertir Última Migración
```bash
npm run migration:revert
```

### Generar Nueva Migración
```bash
npm run migration:generate -- src/database/migrations/MiNuevaMigracion
```

---

## Verificar Estado de la Base de Datos

### Conectarse a PostgreSQL en Render

1. **Obtener Credenciales:**
   - Dashboard → Base de datos `nikra-db`
   - Click en **"Connect"** → **"External Connection"**
   - Copia el comando PSQL

2. **Conectar desde tu terminal local:**
   ```bash
   PGPASSWORD=tu_password psql -h tu-host.oregon-postgres.render.com -U nikra_user nikra_db
   ```

3. **Verificar estructura de tabla users:**
   ```sql
   \d users
   ```

   Deberías ver:
   ```
   Column        | Type                        | Modifiers
   --------------+-----------------------------+-----------
   id            | uuid                        | not null
   fullName      | character varying(200)      | not null
   dni           | character varying(20)       | not null
   phone         | character varying(15)       |
   email         | character varying(255)      | not null
   password      | character varying(255)      | not null
   ...
   ```

---

## Troubleshooting

### Error: "Migration already executed"

Si ves este error, la migración ya se ejecutó. Para verificar:

```bash
# En la BD
SELECT * FROM migrations;
```

### Error: "relation does not exist"

La migración falló a medias. Opciones:

1. **Revertir y volver a ejecutar:**
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

2. **Verificar logs en Render** para ver el error específico

### Error: "Connection timeout"

La BD puede estar ocupada o las credenciales son incorrectas:

1. Verifica las variables de entorno en Render
2. Verifica que la BD esté activa
3. Chequea los logs de la BD en Render

---

## Mejores Prácticas

✅ **Siempre probar migraciones localmente primero**
```bash
# Con base de datos local
npm run migration:run
```

✅ **Hacer backup antes de migraciones importantes**
```bash
# En Render Dashboard → nikra-db → Backups
# O manualmente:
pg_dump -h host -U user -d database > backup.sql
```

✅ **Monitorear logs durante deploy**
- Estar atento a errores de migración
- Verificar que la aplicación inicie correctamente

✅ **Tener plan de rollback**
- Cada migración debe tener un método `down()`
- Saber cómo revertir cambios si algo falla

---

## Migración Actual: UpdateUserFields

### Cambios que Aplica:

1. ✅ Crea columna `fullName` (varchar 200)
2. ✅ Migra datos: `fullName = nombre + ' ' + apellidos`
3. ✅ Elimina columnas `nombre`, `apellidos`, `direccion`
4. ✅ Agrega columna `phone` (varchar 15, nullable)

### Datos que se Preservan:

- ✅ ID de usuarios
- ✅ Email, password, DNI
- ✅ Fechas de creación
- ✅ Estado de activación

### Datos que se Transforman:

- 📝 "Juan" + "García López" → "Juan García López"

### Datos que se Pierden:

- ❌ Dirección (se elimina completamente)

---

## Contacto y Soporte

Si tienes problemas con las migraciones:
1. Revisa los logs en Render
2. Verifica la estructura de la BD
3. Consulta este documento
4. Contacta al equipo de desarrollo

