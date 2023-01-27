import mailer from "nodemailer"
import logger from "./logger"
import Email from "email-templates"
import path from "path"

const SMTP_EMAIL = String(process.env.SMTP_EMAIL)
const SMTP_PASS = String(process.env.SMTP_PASS)
const SMTP_HOST = String(process.env.SMTP_HOST)
const SMTP_PORT = Number(process.env.SMTP_PORT)

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
    logger.debug(`Email Sent: ${info.response}`)
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
    subject: "Confirmar Conta",
    html: `
    <h4> Bem vindo, ${name}</h4>
    <p>Por favor, confirme o seu e-mail clicando no seguinte link:
    <br><br>
    <a href="${callback}?token=${token}">Verificar Email</a> </p>
    <p>Cumprimentos, </p>
    <br> 
    <p>MindGest</p>`,
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
    subject: "Recuperar Password",
    html: `
    <h4> Olá, ${name}</h4>
    <p>Para recuperar a sua password clique no seguinte link: 
    <br><br>
    <a href="${callback}?token=${token}">Recuperar Password</a>
    <p>Cumprimentos, </p>
    <p>MindGest</p>`,
  })
}

export default { sendEmail, sendVerificationEmail, sendResetPasswordEmail }
