import express from 'express'
import auth from '../routes/authRoutes.js'
import bodyParser from 'body-parser'

const api = express()

api.use(express.json())
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())
api.use('/auth',auth)

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
