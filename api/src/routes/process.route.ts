import { Router } from "express"

import controller from "../controllers/process.controller"

import middleware from "../middleware/api.middleware"
import authMiddleware from "../middleware/auth.middleware"

import schemas from "../utils/schemas"

const process = Router()

// Middleware
process.use(authMiddleware.authorize())

// Endpoints

/// General
process.post("/create", middleware.requestValidator(schemas.ProcessCreateSchema), controller.create)

process.get("/list", controller.list)
process.get("/processes", controller.getProcesses)

process.get("/therapists", controller.listTherapist)
process.post(
  "/collaborators",
  middleware.requestValidator(schemas.GetCollaboratorsSchema),
  controller.getCollaborators
)

// Process Specific
process.get("/:processId/info", controller.info)

process.post("/:processId/archive", controller.archive)
process.post("/:processId/activate", controller.activate)

process.post(
  "/:processId/edit",
  middleware.requestValidator(schemas.ProcessEditSchema),
  controller.edit
)

process.post(
  "/:processId/migrate",
  middleware.requestValidator(schemas.ProcessMigrationSchema),
  controller.migrate
)

process.get("/:processId/appointments", controller.appointments)
process
  .route("/:processId/notes")
  .get(controller.listNotes)
  .post(middleware.requestValidator(schemas.NotesCreate), controller.createNote)

process
  .route("/:processId/permissions")
  .get(controller.getPermissions)
  .post(
    middleware.requestValidator(schemas.ProcessEditPermissionsSchema),
    controller.editPermissions
  )

export default process
