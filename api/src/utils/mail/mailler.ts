import mailer from "nodemailer"
import logger from "../logger"
import Email from "email-templates"
import path from "path"

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

export async function sendEmail(payload: mailer.SendMailOptions) {
  transporter.sendMail(payload, (error, info: any) => {
    if (error) {
      return logger.error(error)
    }
    logger.info(`Email Sent: ${info.response}`)
  })
}

export async function sendVerificationEmail(
  name: string,
  email: string,
  token: string,
  callback: string
) {
  return sendEmail({
    to: email,
    subject: "Mindgest Account Confirmation",
    html: `
    <h4> Hello, ${name}</h4>
    <p>Please confirm your email by clicking on the following link : 
    <a href="${callback}?token=${token}">Verify Email</a> </p>`,
  })
}
export async function sendResetPasswordEmail(
  name: string,
  email: string,
  token: string,
  callback: string
) {
  return sendEmail({
    to: email,
    subject: "Mindgest Account Password Reset",
    html: `
    <h4> Hello, ${name}</h4>
    <p>Reset your password by clicking on the following link : 
    <a href="${callback}?token=${token}">Reset Password</a> </p>`,
  })
}

export default { sendEmail, sendVerificationEmail, sendResetPasswordEmail }
