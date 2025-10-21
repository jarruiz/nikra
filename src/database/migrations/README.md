# Migraciones de Base de Datos

Este directorio contiene las migraciones de TypeORM para el esquema de la base de datos.

## Comandos Disponibles

### Ver Estado de Migraciones
```bash
npm run migration:show
```
Muestra qué migraciones se han ejecutado y cuáles están pendientes.

### Ejecutar Migraciones
```bash
npm run migration:run
```
Ejecuta todas las migraciones pendientes.

### Generar Nueva Migración
```bash
npm run typeorm migration:generate src/database/migrations/NombreMigracion
```
Genera una nueva migración basada en los cambios detectados entre las entidades actuales y el esquema de la base de datos.

### Crear Migración Vacía
```bash
npm run typeorm migration:create src/database/migrations/NombreMigracion
```
Crea una nueva migración vacía que puedes editar manualmente.

### Revertir Última Migración
```bash
npm run migration:revert
```
Revierte la última migración ejecutada.

## Flujo de Trabajo

1. **Modificar entidades**: Edita las entidades TypeORM en `src/**/entities/`
2. **Generar migración**: Usa `migration:generate` para crear la migración automáticamente
3. **Revisar migración**: Verifica que la migración generada sea correcta
4. **Ejecutar migración**: Usa `migration:run` para aplicar los cambios

## Estructura de Archivos

- Las migraciones se nombran con timestamp: `YYYYMMDDHHMMSSNombreMigracion.ts`
- Cada migración contiene métodos `up()` y `down()` para aplicar y revertir cambios
- La tabla `migrations` en la base de datos registra qué migraciones se han ejecutado

## Buenas Prácticas

- ✅ Siempre revisar las migraciones generadas antes de ejecutarlas
- ✅ Hacer backup de la base de datos antes de migraciones en producción
- ✅ Probar las migraciones en un entorno de desarrollo primero
- ✅ Escribir migraciones reversibles siempre que sea posible
