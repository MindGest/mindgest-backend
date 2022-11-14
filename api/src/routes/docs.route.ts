import { Router, Request, Response } from 'express'

import SwaggerUI from 'swagger-ui-express'

import documentation from '../utils/swagger.json'

// Documentation Router
const docs: Router = Router()

// Routes
docs.use(
    '/',
    SwaggerUI.serve,
    SwaggerUI.setup(documentation, {
        explorer: true,
        customSiteTitle: 'MindGest API Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
    })
)

// Endpoints
docs.get('/json', (_: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(documentation)
})

export default docs
