import { Router, Request, Response } from "express"
import controller from "../controllers/process.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import PatientRouter from "./patient.route"

import authMiddleware from "../middleware/auth.middleware"

const process = Router()

process.use(authMiddleware.authorize())

process.use("/:process", PatientRouter)

process.post("/archive/:processId", controller.archive)

process.get("/info/:processId", controller.info)

process.get("/list", controller.list)

/*process.get(
  "/list/active",
  controller.listActive
)*/ //MUDAR ISTO E POR PARA SER DEFINIDO COMO FILTRO

process.post("/activate/:processId", controller.activate)

process.post("/create", middleware.requestValidator(schemas.ProcessCreateSchema), controller.create)

process.post("/edit", middleware.requestValidator(schemas.ProcessEditSchema), controller.edit)

process.get("/appointments", controller.appointments)

process.post(
  "/edit/permissions",
  middleware.requestValidator(schemas.ProcessEditPermissionsSchema),
  controller.editPermissions
)

export default process
