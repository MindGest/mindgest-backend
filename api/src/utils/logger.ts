import logger from 'pino'
import pretty from 'pino-pretty'

const log = logger(
    pretty({
        colorize: true,
    })
)

export default log
