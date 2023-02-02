import { Router } from "express"
import controller from "../controllers/patient.controller"
import authMiddleware from "../middleware/auth.middleware"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

// Router
const patient = Router()

// Middleware
patient.use(authMiddleware.authorize())

// Endpoints

/// General Endpoints
patient.get("/list", controller.listPatients)

patient.get("/types", controller.getPatientTypes)


patient.get("/:patientId/receipts", controller.receiptList)

/// Patient Specific Endpoints
patient.post("/:patientId/info", controller.getPatientInfo)

patient
  .route("/:patientId/picture")
  .get(controller.downloadProfilePicture)
  .put(controller.uploadProfilePicture)

patient.put("/:patientId/archive", controller.archivePatient)

patient.post("/:patientId/type", controller.getPatientType)

// Create/Edit Patients

/// Children
patient.post(
  "/child/create",
  middleware.requestValidator(schemas.CreateChildPatientSchema),
  controller.createChildPatient
)

patient.put(
  "/child/edit",
  middleware.requestValidator(schemas.EditChildPatientSchema),
  controller.editChildPatient
)

/// Teens
patient.post(
  "/teen/create",
  middleware.requestValidator(schemas.CreateTeenPatientSchema),
  controller.createTeenPatient
)

patient.put(
  "/teen/edit",
  middleware.requestValidator(schemas.EditTeenPatientSchema),
  controller.editTeenPatient
)

/// Adults
patient.post(
  "/adult/create",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderPatient
)

patient.put(
  "/adult/edit",
  middleware.requestValidator(schemas.EditAdultPatientSchema),
  controller.editAdultOrElderPatient
)

/// Elderly
patient.post(
  "/elder/create",
  middleware.requestValidator(schemas.CreateAdultPatientSchema),
  controller.createAdultOrElderPatient
)

patient.put(
  "/elder/edit",
  middleware.requestValidator(schemas.EditAdultPatientSchema),
  controller.editAdultOrElderPatient
)

export default patient
