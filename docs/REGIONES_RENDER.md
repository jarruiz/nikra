# 🌍 Regiones de Render

## Regiones Disponibles

Render ofrece las siguientes regiones para desplegar servicios y bases de datos:

| Región | Código | Ubicación | Mejor Para |
|--------|--------|-----------|------------|
| **Frankfurt** | `frankfurt` | 🇩🇪 Alemania | **España**, Europa, Medio Oriente, África |
| Oregon | `oregon` | 🇺🇸 EE.UU. Costa Oeste | América del Norte (oeste), Asia |
| Ohio | `ohio` | 🇺🇸 EE.UU. Medio Oeste | América del Norte (centro) |
| Virginia | `virginia` | 🇺🇸 EE.UU. Costa Este | América del Norte (este), América del Sur |
| Singapore | `singapore` | 🇸🇬 Singapur | Asia, Oceanía |

## 🇪🇸 Para Aplicaciones en España

### Región Recomendada: **Frankfurt**

**Frankfurt es la única región europea de Render** y la opción óptima para usuarios en España por las siguientes razones:

✅ **Proximidad geográfica:**
- Distancia: ~1,500 km de España
- Latencia estimada: 20-40ms

✅ **Cumplimiento normativo:**
- Datos almacenados en la UE
- Cumple con GDPR (Reglamento General de Protección de Datos)
- Cumple con normativas europeas de privacidad

✅ **Rendimiento:**
- Menor latencia para usuarios españoles y europeos
- Mejor experiencia de usuario
- Tiempos de carga más rápidos

### Latencia Estimada desde España

| Región | Latencia Aproximada |
|--------|---------------------|
| **Frankfurt** | **20-40 ms** ⚡ |
| Virginia | 80-120 ms |
| Ohio | 100-140 ms |
| Oregon | 140-180 ms |
| Singapore | 200-280 ms |

## ⚠️ Importante: Consistencia de Región

**El servicio web y la base de datos DEBEN estar en la misma región** para:

- ✅ Minimizar latencia entre el backend y la base de datos
- ✅ Evitar cargos de transferencia de datos entre regiones
- ✅ Mejorar el rendimiento general
- ✅ Reducir costos

### Ejemplo en `render.yaml`:

```yaml
services:
  - type: web
    region: frankfurt  # ✅ Backend en Frankfurt

databases:
  - name: nikra-db
    region: frankfurt  # ✅ Base de datos también en Frankfurt
```

## 📝 Notas

### Cambio de Región

⚠️ **Render NO permite cambiar la región de un servicio existente.**

Si necesitas cambiar de región:

1. Crea un nuevo servicio en la región deseada
2. Crea una nueva base de datos en la misma región
3. Migra tus datos
4. Actualiza las DNS/configuraciones
5. Elimina los servicios antiguos

### Selección de Región

Puedes seleccionar la región:

**Opción A: Durante la creación (Blueprint)**
- Edita el campo `region` en `render.yaml`
- Render usa esa región al crear los servicios

**Opción B: Durante la creación (Manual)**
- Selecciona la región en el dropdown al crear el servicio
- Selecciona la región en el dropdown al crear la base de datos

## 🎯 Recomendaciones por Caso de Uso

### Para CCA Ceuta (Este Proyecto)

✅ **Frankfurt** - Los usuarios están principalmente en Ceuta y España

### Para Aplicaciones Globales

Si tienes usuarios en múltiples continentes:

1. **Opción A: Multi-región** (Plan Enterprise)
   - Despliega en múltiples regiones
   - Usa un CDN global
   - Enruta usuarios a la región más cercana

2. **Opción B: Región central**
   - Elige la región donde está la mayoría de usuarios
   - Usa CDN para contenido estático

### Para Diferentes Mercados

| Tu Mercado Principal | Región Recomendada |
|---------------------|-------------------|
| España, Europa | **Frankfurt** |
| EE.UU. Este, América del Sur | Virginia |
| EE.UU. Oeste | Oregon |
| EE.UU. Centro | Ohio |
| Asia, Pacífico | Singapore |

## 🔗 Referencias

- [Documentación oficial de Regiones de Render](https://render.com/docs/regions)
- [Pricing de Render](https://render.com/pricing)
- [GDPR Compliance](https://render.com/privacy)

---

## 💡 Tips

1. **Test de latencia:** Haz ping a los servidores de Render desde tu ubicación para verificar latencia real

2. **Usuarios distribuidos:** Si tienes usuarios en múltiples continentes, considera usar un CDN como Cloudflare

3. **Costos:** Los precios son los mismos en todas las regiones

4. **Respaldos:** Render hace backups automáticos de bases de datos en la misma región

---

**Última actualización:** Octubre 2025

