import { Router } from "express"

import controller from "../controllers/receipt.controller"

import authMiddleware from "../middleware/auth.middleware"

//user/accountant/payments: lista de todos os pagamentos, com utente, responsáveis, código da consulta, dia da consulta, e status pago/por pagar

const receipt = Router()

// Middleware
receipt.use(authMiddleware.authorize())

// Endpoints

receipt.get("/list")
receipt.get("/:receiptId/info", controller.info)
receipt.put("/:receiptId/pay", controller.pay)

export default receipt
