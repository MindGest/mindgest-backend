import express from 'express'

const api = express()

api.get('/', (req, res) => res.send('<h1>Hello World!</h1>'))

export default api
