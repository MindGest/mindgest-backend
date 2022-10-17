import { Express, Request, Response } from 'express'
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

import log from './logger'

import { version } from '../../package.json'

const options: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.3',
        info: {
            description: 'This is the Mindgest Rest API Documentation',
            title: 'Mindgest API Docs',
            contact: { email: 'gp2223@gmail.com' },
            license: {
                name: 'MIT',
                url: 'https://mit-license.org/',
            },
            version: version,
        },
        servers: [
            { url: 'http://mindgest.dei.uc.pt' },
            { url: 'http://localhost:8080' },
        ],
        externalDocs: {
            description: 'Find out more about us',
            url: 'http://github.com/Mindgest',
        },
    },
    apis: ['./src/core/api.ts', './src/routes/*.ts'],
}

const swaggerSpec = swaggerJsDoc(options)

export default function docs(app: Express, host: String, port: Number) {
    // Swagger UI Docs
    app.use(
        '/api/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, {
            explorer: true,
            customSiteTitle: 'MindGest API Documentation',
        })
    )

    // Docs in JSON format
    app.get('/api/docs/api.json', (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })
    log.info(`Docs available at http://${host}:${port}/api/docs`)
}
