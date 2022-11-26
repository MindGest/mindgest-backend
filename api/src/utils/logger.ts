import log, { pino } from "pino"
import dayjs from "dayjs"
import fs from "fs"

const NODE_ENV = String(process.env.NODE_ENV)

const streams = [{ stream: process.stderr }]

const logger = log(
  {
    transport: {
      target: "pino-pretty",
    },
    level: NODE_ENV === "development" ? "debug" : "info",
    base: {
      pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format("YYYY-MM-DD+HH:mm:ss")}"`,
  },
  pino.multistream(streams, { dedupe: true })
)

export default logger
