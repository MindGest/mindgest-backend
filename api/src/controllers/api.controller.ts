import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import logger from "../utils/logger"
import prisma from "../utils/prisma"

enum Health {
  OK = "Healthy",
  RIP = "Unhealthy",
}

export async function healthCheck(req: Request, res: Response) {
  try {
    // Check Database Connection Status
    let dbStatus = Health.OK
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (error: any) {
      logger.warn(error.message)
      dbStatus = Health.RIP
    }

    // Construct health object
    const health = {
      uptime: process.uptime().toLocaleString(),
      status: {
        api: "Healthy",
        database: dbStatus,
      },
      date: new Date(),
    }

    logger.info(`HEALTHCHECK => Complete.`)
    logger.debug(`HEALTHCHECK -> Server: ${health.status.api}`)
    logger.debug(`HEALTHCHECK -> Database: ${health.status.database}`)

    res
      .status(dbStatus === Health.OK ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR)
      .send(health)
  } catch (error) {
    logger.error(`HEALTHCHECK => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default { healthCheck }
