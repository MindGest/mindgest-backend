import { Router, Request, Response } from "express"
import controller from "../controllers/process.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import PatientRouter from "./patient.route"

const process = Router()

process.use("/:process", PatientRouter)

process.post(
  "/archive",
  middleware.requestValidator(schemas.ArchiveProcessSchema),
  controller.archive
)

process.get("/info", middleware.requestValidator(schemas.ProcessInfoSchema), controller.info)

process.get("/list", middleware.requestValidator(schemas.ProcessListSchema), controller.list)

process.get(
  "/list/active",
  middleware.requestValidator(schemas.ProcessListSchema),
  controller.listActive
)

process.post(
  "/activate",
  middleware.requestValidator(schemas.ArchiveProcessSchema),
  controller.activate
)

process.post("/create", middleware.requestValidator(schemas.ProcessCreateSchema), controller.create)

process.post("/edit", middleware.requestValidator(schemas.ProcessEditSchema), controller.edit)

process.get(
  "/appointments",
  middleware.requestValidator(schemas.ProcessInfoSchema),
  controller.appointments
)

process.post(
  "/edit/permissions",
  middleware.requestValidator(schemas.ProcessEditPermissionsSchema),
  controller.editPermissions
)

export default process
