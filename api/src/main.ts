import api from './core/api.js'

// Fetch Environment Variables
const PORT = 5000
const HOST = 'localhost'

// Run Server
api.listen(PORT, HOST, () =>
    console.log(`Server is live at http://${HOST}:${PORT}`)
)
