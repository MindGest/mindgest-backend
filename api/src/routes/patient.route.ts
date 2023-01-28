import { Router, Request, Response } from "express"
import controller from "../controllers/patient.controller"
import authMiddleware from "../middleware/auth.middleware"

const patient = Router()
patient.use(authMiddleware.authorize())

patient.get("/list-patients", (req: Request, res: Response) => {
  controller.listPatients(req, res)
})

patient.get("/list", (req: Request, res: Response)=> {
  controller.listNamePatients(req,res)
})

patient.post("/get-patient-info", (req: Request, res: Response) => {
  controller.getPatientInfo(req, res)
})

patient.post("/get-patient-type", (req: Request, res: Response) => {
  controller.getPatientType(req, res)
})

patient.post("/create-child-patient", (req: Request, res: Response) => {
  controller.createChildPatient(req, res)
})

patient.post("/create-teen-patient", (req: Request, res: Response) => {
  controller.createTeenPatient(req, res)
})

patient.post("/create-adult-patient", (req: Request, res: Response) => {
  controller.createAdultOrElderOrCoupleOrFamilyPatient(req, res)
})

patient.post("/create-elder-patient", (req: Request, res: Response) => {
  controller.createAdultOrElderOrCoupleOrFamilyPatient(req, res)
})
patient.post("/create-couple-patient", (req: Request, res: Response) => {
  controller.createAdultOrElderOrCoupleOrFamilyPatient(req, res)
})

patient.post("/create-family-patient", (req: Request, res: Response) => {
  controller.createAdultOrElderOrCoupleOrFamilyPatient(req, res)
})

patient.put("/edit-child-patient", (req: Request, res: Response) => {
  controller.editChildPatient(req, res)
})

patient.put("/edit-teen-patient", (req: Request, res: Response) => {
  controller.editTeenPatient(req, res)
})

patient.put("/edit-adult-patient", (req: Request, res: Response) => {
  controller.editAdultOrElderPatient(req, res)
})

patient.put("/edit-elder-patient", (req: Request, res: Response) => {
  controller.editAdultOrElderPatient(req, res)
})

patient.put("/edit-couple-patient", (req: Request, res: Response) => {
  controller.editCoupleOrFamilyPatient(req, res)
})

patient.put("/edit-family-patient", (req: Request, res: Response) => {
  controller.editCoupleOrFamilyPatient(req, res)
})

patient.put("/archive-patient", (req: Request, res: Response) => {
  controller.archivePatient(req, res)
})

export default patient
