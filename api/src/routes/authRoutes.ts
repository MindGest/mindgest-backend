import * as express from 'express'
import { login, register, logout } from '../controllers/authController'
import { authenticateUser } from '../middleware/authentication'
import {
    IGetPersonAuthInfoRequest,
    GetPayloadAuthInfoRequest,
} from '../utils/requestDefinitions'

const router = express.Router()

/**
 * @openapi
 * /api/auth/register:
 *  post:
 *    tags:
 *      - auth
 *    summary: Endpoint to register a endpoint
 *    description: ''
 *    responses:
 *      200:
 *        description: successful registration
 *    parameters:
 *       - name: name
 *         in: body
 *         description: Name of user
 *         required: true
 *         schema:
 *           type: string
 *       - name: address
 *         in: body
 *         description: Address of user
 *         required: true
 *         schema:
 *           type: string
 *       - name: email
 *         in: body
 *         description: Email of user
 *         required: true
 *         schema:
 *           type: string
 *       - name: password
 *         in: body
 *         description: Password of user
 *         required: true
 *         schema:
 *           type: string
 *       - name: birth_date
 *         in: body
 *         description: Birth date of user
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - name: phone_number
 *         in: body
 *         description: Phone number of user
 *         required: true
 *         schema:
 *           type: string
 *       - name: type
 *         in: body
 *         description: type of user
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accountant, guard, intern, patient, therapist]
 *       - name: tax_number
 *         in: body
 *         description: tax number of Patient
 *         required: false
 *         schema:
 *           type: string
 *       - name: health_number
 *         in: body
 *         description: health number of Patient
 *         required: false
 *         schema:
 *           type: string
 *       - name: request
 *         in: body
 *         description: request of Patient
 *         required: false
 *         schema:
 *           type: string
 *       - name: remarks
 *         in: body
 *         description: remarks of Patient
 *         required: false
 *         schema:
 *           type: string
 *       - name: school
 *         in: body
 *         description: school of Patient
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *       - name: profession
 *         in: body
 *         description: profession of Patient
 *         required: false
 *         schema:
 *           type: integer
 *           format: int64
 *       - name: extern
 *         in: body
 *         description: If therapist is extern or intern
 *         required: false
 *         schema:
 *           type: boolean
 *       - name: admin
 *         in: body
 *         description: If therapist is admin or not
 *         required: false
 *         schema:
 *           type: boolean
 *       - name: cedula
 *         in: body
 *         description: cedula number of therapist
 *         required: false
 *         schema:
 *           type: string
 */
router.post('/register', (request, response) => {
    register(request as IGetPersonAuthInfoRequest, response)
})

router.put('/login', (request, response) => {
    login(request as IGetPersonAuthInfoRequest, response)
})

router.delete('/logout', (request, response) => {
    logout(request as IGetPersonAuthInfoRequest, response)
})
export default router
