import { Router, Request, Response } from "express"
import controller from "../controllers/receipt.controller"
import middleware from "../middleware/api.middleware"
import schemas from "../utils/schemas"

import authMiddleware from "../middleware/auth.middleware"

//user/accountant/payments: lista de todos os pagamentos, com utente, responsáveis, código da consulta, dia da consulta, e status pago/por pagar

const receipt = Router()

// Middleware
receipt.use(authMiddleware.authorize())

// Endpoints
receipt.post("/:appointmentId/create", controller.create)

receipt.get("/list/:patientId", controller.list)

receipt.get("/:receiptRef/info", controller.info)
receipt.put("/:receiptRef/pay", controller.pay)

export default receipt
