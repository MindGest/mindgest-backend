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

// Utilities 
let connections: any = []

function stop(server: Server) {
  return () => {
    logger.info("Received kill signal, shutting down gracefully")
    server.close(() => {
      logger.info("Closed out remaining connections")
      process.exit(0)
    })

    setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down")
      process.exit(1)
    }, 10000)

    connections.forEach((curr: any) => curr.end())
    setTimeout(() => connections.forEach((curr: any) => curr.destroy()), 5000)
  }
}

function start(app: express.Application) {
  // Run Server
  const server = app.listen(PORT, HOST, () => {
    logger.info(`MindGest API is live on http://${HOST}:${PORT}`)
  })

  process.on("SIGTERM", stop(server))
  process.on("SIGINT", stop(server))

  server.on("connection", (connection) => {
    connections.push(connection)
    connection.on(
      "close",
      () => (connections = connections.filter((curr: any) => curr !== connection))
    )
  })
}

// Express Application
const app = express()

// Security
app.disable("x-powered-by")

// Midleware
app.use(helmet())
app.use(express.json())
app.use(cors())
app.use(compression({ filter: middleware.shouldCompress }))
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }))
app.use(middleware.bodyParserErrorValidator())

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

// Start Server
start(app)
