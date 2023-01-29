import { Router, Request, Response } from "express"
import controller from "../controllers/process.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"
import authMiddleware from "../middleware/auth.middleware"

const process = Router()

process.use(authMiddleware.authorize())

process.use(
  "/:processId/createNote",
  middleware.requestValidator(schemas.NotesCreate),
  controller.createNote
)
process.use("/:processId/listNotes", controller.listNotes)

process.post("/archive/:processId", controller.archive)

process.get("/info/:processId", controller.info)

process.get("/list", controller.list)

process.get("/listTherapist", controller.listTherapist)

process.post("/activate/:processId", controller.activate)

process.post("/create", middleware.requestValidator(schemas.ProcessCreateSchema), controller.create)

process.post(
  "/edit/:processId",
  middleware.requestValidator(schemas.ProcessEditSchema),
  controller.edit
)

process.get("/appointments/:processId", controller.appointments)

process.post(
  "/permissions/:processId",
  middleware.requestValidator(schemas.ProcessEditPermissionsSchema),
  controller.editPermissions
)

process.get("/permissions/:processId", controller.getPermissions)

process.post(
  "/collaborators",
  middleware.requestValidator(schemas.GetCollaboratorsSchema),
  controller.getCollaborators
)

export default process
