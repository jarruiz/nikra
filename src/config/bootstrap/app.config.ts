/**
 * Configuración general de la aplicación
 */
export function getAppConfig() {
  const port = Number(process.env.PORT) || 3000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    port,
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
  };
}

/**
 * Muestra información de inicio de la aplicación
 */
export function logStartupInfo(port: number): void {
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Modo: Desarrollo`);
    console.log(`⚡ Hot reload: Habilitado`);
  } else {
    console.log(`🏭 Modo: Producción`);
  }
}
