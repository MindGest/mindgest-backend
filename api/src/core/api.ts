import express from 'express'

const api = express()

api.use(express.json())

/**
 * @openapi
 * /api:
 *  get:
 *     tags:
 *     - Root
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
api.get('/api', (req, res) => res.send('<h1>Hello World!</h1>'))

export default api
