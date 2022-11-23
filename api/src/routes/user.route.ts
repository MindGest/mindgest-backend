import { Router, Request, Response } from "express"
import { request } from "http"
import controller from "../controllers/user.controller"

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

user.get("/list", (req: Request, res: Response) => {
  controller.getAllUsers(req, res)
})

user.post("/avatar", (req: Request, res: Response) => {
  controller.uploadAvatar(req, res)
})

/**
 * @openapi
 * /api/user/edit:
 *  put:
 *      tags:
 *      - user
 *      summary: Endpoint that updates the information of the given user if the caller has permission to do so.
 *      description: ''
 *      responses:
 *          200:
 *              description: Successfully updated the user's info.
 *          404:
 *              description: The given user either does not exist, or is not from the type given.
 *          403:
 *              description: The caller does not have permission to update the given user's information.
 *      parameters:
 *          - name: id
 *            in: body
 *            description: The id of the user to be updated.
 *            required: true
 *            schema:
 *              type: integer
 *              format: int64
 *          - name: active
 *            in: body
 *            description: Means that the user is active or not.
 *            required: false
 *            schema:
 *              type: boolean
 *          - name: address
 *            in: body
 *            description: The address of the user.
 *            required: false
 *            schema:
 *              type: string
 *          - name: name
 *            in: body
 *            description: If therapist is extern or intern
 *            required: false
 *            schema:
 *              type: boolean
 *          - name: email
 *            in: body
 *            description: The email of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: aproved
 *            in: body
 *            description: Means that a user was or not approved.
 *            required: false
 *            schema:
 *              type: boolean
 *          - name: birth_date
 *            in: body
 *            description: The birth date of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *              format: date-time
 *          - name: password
 *            in: body
 *            description: The password of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: phone_number
 *            in: body
 *            description: The phone number of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: tax_number
 *            in: body
 *            description: The tax number of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: health_number
 *            in: body
 *            description: The health number of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: request
 *            in: body
 *            description: The request of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: remarks
 *            in: body
 *            description: The remarks of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: patienttype
 *            in: body
 *            description: The patienttype id of the user to be updated.
 *            required: false
 *            schema:
 *              type: integer
 *              format: int64
 *          - name: school_name
 *            in: body
 *            description: The name of the school of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: school_grade
 *            in: body
 *            description: The grade of the user to be updated.
 *            required: false
 *            schema:
 *              type: integer
 *              format: int64
 *          - name: profession_name
 *            in: body
 *            description: The name of the profession of the user to be updated.
 *            required: false
 *            schema:
 *              type: string
 *          - name: extern
 *            in: body
 *            description: Means that a therapist is extern ot not.
 *            required: false
 *            schema:
 *              type: boolean
 *          - name: admin
 *            in: body
 *            description: Means that a therapist is an admin or not.
 *            required: false
 *            schema:
 *              type: boolean
 *          - name: cedula
 *            in: body
 *            description: The cedula number of the therapist.
 *            required: false
 *            schema:
 *              type: string
 */

user.put("/edit", (req: Request, res: Response) => {
  controller.editUser(req, res)
})

export default user
