import { Router, Request, Response } from "express"
import controller from "../controllers/patient.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

const patient = Router()

patient.use(authMiddleware.authorize())

patient.get("/list-patients", controller.listPatients)

patient.get("/list", (req: Request, res: Response) => {
  controller.listNamePatients(req, res)
})

patient.post(
  "/get-patient-info",
  middleware.requestValidator(schemas.GetPatientInfoSchema),
  controller.getPatientInfo
)

patient.post(
  "/get-patient-type",
  middleware.requestValidator(schemas.GetPatientTypeSchema),
  controller.getPatientType
)

patient.post(
  "/create-child-patient",
  middleware.requestValidator(schemas.CreateChildPatientSchema),
  controller.createChildPatient
)

patient.post(
  "/create-teen-patient",
  middleware.requestValidator(schemas.CreateTeenPatientSchema),
  controller.createTeenPatient
)

patient.post(
  "/create-adult-patient",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderOrCoupleOrFamilyPatient
)

patient.post(
  "/create-elder-patient",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderOrCoupleOrFamilyPatient
)

patient.post(
  "/create-couple-patient",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderOrCoupleOrFamilyPatient
)

patient.post(
  "/create-family-patient",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderOrCoupleOrFamilyPatient
)

patient.put(
  "/edit-child-patient",
  middleware.requestValidator(schemas.EditChildPatientSchema),
  controller.editChildPatient
)

patient.put(
  "/edit-teen-patient",
  middleware.requestValidator(schemas.EditTeenPatientSchema),
  controller.editTeenPatient
)

patient.put(
  "/edit-adult-patient",
  middleware.requestValidator(schemas.EditAdultPatientSchema),
  controller.editAdultOrElderPatient
)

patient.put(
  "/edit-elder-patient",
  middleware.requestValidator(schemas.EditAdultPatientSchema),
  controller.editAdultOrElderPatient
)

patient.put(
  "/edit-couple-patient",
  middleware.requestValidator(schemas.EditCoupleOrFamilyPatientSchema),
  controller.editCoupleOrFamilyPatient
)

patient.put(
  "/edit-family-patient",
  middleware.requestValidator(schemas.EditCoupleOrFamilyPatientSchema),
  controller.editCoupleOrFamilyPatient
)


patient.put(
  "/archive",
  middleware.requestValidator(schemas.ArchivePatientSchema),
  controller.archivePatient
)

patient.get("/types", controller.getPatientTypes)

export default patient
