import { Prisma, PrismaClient } from "@prisma/client"
import logger from "./logger"

declare global {
  namespace NodeJS {
    interface Global {}
  }
}

interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient
}

class MindgestPrismaClient extends PrismaClient<
  Prisma.PrismaClientOptions,
  "query" | "info" | "warn" | "error"
> {
  constructor() {
    super({
      log: [
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" },
      ],
      errorFormat: "pretty",
    })

    this.$on("warn", (e) => {
      logger.warn(e)
    })

    this.$on("info", (e) => {
      logger.info(e)
    })

    this.$on("error", (e) => {
      logger.error(e)
    })
  }
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal

const prisma: MindgestPrismaClient = global.prisma || new MindgestPrismaClient()

global.prisma = prisma

export default prisma
