import { Router } from "express"

import controller from "../controllers/patient.controller"

const patient = Router()

patient.post("/create", controller.createPatient)
patient.put("/edit", controller.editPatient)
patient.get("/list", controller.getPatients)

export default patient
