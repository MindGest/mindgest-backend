import { Router, Request, Response } from 'express'
import { request } from 'http'
import controller from '../controllers/user.controller'

const user = Router()

/**
 * @openapi
 * /api/user/list:
 *  get:
 *      tags:
 *      - user
 *      summary: Endpoint that returns all the users in the database.
 *      description: ''
 *      responses:
 *          200:
 *              description: Successfully retrieved all the users.
 */

user.get('/list', (req: Request, res: Response) => {
    controller.getAllUsers(req, res)
})

user.post("/avatar", (req: Request, res: Response) => {
    controller.uploadAvatar(req, res)
})

user.put('/edit', (req: Request, res: Response) => {
    controller.editUser(req, res)
})

export default user
