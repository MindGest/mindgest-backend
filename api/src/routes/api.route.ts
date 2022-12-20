import express, { Router } from "express"

import helmet from "helmet"
import rateLimiter from "express-rate-limit"
import cors from "cors"
import compression from "compression"

import AuthRouter from "./auth.route"
import UserRouter from "./user.route"
import DocsRouter from "./docs.route"
import ProcessRouter from "./process.route"
import AppointmentRouter from "./appointment.route"
import ReceiptRouter from "./receipt.route"

import controller from "../controllers/api.controller"
import middleware from "../middleware/api.middleware"

// Util
;(BigInt.prototype as any).toJSON = function () {
  return Number(this.toString())
}

const FRONTEND_URL = String(process.env.FRONTEND_URL)

// MindGest API Router
const api = Router()

// Middleware
api.use(helmet())
api.use(express.json())
api.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
)
api.use(compression({ filter: middleware.shouldCompress }))
api.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }))
api.use(middleware.bodyParserErrorValidator())

// Routes
api.use("/auth", AuthRouter)
api.use("/user", UserRouter)
api.use("/docs", DocsRouter)
api.use("/process", ProcessRouter)
api.use("/appointment", AppointmentRouter)
api.use("/receipts", ReceiptRouter)

// Healthcheck
api.get("/healthcheck", controller.healthCheck)

export default api
