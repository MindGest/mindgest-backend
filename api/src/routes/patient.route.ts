import { Router, Request, Response } from "express"
import controller from "../controllers/patient.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const patient = Router()

patient.use(authMiddleware.authorize())

patient.get("/list", controller.listPatients)

patient.post(
  "/info",
  middleware.requestValidator(schemas.GetPatientInfoSchema),
  controller.getPatientInfo
)

patient.post(
  "/type",
  middleware.requestValidator(schemas.GetPatientTypeSchema),
  controller.getPatientType
)
patient.get("/types", controller.getPatientTypes)

patient.post(
  "/child/create",
  middleware.requestValidator(schemas.CreateChildPatientSchema),
  controller.createChildPatient
)

patient.post(
  "/teen/create",
  middleware.requestValidator(schemas.CreateTeenPatientSchema),
  controller.createTeenPatient
)

patient.post(
  "/adult/create",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderPatient
)

patient.post(
  "/elder/create",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderPatient
)

patient.put(
  "/child/edit",
  middleware.requestValidator(schemas.EditChildPatientSchema),
  controller.editChildPatient
)

patient.put(
  "/teen/edit",
  middleware.requestValidator(schemas.EditTeenPatientSchema),
  controller.editTeenPatient
)

patient.put(
  "/adult/edit",
  middleware.requestValidator(schemas.EditAdultPatientSchema),
  controller.editAdultOrElderPatient
)

patient.put(
  "/elder/elder",
  middleware.requestValidator(schemas.EditAdultPatientSchema),
  controller.editAdultOrElderPatient
)

patient.put(
  "/archive",
  middleware.requestValidator(schemas.ArchivePatientSchema),
  controller.archivePatient
)

export default patient
