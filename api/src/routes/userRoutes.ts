import * as express from 'express'
import { getAllUsers, editUser } from '../controllers/userController';

const routerUser = express.Router()

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

routerUser.get('/list', (request, response) => {getAllUsers(request,response)})

routerUser.put('/edit', (request, response) => {editUser(request,response)})


export default routerUser