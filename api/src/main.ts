import express, { Request, Response } from "express"
import { Server } from "http"

import dotenv from "dotenv"
import helmet from "helmet"
import rateLimiter from "express-rate-limit"
import cors from "cors"

import { StatusCodes } from "http-status-codes"

dotenv.config()

import api from "./routes/api.route"
import logger from "./utils/logger"
import middleware from "./middleware/api.middleware"
import compression from "compression"

// Environment Variables
const HOST = String(process.env.HOST)
const PORT = Number(process.env.PORT)
const FRONTEND_URL = String(process.env.FRONTEND_URL)

// Utilities
function stop(server: Server) {
  return () => {
    logger.info("Received kill signal, shutting down gracefully")
    server.close(() => {
      process.exit(0)
    })
    setTimeout(() => {
      process.exit(1)
    }, 10000)
  }
}

function start(app: express.Application) {
  // Run Server
  const server = app.listen(PORT, HOST, () => {
    logger.info(`MindGest API is live on http://${HOST}:${PORT}`)
  })
  process.on("SIGTERM", stop(server))
  process.on("SIGINT", stop(server))
}

// Express Application
const app = express()

// Security
app.disable("x-powered-by")

// Middleware
app.use(helmet())
app.use(express.json())
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
)
app.use(compression({ filter: middleware.shouldCompress }))
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }))
app.use(middleware.bodyParserErrorValidator())

// Routes

/// MindGest API Route
app.use("/api", api)

// Endpoints

/// Redirect To API Documentation UI
app.get("/", (_: Request, res: Response) =>
  res.redirect(StatusCodes.MOVED_PERMANENTLY, "/api/docs/")
)

// Default route
app.use(middleware.notFound)

// Start Server
if (require.main === module) start(app)

export default app
