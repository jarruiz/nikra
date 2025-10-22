# 🔗 Conectar a Base de Datos de Render desde Local

## 📋 Pasos para Conectar

### 1. **Obtener Credenciales de Render**

1. Ve a tu dashboard: https://dashboard.render.com/
2. Selecciona la base de datos `nikra-db`
3. En la pestaña **"Info"** copia estos valores:
   - **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `nikra_db`
   - **Username**: `nikra_user`
   - **Password**: (haz clic en "Show" para verla)

### 2. **Configurar Variables de Entorno Locales**

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Base de datos de Render
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_USERNAME=nikra_user
DB_PASSWORD=tu_password_aqui
DB_DATABASE=nikra_db

# Entorno
NODE_ENV=development

# JWT (usa los mismos valores que en Render)
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_aqui
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200,https://nikra-front.vercel.app
```

### 3. **Ejecutar la Aplicación Localmente**

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones (si es necesario)
npm run migration:run

# Iniciar la aplicación
npm run start:dev
```

## 🛠️ Herramientas de Conexión

### **Opción 1: pgAdmin (GUI)**
1. Descarga pgAdmin: https://www.pgadmin.org/
2. Crear nueva conexión:
   - **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `nikra_db`
   - **Username**: `nikra_user`
   - **Password**: (tu password de Render)

### **Opción 2: DBeaver (GUI)**
1. Descarga DBeaver: https://dbeaver.io/
2. Crear nueva conexión PostgreSQL
3. Usar las mismas credenciales

### **Opción 3: psql (Terminal)**
```bash
# Instalar psql (si no lo tienes)
sudo apt-get install postgresql-client

# Conectar
psql -h dpg-xxxxx-a.oregon-postgres.render.com -U nikra_user -d nikra_db
```

### **Opción 4: VS Code Extension**
1. Instalar "PostgreSQL" extension en VS Code
2. Crear nueva conexión con las credenciales

## 🔧 Comandos Útiles

### **Verificar Conexión**
```bash
# Probar conexión
npm run typeorm query "SELECT version();"

# Ver tablas
npm run typeorm query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Ver estructura de users
npm run typeorm query "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';"
```

### **Ejecutar Migraciones**
```bash
# Ver migraciones pendientes
npm run typeorm migration:show

# Ejecutar migraciones
npm run migration:run

# Revertir migración
npm run typeorm migration:revert
```

### **Backup de Base de Datos**
```bash
# Crear backup
pg_dump -h dpg-xxxxx-a.oregon-postgres.render.com -U nikra_user -d nikra_db > backup.sql

# Restaurar backup
psql -h dpg-xxxxx-a.oregon-postgres.render.com -U nikra_user -d nikra_db < backup.sql
```

## ⚠️ Consideraciones Importantes

### **Seguridad**
- **NUNCA** subas el archivo `.env.local` a Git
- Usa variables de entorno en lugar de hardcodear credenciales
- Considera usar un archivo `.env.render.local` que esté en `.gitignore`

### **Rendimiento**
- La conexión desde local a Render puede ser más lenta
- Considera usar una base de datos local para desarrollo
- Usa la BD de Render solo para pruebas de integración

### **Límites de Render**
- Las conexiones externas pueden tener límites de tiempo
- Algunos planes de Render limitan las conexiones simultáneas
- Verifica que tu plan permita conexiones externas

## 🚀 Flujo de Trabajo Recomendado

### **Desarrollo Local**
```bash
# 1. Base de datos local para desarrollo
npm run migration:run  # En BD local
npm run start:dev     # Desarrollo local
```

### **Pruebas de Integración**
```bash
# 2. Base de datos de Render para pruebas
# Configurar .env.local con credenciales de Render
npm run migration:run  # En BD de Render
npm run start:dev     # Pruebas con BD real
```

### **Producción**
```bash
# 3. Despliegue automático en Render
git push origin main  # Trigger automático
```

## 📱 Troubleshooting

### **Error de Conexión**
```bash
# Verificar que la BD esté activa
curl -I https://nikra-backend.onrender.com/api/docs

# Verificar variables de entorno
echo $DB_HOST
echo $DB_USERNAME
```

### **Error de Permisos**
```bash
# Verificar que el usuario tenga permisos
npm run typeorm query "SELECT current_user, current_database();"
```

### **Error de SSL**
```bash
# Agregar SSL a la conexión
DB_SSL=true
```

¿Necesitas ayuda con algún paso específico o tienes algún error al conectarte?

