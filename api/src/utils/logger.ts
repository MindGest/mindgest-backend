import log from "pino"
import dayjs from "dayjs"

const LOG = String(process.env.LOG)

const logger = log({
  transport: {
    target: "pino-pretty",
  },
  level: LOG,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format("YYYY-MM-DD+HH:mm:ss")}"`,
})

export default logger
