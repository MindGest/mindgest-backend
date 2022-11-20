import express, { Request, Response } from "express"

import dotenv from "dotenv"
import helmet from "helmet"
import rateLimiter from "express-rate-limit"
import fileUpload from "express-fileupload"

import { StatusCodes } from "http-status-codes"

dotenv.config()

import api from "./routes/api.route"
import logger from "./utils/logger"
import middleware from "./middleware/api.middleware"
import compression from "compression"

// Environment Variables
const HOST = String(process.env.HOST)
const PORT = Number(process.env.PORT)

const app = express()

// Security
app.disable("x-powered-by")

// Midleware
app.use(helmet())
app.use(express.json())
// app.use(compression({ filter: middleware.shouldCompress }))
app.use(express.urlencoded({ extended: false }))
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }))
app.use(middleware.bodyParserErrorValidator())
app.use(fileUpload({}))

// Routes

/// Mindgest API Route
app.use("/api", api)

// Endpoints

/// Redirect To API Documentation UI
app.get("/", (_: Request, res: Response) =>
  res.redirect(StatusCodes.MOVED_PERMANENTLY, "/api/docs/")
)

// Default route
app.use(middleware.notFound)

// Run Server
app.listen(PORT, () => {
  logger.info(`MindGest API is live on port ${PORT}`)
})
