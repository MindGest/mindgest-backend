import { Router } from "express"

import ReceiptRouter from "./receipt.route"

import controller from "../controllers/patient.controller"

const patient = Router()

// Middleware
patient.use("/:user/receipt", ReceiptRouter)

patient.post("/create", controller.createPatient)
patient.put("/edit", controller.editPatient)
patient.get("/list", controller.getPatients)

export default patient
