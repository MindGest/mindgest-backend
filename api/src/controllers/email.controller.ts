import { Request, Response } from "express"
import { AccountVerificationSchema, EmailSchema, ForgotPasswordBody } from "../utils/types"
import { StatusCodes } from "http-status-codes"

import { createToken } from "../services/auth.service"
import { sendResetPasswordEmail, sendVerificationEmail, sendEmail } from "../utils/mailer"

import logger from "../utils/logger"
import prisma from "../utils/prisma"

export async function accountVerificationEmail(
  req: Request<{}, {}, AccountVerificationSchema>,
  res: Response
) {
  try {
    // Check if the user exists
    const person = await prisma.person.findFirst({
      where: { email: req.body.email },
    })
    if (person === null) {
      logger.info(
        `VERIFY-ACCOUNT [${req.body.email}] => Forgot password failed. User does not exist!`
      )
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `The user with email "${req.body.email}" does not exist.`,
      })
    }

    logger.info(`VERIFY-ACCOUNT  [${req.body.email}] => Verify account token request`)

    logger.debug(`VERIFY-ACCOUNT  [${req.body.email}] => Generation account verification token...`)
    // Create a simple token for user verification
    let token = createToken({ person: Number(person.id) })

    // Send email if callback is provided
    if (req.body.callback) {
      logger.debug(`VERIFY-ACCOUNT [${req.body.email}] => Sending account verification email...`)
      await sendVerificationEmail(person.name, person.email, token, req.body.callback)
    }

    logger.debug(`VERIFY-ACCOUNT [${req.body.email}] => Verify account token generated...`)
    res.status(StatusCodes.OK).json({
      message: "Account verification token generated",
      token: req.body.callback ? "The verification token was sent by email!" : token,
    })
  } catch (error) {
    logger.error(`VERIFY-ACCOUNT => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function forgotPasswordEmail(req: Request<{}, {}, ForgotPasswordBody>, res: Response) {
  try {
    const person = await prisma.person.findFirst({
      where: { email: req.body.email },
    })

    // Check if the user exists
    if (person === null) {
      logger.info(`FORGOT-PASS [${req.body.email}] => Forgot password failed. User does not exist!`)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `The user with email "${req.body.email}" does not exist.`,
      })
    }

    // Check if person account is verified
    logger.info(`FORGOT-PASS [${req.body.email}] => Forgot reset token request`)
    if (!person.verified) {
      logger.info(`FORGOT-PASS [${req.body.email}] => Forgot password failed. User not verified!`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not verified!",
      })
    }

    // Check if the user account is approved by an administrator
    if (!person.approved) {
      logger.info(`FORGOT-PASS [${req.body.email}] => Forgot password failed. User not approved!`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not approved. Contact an admin to solve this issue!",
      })
    }

    logger.debug(`FORGOT-PASS [${req.body.email}] => Generating password reset token...`)
    // Create a simple token for password reset
    let token = createToken({ person: Number(person.id) })

    // Send email if callback is provided
    if (req.body.callback) {
      logger.debug(`FORGOT-PASS [${req.body.email}] => Sending password reset email...`)
      await sendResetPasswordEmail(person.name, person.email, token, req.body.callback)
    }

    logger.info(`FORGOT-PASS [${req.body.email}] => Password reset token generated...`)
    res.status(StatusCodes.OK).json({
      message: "Password reset token generated",
      token: req.body.callback ? "The password reset token was sent by email" : token,
    })
  } catch (error) {
    logger.error(`FORGOT-PASS => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function sendGenericEmail(req: Request<{}, {}, EmailSchema>, res: Response) {
  // Authorizing User
  const { id, role, isAdmin } = res.locals.token
  logger.debug(`EMAIL [user-id ${id}] => User authorized to send email.`)
  try {
    // Send Email
    await sendEmail({
      to: req.body.email,
      subject: req.body.subject,
      html: req.body.body,
    })

    logger.info(`EMAIL [user-id ${id}] => Email message sent successfully to ${req.body.email}...`)
    res.status(StatusCodes.OK).json({
      message: "Email sent",
    })
  } catch (error) {
    logger.error(`EMAIL [user-id ${id}] => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default { accountVerificationEmail, forgotPasswordEmail, sendGenericEmail }
