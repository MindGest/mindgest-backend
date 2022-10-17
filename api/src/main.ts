import api from './core/api'
import log from './utils/logger'
import docs from './utils/docs'

// Fetch Environment Variables
const PORT = 8080
const HOST = 'localhost'

// Run Server
api.listen(PORT, HOST, () => {
    log.info(`MindGest API is live at http://${HOST}:${PORT}/api`)

    docs(api, HOST, PORT)
})
