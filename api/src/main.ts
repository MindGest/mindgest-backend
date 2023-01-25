import express, { Request, Response } from "express"
import { Server } from "http"

import dotenv from "dotenv"

import { StatusCodes } from "http-status-codes"

dotenv.config({ path: ".env", debug: true })

import api from "./routes/api.route"
import logger from "./utils/logger"
import middleware from "./middleware/api.middleware"

// Environment Variables
const HOST = process.env.HOST !== undefined ? String(process.env.HOST) : "localhost"
const PORT = Number(process.env.PORT) || 8080

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

// Routes

/// MindGest API Route
app.use("/api", api)

// Endpoints
app.get("/", (_: Request, res: Response) =>
  res.redirect(StatusCodes.MOVED_PERMANENTLY, "/api/docs/")
)

// Default route
app.use(middleware.notFound)

// Start Server
if (require.main === module) start(app)

export default app
