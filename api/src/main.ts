import * as dotenv from 'dotenv'
dotenv.config()

import api from './core/api'
import log from './utils/logger'
import docs from './utils/docs'

// Fetch Environment Variables
const HOST = String(process.env.HOST)
const PORT = Number(process.env.PORT)

// Run Server
api.listen(PORT, HOST, () => {
    log.info(`MindGest API is live at http://${HOST}:${PORT}/api`)
    docs(api, HOST, PORT)
})
