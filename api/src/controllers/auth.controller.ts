import argon2 from "argon2"
import assert from "assert"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"

import logger from "../utils/logger"
import prisma from "../utils/prisma"

import { fetchPersonProperties } from "../services/user.service"

import {
  attachCookies,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  verifyToken,
} from "../services/auth.service"

import {
  RegistrationBody,
  LoginBody,
  RefreshToken,
  RefreshBody,
  VerifyAccountBody,
  VerificationToken,
  ResetPasswordBody,
  PasswordResetToken,
} from "../utils/types"

import { User } from "../utils/schemas"
import { randomUUID } from "crypto"
import processController from "./process.controller"

export async function register(req: Request<{}, {}, RegistrationBody>, res: Response) {
  try {
    logger.info(`REGISTER [${req.body.email}] => Registration Request`)

    // Find user by email
    let user = await prisma.person.findFirst({
      where: { email: req.body.email },
    })

    // Check if user exists
    if (user !== null) {
      logger.info(`REGISTER [${req.body.email}] => Account already exists`)
      return res.status(StatusCodes.CONFLICT).json({
        message: `A user with email ${req.body.email} already exists.`,
      })
    }

    // Create new user (Person)
    logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (person)...`)
    let person = await prisma.person.create({
      data: {
        active: true,
        verified: false,
        approved: false,
        name: req.body.name,
        email: req.body.email,
        password: await argon2.hash(req.body.password),
        address: req.body.address,
        birth_date: new Date(req.body.birthDate),
        phone_number: req.body.phoneNumber,
        tax_number: req.body.role !== "intern" ? req.body.taxNumber : null,
      },
    })

    // Build Response Payload
    let b = {
      name: person.name,
      email: person.email,
      address: person.address,
      birthDate: person.birth_date.toISOString().slice(0, 10),
      phoneNumber: person.phone_number,
      role: req.body.role
    }

    // Jarvardisus Maximus
    let body = null
    if (req.body.role !== "intern") {
      body = { ...b, taxNumber: person.tax_number }
    } else {
      body = b
    }

    // Create entry in the table, associated with the user's role
    let payload = {}
    switch (req.body.role) {
      case User.ACCOUNTANT:
        logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (accountant)...`)
        await prisma.accountant.create({
          data: { person: { connect: { id: person.id } } },
        })
        break
      case User.GUARD: {
        logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (guard)...`)
        await prisma.guard.create({
          data: { person: { connect: { id: person.id } } },
        })
        break
      }
      case User.INTERN: {
        logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (intern)...`)
        await prisma.intern.create({
          data: { person: { connect: { id: person.id } } },
        })
        break
      }
      case User.ADMIN:
        logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (admin)...`)
        await prisma.admin.create({
          data: {
            person: { connect: { id: person.id } },
          },
        })
        payload = { admin: true }
        break
      case User.THERAPIST: {
        // Insert therapist in the therapist table
        logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (therapist)...`)
        const speciality = await prisma.speciality.findUnique({
          where: {
            speciality: req.body.speciality,
          },
        })

        if (speciality === null || speciality === undefined) {
          logger.info(`REGISTER [${req.body.speciality}] => This speciality does not exist`)
          return res.status(StatusCodes.NOT_FOUND).json({
            message: `Specialty ${req.body.speciality} does not exist`,
          })
        }

        // Create Therapist
        const therapist = await prisma.therapist.create({
          data: {
            license: req.body.license,
            health_system: req.body.healthSystem,
            extern: req.body.extern,
            person: { connect: { id: person.id } },
          },
        })

        // Attach Speciality
        await prisma.therapist_speciality.create({
          data: {
            therapist: { connect: { person_id: person.id } },
            speciality: { connect: { speciality: speciality.speciality } },
          },
        })

        let tmp = {
          license: therapist.license,
          healthSystem: therapist.health_system,
          extern: therapist.extern,
          speciality: speciality.speciality,
        }

        // Add therapist as an admin too
        logger.debug(`REGISTER [${req.body.email}] => Creating a table entry (admin)...`)
        if ((await prisma.admin.count()) < 4) {
          await prisma.admin.create({
            data: {
              person: { connect: { id: person.id } },
            },
          })
          payload = { ...tmp, admin: true }
        } else {
          payload = { ...tmp }
        }
        break
      }
    }

    // Send Notification To Admins
    let uuid = randomUUID()
    for (let admin of await prisma.admin.findMany()) {
      logger.debug(
        `REGISTER [${req.body.email}] => Generating notification for admin user ${admin.person_id}`
      )
      await prisma.notifications.create({
        data: {
          person: { connect: { id: admin.person_id } },
          data: JSON.stringify({ ...body, ...payload }),
          type: "register",
          settled: false,
          seen: false,
          ref: uuid,
        },
      })
    }

    logger.info(`REGISTER [${req.body.email}] => Account Created!`)
    res.status(StatusCodes.CREATED).json({
      message: "The user account was created successfully",
      data: { userId: person.id },
    })
  } catch (error) {
    logger.error(`REGISTER => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function login(req: Request<{}, {}, LoginBody>, res: Response) {
  try {
    logger.info(`LOGIN [${req.body.email}] => Login Request!`)

    // Find user by email
    const person = await prisma.person.findFirst({
      where: { email: req.body.email },
    })

    // Check if the user exists
    if (person === null) {
      logger.info(`LOGIN [${req.body.email}] => User does not exist!`)
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `The user with email ${req.body.email} does not exist.`,
        code: "EEXIST",
      })
    }

    // Authenticate user
    logger.debug(`LOGIN [${req.body.email}] => Authenticating user...`)
    let authenticated = await argon2.verify(person.password, req.body.password)

    if (!authenticated) {
      logger.info(`LOGIN [${req.body.email}] => Login failed. Invalid Password!`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: `Invalid password for user with email ${req.body.email}`,
        code: "EPASS",
      })
    }

    // Check if person account is verified
    if (!person.verified) {
      logger.info(`LOGIN [${req.body.email}] => Login failed. Account not verified!`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not verified!",
        code: "EVERIFY",
      })
    }

    // Check if the user account is approved by an administrator
    if (!person.approved) {
      logger.info(`LOGIN [${req.body.email}] => Login failed. Account not approved!`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not approved. Contact an admin to solve this issue!",
        code: "EAPPROV",
      })
    }

    // Check if the person account is active
    if (!person.active) {
      logger.debug(`LOGIN [${req.body.email}] => Login failed. Account not active!`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is no longer active!",
        code: "EARCH",
      })
    }

    logger.debug(`LOGIN [${req.body.email}] => Generating tokens...`)
    const { isAdmin, userRole } = await fetchPersonProperties(person.id)

    // Access Token Information
    const accessTokenPayload = {
      id: Number(person.id),
      admin: isAdmin,
      role: userRole,
    }

    // Refresh Token Information
    const refreshTokenPayload = {
      person: Number(person.id),
      session: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        creationDate: req.headers.date,
      },
    }

    // Generate/Sign Access Token
    let accessToken = createAccessToken(accessTokenPayload)

    // Generate/Sign Refresh Token
    let refreshToken = createRefreshToken(refreshTokenPayload)

    logger.debug(`LOGIN [${req.body.email}] => Attaching cookies...`)

    // Attach tokens as cookies
    attachCookies(res, accessToken, refreshToken)

    logger.info(`LOGIN [${req.body.email}] => Authentication Successful!`)
    return res.status(StatusCodes.OK).json({
      message: "User authentication successful!",
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  } catch (error) {
    logger.error(`LOGIN => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function refresh(req: Request<{}, {}, RefreshBody>, res: Response) {
  try {
    if (req.signedCookies || req.body) {
      // Fetch and decode token
      const refreshToken = req.signedCookies.refreshToken
        ? req.signedCookies.refreshToken
        : req.body.refreshToken
      let decoded = verifyRefreshToken<RefreshToken>(refreshToken)
      if (decoded) {
        const person = await prisma.person.findUnique({
          where: { id: Number(decoded.person) },
        })
        assert(person !== null)
        logger.info(`REFRESH [${person.email}] => Token Refresh Request!`)

        logger.debug(`REFRESH [${person.email}] => Generating new tokens...`)
        const { userRole, isAdmin } = await fetchPersonProperties(person.id)

        // Access Token Information
        const accessTokenPayload = {
          id: Number(person.id),
          admin: isAdmin,
          role: userRole,
        }

        // Generate/Sign New Access Token
        let accessToken = createAccessToken(accessTokenPayload)

        logger.debug(`REFRESH [${person.email}] => Attaching cookies...`)
        // Attach tokens as cookies (update refresh token)
        attachCookies(res, accessToken, refreshToken)

        logger.info(`REFRESH [${person.email}] => Token Refresh Successful!`)
        return res.status(StatusCodes.CREATED).json({
          message: "User access token refresh successful!",
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      }
      logger.info(`REFRESH => Refresh token invalid/expired (logout)!`)
      res.status(StatusCodes.FORBIDDEN).json({
        message: "Refresh token invalid or expired",
      })
    } else {
      logger.info(`REFRESH => Refresh request unauthorized. No token supplied`)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized. The user must login first and obtain an access token",
      })
    }
  } catch (error) {
    logger.error(`REFRESH => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function verify(req: Request<{}, {}, VerifyAccountBody>, res: Response) {
  try {
    // Fetch and decoded the verification token
    let decoded = verifyToken<VerificationToken>(req.body.token)

    if (!decoded) {
      logger.info(`VERIFY => Verification token invalid!`)
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid Verification Token",
      })
    }

    const person = await prisma.person.findUnique({
      where: { id: Number(decoded.person) },
    })
    logger.info(`VERIFY [${person?.email}] => Account Verification Request!`)

    if (person?.verified) {
      logger.debug(`VERIFY [${person?.email}] => User already verified!`)
      return res.status(StatusCodes.OK).json({
        message: "The current user's account was already verified",
      })
    }

    logger.debug(`VERIFY [${person?.email}] => Verifying...`)
    await prisma.person.update({
      where: { id: person?.id },
      data: { verified: true },
    })

    logger.info(`VERIFY [${person?.email}] => User Verified Successfully!`)
    return res.status(StatusCodes.OK).json({
      message: "User verified successfully!",
    })
  } catch (error) {
    logger.error(`VERIFY => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function resetPassword(req: Request<{}, {}, ResetPasswordBody>, res: Response) {
  try {
    // Fetch and decoded the verification token
    let decoded = verifyToken<PasswordResetToken>(req.body.token)
    if (!decoded) {
      logger.info(`RESET-PASS => Password reset token invalid!`)
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid Verification Token",
      })
    }

    const person = await prisma.person.findUnique({
      where: { id: decoded.person },
    })

    logger.info(`RESET-PASS [${person?.email}] => Password reset request!`)
    logger.debug(`RESET-PASS [${person?.email}] => Resetting password...!`)
    await prisma.person.update({
      where: { id: person?.id },
      data: { password: await argon2.hash(req.body.password) },
    })

    logger.info(`RESET-PASS [${person?.email}] => Password reset successful!`)
    return res.status(StatusCodes.OK).json({
      message: "Password reset successful!",
    })
  } catch (error) {
    logger.error(`RESET-PASS => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  register,
  login,
  refresh,
  resetPassword,
  verify,
}
