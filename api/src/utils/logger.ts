import log from "pino"
import dayjs from "dayjs"

const NODE_ENV = String(process.env.NODE_ENV)

const logger = log({
  transport: {
    target: "pino-pretty",
  },
  level: NODE_ENV === "development" ? "debug" : "info",
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format("YYYY-MM-DD+HH:mm:ss")}"`,
})

export default logger
