import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configura Swagger/OpenAPI para documentación de la API
 */
export function setupSwagger(app: INestApplication): void {
  // Configuración del DocumentBuilder
  const configBuilder = new DocumentBuilder()
    .setTitle('Nikra API')
    .setDescription(`
      ## Sistema de Digitalización de Campañas Promocionales - CCA Ceuta
      
      ### Características:
      - **Autenticación JWT** con refresh tokens
      - **Rate Limiting** por endpoint
      - **Validación automática** de entrada
      - **Sanitización** de datos
      
      ### Roles Disponibles:
      - **end_user**: Usuario final de participaciones
    `)
    .setVersion('1.0')
    .setContact(
      'Equipo Desarrollo Nikra',
      'https://nikra.cca.ceuta.es',
      'info@cca.ceuta.es'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    );

  // Configurar servidores según el entorno
  if (process.env.NODE_ENV === 'production') {
    // En producción, agregar el servidor de Render
    configBuilder.addServer('https://nikra-backend.onrender.com', 'Render (Producción)');
    configBuilder.addServer('https://api.nikra.cca.ceuta.es', 'Dominio Personalizado');
  } else {
    // En desarrollo, usar localhost
    configBuilder.addServer('http://localhost:3000', 'Desarrollo Local');
  }

  const config = configBuilder
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('campaigns', 'Gestión de campañas')
    .addTag('participations', 'Participaciones en campañas')
    .addTag('associates', 'Comercios asociados')
    .addTag('export', 'Exportación de datos')
    .build();

  // Crear documento
  const document = SwaggerModule.createDocument(app, config);
  
  // Configurar Swagger UI
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      docExpansion: 'none',
      defaultModelExpandDepth: 3,
      defaultModelsExpandDepth: 1,
    },
    customSiteTitle: 'Nikra API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Endpoint JSON para documentación
  app.use('/api/docs-json', (req, res) => {
    res.json(document);
  });
}
