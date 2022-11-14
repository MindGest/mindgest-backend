import mailer, { SentMessageInfo } from 'nodemailer'
import logger from './logger'

const SMTP_EMAIL = String(process.env.SMTP_EMAIL)
const SMTP_PASS = String(process.env.SMTP_PASS)
const SMTP_HOST = String(process.env.SMTP_HOST)
const SMTP_PORT = Number(process.env.STMP_PORT)

const transporter = mailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASS,
    },
    secure: true,
    pool: true,
    logger: false,
} as mailer.TransportOptions)

export default async function sendEmail(payload: mailer.SendMailOptions) {
    transporter.sendMail(payload, (error, info: any) => {
        if (error) {
            return logger.error(error)
        }
        logger.info(`Email Sent: ${info.response}`)
    })
}
