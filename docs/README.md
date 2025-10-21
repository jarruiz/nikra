# 📚 Documentación del Proyecto

Bienvenido a la documentación completa del backend de Nikra.

## 🚀 Despliegue en Render

### Guías Disponibles

| Documento | Descripción | Tiempo Estimado |
|-----------|-------------|-----------------|
| **[⚡ Inicio Rápido](./INICIO_RAPIDO_RENDER.md)** | Guía express para desplegar en menos de 10 minutos | ~10 min |
| **[📖 Guía Completa](./DESPLIEGUE_RENDER.md)** | Documentación detallada con todas las opciones | ~30 min |
| **[🔐 Variables de Entorno](./VARIABLES_ENTORNO.md)** | Lista completa de variables y cómo generarlas | ~5 min |
| **[📋 Plantilla de Configuración](./PLANTILLA_RENDER.txt)** | Template para copiar y pegar en Render | ~2 min |

### ¿Por dónde empezar?

#### 🎯 Si es tu primera vez desplegando en Render:
👉 Comienza con [**Inicio Rápido**](./INICIO_RAPIDO_RENDER.md)

#### 📚 Si necesitas entender todo el proceso en detalle:
👉 Lee la [**Guía Completa**](./DESPLIEGUE_RENDER.md)

#### ⚙️ Si solo necesitas configurar las variables de entorno:
👉 Revisa [**Variables de Entorno**](./VARIABLES_ENTORNO.md)

#### 📋 Si quieres una referencia rápida:
👉 Usa la [**Plantilla de Configuración**](./PLANTILLA_RENDER.txt)

## 📖 Contenido de las Guías

### ⚡ Inicio Rápido
- Pasos básicos para desplegar
- Checklist de verificación
- Solución rápida de problemas comunes
- Estimación de costos

### 📖 Guía Completa
- Dos métodos de despliegue (automático y manual)
- Configuración de base de datos PostgreSQL
- Configuración de disco persistente
- Migraciones de base de datos
- Dominios personalizados
- Monitoreo y logs
- Solución detallada de problemas
- Escalabilidad y mejores prácticas

### 🔐 Variables de Entorno
- Lista completa de variables obligatorias y opcionales
- Cómo generar JWT secrets seguros
- Mejores prácticas de seguridad
- Cómo actualizar variables
- Qué hacer si un secret se compromete

### 📋 Plantilla de Configuración
- Template listo para copiar y pegar
- Checklist paso a paso
- Valores de configuración recomendados
- Comandos útiles

## 🛠️ Scripts Útiles

### Script de Post-Despliegue

Ejecuta este script después de cada despliegue para aplicar migraciones:

```bash
./scripts/post-deploy.sh
```

El script:
- ✅ Verifica variables de entorno
- ✅ Ejecuta migraciones pendientes
- ✅ Muestra el estado de las migraciones

## 📁 Archivos de Configuración

### `render.yaml`

Archivo en la raíz del proyecto que define la infraestructura completa:
- Servicio web (Backend NestJS)
- Base de datos PostgreSQL
- Variables de entorno
- Disco persistente

Este archivo permite despliegue automático usando Render Blueprints.

## 🎓 Recursos Adicionales

### Documentación de Render
- [Render Docs](https://render.com/docs)
- [Environment Variables](https://render.com/docs/environment-variables)
- [PostgreSQL](https://render.com/docs/databases)
- [Persistent Disks](https://render.com/docs/disks)
- [Deploy Hooks](https://render.com/docs/deploy-hooks)

### Documentación de NestJS
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM](https://typeorm.io)
- [NestJS Deployment](https://docs.nestjs.com/faq/serverless)

## 💡 Tips y Mejores Prácticas

### Seguridad
- 🔒 Nunca commitees archivos `.env`
- 🔑 Usa secrets únicos para cada entorno
- 🔄 Rota los JWT secrets cada 3-6 meses
- 🛡️ Configura CORS correctamente para tu frontend

### Performance
- 🚀 Usa planes superiores para producción (Standard o superior)
- 📊 Monitorea el uso de CPU y RAM regularmente
- 💾 Considera añadir Redis para cache
- 🔍 Revisa los logs periódicamente

### Mantenimiento
- 📅 Programa backups regulares de la base de datos
- 🔄 Mantén las dependencias actualizadas
- 📝 Documenta cambios importantes
- 🧪 Prueba en un entorno de staging antes de producción

## 🐛 Solución de Problemas

### Problemas Comunes

| Problema | Documento de Referencia |
|----------|------------------------|
| Error de conexión a base de datos | [Guía Completa - Solución de Problemas](./DESPLIEGUE_RENDER.md#solución-de-problemas) |
| Migraciones no se ejecutan | [Inicio Rápido - Problemas Comunes](./INICIO_RAPIDO_RENDER.md#problemas-comunes) |
| Variables de entorno incorrectas | [Variables de Entorno](./VARIABLES_ENTORNO.md#verificar-variables) |
| Archivos subidos desaparecen | [Guía Completa - Almacenamiento](./DESPLIEGUE_RENDER.md#almacenamiento-persistente) |

## 📞 Soporte

### Soporte del Proyecto
- **Email**: creative.feelve@gmail.com
- **Equipo**: Equipo Desarrollo Nikra

### Soporte de Render
- **Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Support**: support@render.com (planes de pago)

## 🎯 Roadmap de Documentación

Próximas guías a añadir:

- [ ] Guía de despliegue en AWS
- [ ] Guía de despliegue en Railway
- [ ] Configuración de CI/CD con GitHub Actions
- [ ] Monitoreo avanzado con Sentry
- [ ] Configuración de backups automáticos
- [ ] Guía de migración entre plataformas

---

**Última actualización**: Octubre 2025

¿Encontraste un error en la documentación? Por favor, repórtalo al equipo.

