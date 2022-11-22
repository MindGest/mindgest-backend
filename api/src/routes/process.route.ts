import { Router, Request, Response } from "express"
import { request } from "http"
import controller from "../controllers/process.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const process = Router()

/**
 * @openapi
 * /api/process/archive
 * post:
 *      tags:
 *      - process
 *      summary: Archives process
 *      description: Archives process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          processId:
 *                              type: integer
 *                              summary: process to archive      
 *      responses:
 *          '200':
 *              description: Process Archived
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.post(
  "/archive",
  middleware.requestValidator(schemas.ArchiveProcessSchema),
  controller.archive
)

/**
 * @openapi
 * /api/process/info
 * get:
 *      tags:
 *      - process
 *      summary: All the information of a process
 *      description: All the information of a process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          processId:
 *                              type: integer
 *                              summary: process to archive  
 *      responses:
 *          '200':
 *              description: Process Archived
 *              schema:
 *                  type: object
 *                  properties:
 *                      therapistId:
 *                          type: integer
 *                          example: 1
 *                      ref:
 *                          type: string
 *                          example: "process ref"
 *                      colaborators:
 *                          type: array
 *                          items:
 *                              type: string
 *                              example: "Marta Santos (Em Estágio)"
 *                      utent:
 *                          type: string
 *                          example: "Ricardo Maria"
 *                      active:
 *                          type: boolean
 *                          summary: True if process is active, false if archived or not yet approved
 *                      financialSituation:
 *                          type: boolean
 *                          summary: True if everything in order, false if patitent has late payments
 *                      speciality:
 *                          type: string
 *                          example: "Familiar"
 *          '403':
 *              description: Invalid Verification Token
 *          '401':
 *              description: User doesn't have authorization
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.get("/info", middleware.requestValidator(schemas.ProcessInfoSchema), controller.info)


/**
 * @openapi
 * /api/process/list
 * get:
 *      tags:
 *      - process
 *      summary: Lists every process
 *      description: Lists every process
*      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *      responses:
 *          '200':
 *              description: Process Archived
 *              schema:
 *                  type: object
 *                  properties:
 *                      therapistListing:
 *                          type: array
 *                          items:
 *                              type: string
 *                              example: Marta Santos
 *                      patientName:
 *                          type: string
 *                          example: Ricardo Maria
 *                      refCode:
 *                          type: string
 *                          example: 23fdfd4e3
 *                      nextAppointment:
 *                          type: string
 *                          summary: 'No next Appointment' if no appointment has been made or the date, in string format, of next date
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.get("/list", middleware.requestValidator(schemas.ProcessListSchema), controller.list)

/**
 * @openapi
 * /api/process/list/active
 * get:
 *      tags:
 *      - process
 *      summary: Lists every active process
 *      description: Lists every active process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *      responses:
 *          '200':
 *              description: Process Archived
 *              schema:
 *                  type: object
 *                  properties:
 *                      therapistListing:
 *                          type: array
 *                          items:
 *                              type: string
 *                              example: Marta Santos
 *                      patientName:
 *                          type: string
 *                          example: Ricardo Maria
 *                      refCode:
 *                          type: string
 *                          example: 23fdfd4e3
 *                      nextAppointment:
 *                          type: string
 *                          summary: 'No next Appointment' if no appointment has been made or the date, in string format, of next date
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.get(
  "/list/active",
  middleware.requestValidator(schemas.ProcessListSchema),
  controller.listActive
)

/**
 * @openapi
 * /api/process/activate
 * get:
 *      tags:
 *      - process
 *      summary: Activates a process
 *      description: Activates of a process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          processId:
 *                              type: integer
 *                              summary: process to archive  
 *      responses:
 *          '200':
 *              description: Process Archived
 *              schema:
 *                  type: object
 *                  properties:
 *                      therapistId:
 *                          type: integer
 *                          example: 1
 *                      ref:
 *                          type: string
 *                          example: "process ref"
 *                      colaborators:
 *                          type: array
 *                          items:
 *                              type: string
 *                              example: "Marta Santos (Em Estágio)"
 *                      utent:
 *                          type: string
 *                          example: "Ricardo Maria"
 *                      active:
 *                          type: boolean
 *                          summary: True if process is active, false if archived or not yet approved
 *                      financialSituation:
 *                          type: boolean
 *                          summary: True if everything in order, false if patitent has late payments
 *                      speciality:
 *                          type: string
 *                          example: "Familiar"
 *          '403':
 *              description: Invalid Verification Token
 *          '401':
 *              description: User doesn't have authorization
 *          '500': 
 *              description: Ups... Something went wrong
 */
 process.get("/activate", middleware.requestValidator(schemas.ArchiveProcessSchema), controller.activate)

/**
 * @openapi
 * /api/process/create
 * post:
 *      tags:
 *      - process
 *      summary: Creates new process
 *      description: Creates new process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          patientId:
 *                              type: integer
 *                              summary: id of patient
 *                          therapistId:
 *                              type: integer
 *                              summary: Id of therapist in charge of the proccess
 *                          speciality:
 *                              type: string
 *                              summary: Type of process, types need to be already created beforehand
 *                          remarks:
 *                              type: string
 *                              summary: any extra info the therapeut creating the process might wanna add
 *      responses:
 *          '200':
 *              description: Process Created
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.post("/create", middleware.requestValidator(schemas.ProcessCreateSchema), controller.create)

/**
 * @openapi
 * /api/process/edit
 * post:
 *      tags:
 *      - process
 *      summary: Edits process
 *      description: Edits process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          therapistId:
 *                              type: integer
 *                              summary: Id of therapist in charge of the proccess
 *                          speciality:
 *                              type: string
 *                              summary: Type of process, types need to be already created beforehand
 *                          remarks:
 *                              type: string
 *                              summary: any extra info the therapeut creating the process might wanna add
 *                          colaborators:
 *                              type: array
 *                              items:
 *                                type: integer
 *                              summary: ids of collaborates
 *                          processId:
 *                              type: string
 *                              summary: Id of process
 *      responses:
 *          '200':
 *              description: Process Created
 *          '401':
 *              description: User doesn't have authorization
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.post(
  "/edit",
  middleware.requestValidator(schemas.ProcessEditSchema),
  controller.edit
)

/**
 * @openapi
 * /api/process/appointments
 * post:
 *      tags:
 *      - process
 *      summary: Lists every process
 *      description: Lists every process
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          processId:
 *                              type: integer
 *                              summary: process to archive
 *      responses:
 *          '200':
 *              description: All appointments from process returned
 *              schema:
 *                  type: array
 *                  items:
 *                      type: object
 *                      properties:
 *                          online:
 *                              type: boolean
 *                              summary: True if appointment is online false if on site
 *                          start_date:
 *                              type: string
 *                              example: FALTA ADICIONAR EXEMPLO
 *                          end_date:
 *                              type: string
 *                              example: FALTA ADICIONAR EXEMPLO 
 *                          room:
 *                              type: string
 *                              example: Sala de aula C4.4
 *                          type:
 *  	                          type: string
 *                              example: familiar
 *          '401':
 *              description: User doesn't have authorization
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.get(
  "/appointments",
  middleware.requestValidator(schemas.ProcessInfoSchema),
  controller.appointments
)

/**
 * @openapi
 * /api/process/edit/permissions
 * post:
 *      tags:
 *      - process
 *      summary: Edits process permission for user
 *      description: Edits process permission for user
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          token:
 *                              type: string
 *                              summary: jwt from login
 *                          processId:
 *                              type: integer
 *                              summary: id of process
 *                          collaboratorId:
 *                              type: integer
 *                              summary: Id of the collaborator to change permissions
 *                          appoint:
 *                              type: boolean
 *                              summary: True if user has permissions to create appointments and False if not
 *                          statitics:
 *                              type: boolean
 *                              summary: True if user has permissions to see statitics and False if not
 *                          editProcess:
 *                              type: boolean
 *                              summary: True if user has permissions to edit process and False if not
 *                          editPatient:
 *                              type: boolean
 *                              summary: True if user has permissions to edit patient and False if not
 *                          archive:
 *                              type: boolean
 *                              summary: True if user has permissions to archive and False if not
 *                          see:
 *                              type: boolean
 *                              summary: True if user has permissions to see process info and False if not
 *      responses:
 *          '200':
 *              description: Permission updated
 *          '401':
 *              description: User doesn't have authorization
 *          '403':
 *              description: Invalid Verification Token
 *          '500': 
 *              description: Ups... Something went wrong
 */
process.post(
  "/edit/permissions",
  middleware.requestValidator(schemas.ProcessEditPermissionsSchema),
  controller.editPermissions
)


export default process
