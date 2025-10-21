# 🧪 Plan de Pruebas (POO) - Nikra Backend

## 📋 Resumen del Plan de Pruebas

Este documento describe el **Plan de Pruebas (POO)** completo para el sistema Nikra Backend, diseñado para verificar el **100% de la funcionalidad** implementada según los requerimientos del cliente.

## 🎯 Objetivos del Testing

### ✅ Cobertura Completa
- **Módulos Core**: Auth, Users, Campaigns, Participations, Associates, Export
- **Funcionalidades**: CRUD, validaciones, seguridad, integraciones
- **APIs**: 25+ endpoints REST completamente probados
- **Seguridad**: Autenticación, autorización, validaciones, sanitización

### 🛡️ Tipos de Pruebas

#### 1. **Pruebas Unitarias** (`test/unit/`)
- Servicios individuales con mocks
- Validaciones de lógica de negocio
- Manejo de errores y excepciones

#### 2. **Pruebas de Integración E2E** (`test/e2e/`)
- Flujos completos de usuario
- Integración entre módulos
- Base de datos real con cleanup

#### 3. **Pruebas de Seguridad**
- Autenticación JWT
- Autorización por roles
- Validación de inputs
- Sanitización de datos

#### 4. **Pruebas de Performance**
- Carga concurrente
- Tiempos de respuesta
- Manejo de recursos

## 🗂️ Estructura de Pruebas

```
test/
├── e2e/                    # Pruebas End-to-End
│   └── app.e2e-spec.ts    # Suite principal E2E
├── unit/                   # Pruebas Unitarias
│   ├── auth.service.spec.ts
│   └── participations.service.spec.ts
├── fixtures/               # Datos de prueba
├── jest-e2e.json          # Configuración Jest E2E
├── setup.ts               # Configuración global
├── run-tests.sh           # Script ejecutor
└── README.md              # Este archivo
```

## 🚀 Comandos de Ejecución

### Ejecutar Plan Completo (POO)
```bash
npm run test:poo
```

### Ejecutar Pruebas Específicas
```bash
# Solo unitarias
npm run test:unit

# Solo E2E
npm run test:e2e

# Todas las pruebas
npm run test:all

# Con cobertura
npm run test:cov
```

## 📊 Cobertura por Módulo

### 🔐 Auth Module
- ✅ Registro de usuarios (datos completos según PDF)
- ✅ Login con credenciales válidas/inválidas
- ✅ Validación JWT y refresh tokens
- ✅ Manejo de errores (duplicados, credenciales)

### 👥 Users Module
- ✅ CRUD completo de usuarios
- ✅ Búsqueda y paginación
- ✅ Actualización de perfil
- ✅ Validaciones de datos
- ✅ Seguridad (solo propios datos)

### 🎯 Campaigns Module
- ✅ CRUD completo de campañas
- ✅ Cambio de estados (activo/inactivo)
- ✅ Clonado de campañas
- ✅ Listado activo/inactivo
- ✅ Validaciones de duplicados

### 🎫 Participations Module (CORE)
- ✅ Formulario manual según PDF
- ✅ Validaciones de negocio:
  - Límite 5 participaciones/día
  - Fechas válidas (no futuras, máximo 30 días)
  - No duplicados por comercio
- ✅ Integración con Users y Associates
- ✅ Seguridad por usuario

### 🏪 Associates Module
- ✅ CRUD completo de comercios
- ✅ Listado activo optimizado para desplegables
- ✅ Validaciones de duplicados
- ✅ Integración con Participations

### 📊 Export Module
- ✅ Exportación Excel (.xlsx) con ExcelJS
- ✅ Exportación CSV compatible
- ✅ Filtros avanzados por usuario, comercio, fechas
- ✅ Estadísticas de exportación
- ✅ Headers correctos para descarga

## 🛡️ Pruebas de Seguridad

### Autenticación
- ✅ Tokens JWT válidos/inválidos
- ✅ Refresh tokens
- ✅ Expiración de tokens

### Autorización
- ✅ Acceso solo a datos propios
- ✅ Protección de endpoints
- ✅ Manejo de usuarios inactivos

### Validaciones
- ✅ Input sanitization
- ✅ Validación de formatos (email, DNI, fechas)
- ✅ Límites de caracteres y valores
- ✅ Prevención de inyección SQL

### Rate Limiting
- ✅ Límites por IP
- ✅ Límites por usuario
- ✅ Protección contra abuso

## 📈 Métricas de Calidad

### Cobertura de Código
- **Objetivo**: >90% cobertura
- **Archivos críticos**: 100% cobertura
- **Servicios**: 100% cobertura

### Performance
- **Tiempo de respuesta**: <500ms promedio
- **Carga concurrente**: 100+ usuarios simultáneos
- **Base de datos**: Queries optimizadas

### Seguridad
- **OWASP Top 10**: Mitigado
- **Autenticación**: JWT robusto
- **Validaciones**: Completa en todos los inputs

## 🔧 Configuración de Testing

### Variables de Entorno
```
NODE_ENV=test
DB_DATABASE=nikra_test_db
JWT_SECRET=test-secret
```

### Base de Datos de Testing
- Base de datos separada para pruebas
- Limpieza automática entre ejecuciones
- Migraciones automáticas

### Docker
- PostgreSQL containerizado para testing
- Redis para cache de testing
- Limpieza automática de contenedores

## 📋 Checklist de Validación

### Pre-Entrega
- [ ] ✅ Compilación sin errores
- [ ] ✅ Linting 100% limpio
- [ ] ✅ Pruebas unitarias pasando
- [ ] ✅ Pruebas E2E pasando
- [ ] ✅ Cobertura >90%
- [ ] ✅ Endpoints funcionando
- [ ] ✅ Documentación Swagger accesible
- [ ] ✅ Base de datos migrada
- [ ] ✅ Seguridad validada

### Post-Despliegue
- [ ] ✅ Health checks funcionando
- [ ] ✅ Logs estructurados
- [ ] ✅ Monitoreo configurado
- [ ] ✅ Backup automático
- [ ] ✅ SSL/TLS configurado

## 🚨 Casos de Error Cubiertos

### Errores de Validación
- ✅ Datos requeridos faltantes
- ✅ Formatos inválidos (email, DNI, fechas)
- ✅ Límites de caracteres excedidos
- ✅ Valores fuera de rango

### Errores de Negocio
- ✅ Usuario duplicado
- ✅ Comercio inactivo
- ✅ Límites de participaciones
- ✅ Fechas inválidas

### Errores de Sistema
- ✅ Base de datos no disponible
- ✅ Token expirado
- ✅ Usuario inactivo
- ✅ Recursos no encontrados

## 📞 Soporte y Mantenimiento

### Monitoreo Continuo
- Health checks automatizados
- Alertas de performance
- Logs de errores centralizados

### Actualización de Pruebas
- Nuevas funcionalidades requieren nuevas pruebas
- Regresión testing en cada deploy
- Revisión mensual de cobertura

---
