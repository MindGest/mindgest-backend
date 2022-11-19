import argon2 from "argon2"
import assert from "assert"
import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"

import logger from "../utils/logger"
import prisma from "../utils/prisma"

import { fetchPersonProperties } from "../services/user.service"
import { sendResetPasswordEmail, sendVerificationEmail } from "../utils/mail/mailler"

import {
  attachCookies,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  verifyToken,
  createToken,
} from "../services/auth.service"

import {
  RegistrationBody,
  LoginBody,
  RefreshToken,
  RefreshBody,
  VerifyAccountBody,
  VerificationToken,
  ForgotPasswordBody,
  ResetPasswordBody,
  PasswordResetToken,
  AccountVerificationSchema,
} from "../utils/types"

export async function register(req: Request<{}, {}, RegistrationBody>, res: Response) {
  try {
    // Find user by email
    let user = await prisma.person.findUnique({
      where: { email: req.body.email },
    })

    // Check if user exists
    if (user !== null) {
      return res.status(StatusCodes.CONFLICT).json({
        message: `A user with email ${req.body.email} already exists.`,
      })
    }

    // Create new user (Person)
    let person = await prisma.person.create({
      data: {
        active: true,
        verified: false,
        aproved: false,
        name: req.body.name,
        email: req.body.email,
        password: await argon2.hash(req.body.password),
        address: req.body.address,
        birth_date: new Date(req.body.birthDate),
        phone_number: req.body.phoneNumber,
      },
    })

    // Create entry in the table, associated with the user's role
    switch (req.body.role) {
      case "accountant":
        await prisma.accountant.create({
          data: { person: { connect: { id: person.id } } },
        })
        break
      case "guard": {
        await prisma.guard.create({
          data: { person: { connect: { id: person.id } } },
        })
        break
      }
      case "intern": {
        await prisma.intern.create({
          data: { person: { connect: { id: person.id } } },
        })
        break
      }
      case "therapist": {
        await prisma.therapist.create({
          data: {
            cedula: req.body.cedula,
            healthSystem: req.body.healthsystem,
            admin:
              (await prisma.therapist.count({
                where: { admin: true },
              })) < 4,
            extern: false,
            person: { connect: { id: person.id } },
          },
        })
        break
      }
    }
    res.status(StatusCodes.CREATED).json({
      message: "The user was created successfully",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function login(req: Request<{}, {}, LoginBody>, res: Response) {
  try {
    // Find user by email
    const person = await prisma.person.findUnique({
      where: { email: req.body.email },
    })

    // Check if the user exists
    if (person === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `The user with email "${req.body.email}" does not exist.`,
      })
    }

    // Authenticate user
    let authenticated = await argon2.verify(person.password, req.body.password)

    if (!authenticated) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: `Invalid password for user with email ${req.body.email}`,
      })
    }

    // Check if person account is verified
    if (!person.verified) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not verified!",
      })
    }

    // Check if the user account is approved by an administrator
    if (!person.aproved) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not approved. Contact an admin to solve this issue!",
      })
    }

    // Check if the person account is active
    if (!person.active) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is no longer active!",
      })
    }

    // TODO: Gotta return you your role and tell you if you are an admin for sure for sure
    const { userRole, isAdmin } = await fetchPersonProperties(person.id)

    // Access Token Information
    const accessTokenPayload = {
      id: person.id,
      email: person.name,
      active: person.active,
      admin: isAdmin,
      role: userRole,
    }

    // Refresh Token Information
    const refreshTokenPayload = {
      person: person.id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      creationDate: req.headers.date,
    }

    // Generate/Sign Access Token
    let accessToken = createAccessToken(accessTokenPayload)

    // Generate/Sign Refresh Token
    let refreshToken = createRefreshToken(refreshTokenPayload)

    // Attach tokens as cookies
    attachCookies(res, accessToken, refreshToken)

    return res.status(StatusCodes.OK).json({
      message: "User authentication sucessfull!",
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  } catch (error) {
    logger.error(error)
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

        const { userRole, isAdmin } = await fetchPersonProperties(person.id)

        // Access Token Information
        const accessTokenPayload = {
          id: person.id,
          email: person.name,
          active: person.active,
          admin: isAdmin,
          role: userRole,
        }

        // Generate/Sign New Access Token
        let accessToken = createAccessToken(accessTokenPayload)

        // Attach tokens as cookies (update refresh token)
        attachCookies(res, accessToken, refreshToken)
        return res.status(StatusCodes.CREATED).json({
          message: "User access token refresh sucessfull!",
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      }
      res.status(StatusCodes.FORBIDDEN).json({
        message: "Refresh token invalid or expired",
      })
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized. The user must login first and obtain an access token",
      })
    }
  } catch (error) {
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
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid Verification Token",
      })
    }

    const person = await prisma.person.findUnique({
      where: { id: Number(decoded.person) },
    })

    if (person?.verified) {
      return res.status(StatusCodes.OK).json({
        message: "The current user is already verified",
      })
    }

    await prisma.person.update({
      where: { id: person?.id },
      data: { verified: true },
    })

    return res.status(StatusCodes.OK).json({
      message: "User verified sucessfully!",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function forgotPassword(req: Request<{}, {}, ForgotPasswordBody>, res: Response) {
  try {
    const person = await prisma.person.findUnique({
      where: { email: req.body.email },
    })

    // Check if the user exists
    if (person === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `The user with email "${req.body.email}" does not exist.`,
      })
    }

    // Check if person account is verified
    if (!person.verified) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not verified!",
      })
    }

    // Check if the user account is approved by an administrator
    if (!person.aproved) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "The account is not approved. Contact an admin to solve this issue!",
      })
    }

    // Create a simple token for password reset
    let token = createToken({ person: Number(person.id) })

    // Send email if callback is provided
    if (req.body.callback) {
      await sendResetPasswordEmail(person.name, person.email, token, req.body.callback)
    }

    res.status(StatusCodes.OK).json({
      message: "Password reset token generated",
      token: token,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function accountVerification(
  req: Request<{}, {}, AccountVerificationSchema>,
  res: Response
) {
  try {
    const person = await prisma.person.findUnique({
      where: { email: req.body.email },
    })

    // Check if the user exists
    if (person === null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `The user with email "${req.body.email}" does not exist.`,
      })
    }

    // Create a simple token for user verification
    let token = createToken({ person: Number(person.id) })

    // Send email if callback is provided
    if (req.body.callback) {
      await sendVerificationEmail(person.name, person.email, token, req.body.callback)
    }

    res.status(StatusCodes.OK).json({
      message: "Account verification token generated",
      token: token,
    })
  } catch (error) {
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
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid Verification Token",
      })
    }

    const person = await prisma.person.findUnique({
      where: { id: decoded.person },
    })

    await prisma.person.update({
      where: { id: person?.id },
      data: { password: await argon2.hash(req.body.password) },
    })

    return res.status(StatusCodes.OK).json({
      message: "Password reset successful!",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  verify,
  accountVerification,
}
