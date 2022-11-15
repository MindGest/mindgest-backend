import { Router } from 'express'

import AuthRouter from './auth.route'
import UserRouter from './user.route'
import DocsRouter from './docs.route'
import ProcessRouter from './process.route'

// Mindgest API Router
const api = Router()

// Routes
api.use('/auth', AuthRouter)
api.use('/user', UserRouter)
api.use('/docs', DocsRouter)
api.use('/process', ProcessRouter)

export default api
