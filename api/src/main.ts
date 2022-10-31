import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
dotenv.config()

import api from './core/api.js'
import log from './utils/logger.js'
import docs from './utils/docs.js'

// Fetch Environment Variables
const HOST = String(process.env.HOST)
const PORT = Number(process.env.PORT)

const prisma = new PrismaClient()

// const newUser = await prisma.person.create({
//     data: {
//         active: false,
//         address: 'Rua do G.D.R. da chã',
//         name: 'Pedro Rodrigues',
//         email: 'pedror@student.dei.uc.pt',
//         aproved: true,
//         birth_date: new Date(),
//         password: '123',
//         phone_number: 924109520,
//     },
// })

//const users = await prisma.person.findMany()
//console.log(users)

// Run Server
api.listen(PORT, HOST, () => {
     log.info(`MindGest API is live at http://${HOST}:${PORT}/api`)
     docs(api, HOST, PORT)
})
