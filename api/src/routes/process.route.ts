import { Router, Request, Response } from "express"
import controller from "../controllers/process.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"
import authMiddleware from "../middleware/auth.middleware"

const process = Router()

process.use(authMiddleware.authorize())

process.post(
  "/:processId/notes",
  middleware.requestValidator(schemas.NotesCreate),
  controller.createNote
)
process.get("/:processId/notes", controller.listNotes)

process.post(
  "/:processId/migrate",
  middleware.requestValidator(schemas.ProcessMigrationSchema),
  controller.migrate
)

process.post("/:processId/archive", controller.archive)

process.get("/:processId/info", controller.info)

process.get("/list", controller.list)

process.get("/therapists", controller.listTherapist)

process.post("/:processId/activate", controller.activate)

process.post("/create", middleware.requestValidator(schemas.ProcessCreateSchema), controller.create)

process.post(
  "/:processId/edit",
  middleware.requestValidator(schemas.ProcessEditSchema),
  controller.edit
)

process.get("/:processId/appointments", controller.appointments)

process.post(
  "/:processId/permissions",
  middleware.requestValidator(schemas.ProcessEditPermissionsSchema),
  controller.editPermissions
)

process.get("/:processId/permissions", controller.getPermissions)

process.post(
  "/collaborators",
  middleware.requestValidator(schemas.GetCollaboratorsSchema),
  controller.getCollaborators
)

process.get("/processes", controller.getProcesses)

export default process
