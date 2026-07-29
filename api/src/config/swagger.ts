import swaggerUi from 'swagger-ui-express'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { Application } from 'express'
import { env } from './env'

// We create a global registry
export const registry = new OpenAPIRegistry()

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

export function setupSwagger(app: Application) {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: env.APP_VERSION,
      title: 'Luxury Showroom API',
      description: 'API for the luxury automobile showroom platform',
    },
    servers: [{ url: '/api/v1' }],
  })

  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(document, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Luxury Showroom API Docs'
  }))
}
