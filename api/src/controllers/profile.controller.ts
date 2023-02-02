import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import assert from "assert"

import prisma from "../utils/prisma"
import logger from "../utils/logger"

import {
  updateInfoAccountant,
  updateInfoAdmin,
  updateInfoGuard,
  updateInfoIntern,
  updateInfoTherapist,
} from "../services/user.service"

import { saveProfilePicture, getProfilePicture } from "../services/profile.service"

import { EditProfileBody } from "../utils/types"
import {
  AccountantSchema,
  AdminSchema,
  GuardSchema,
  InternSchema,
  TherapistSchema,
  User,
} from "../utils/schemas"
import uploadPicture from "../utils/upload"
import { attachCookies, createAccessToken, createRefreshToken } from "../services/auth.service"
import { Exception } from "handlebars"

export async function uploadProfilePicture(req: Request, res: Response) {
  try {
    // Authorize user
    const { id } = res.locals.token
    logger.info(`UPLOAD [user-id: ${id}] => Profile Picture upload authorized...`)

    // Upload Profile picture
    uploadPicture(req, res, (err) => {
      if (err) {
        logger.debug(`UPLOAD [user-id: ${id}] => Upload Failed. Invalid file format!`)
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Invalid picture format (must be jpg, png, jpeg)",
        })
      }

      // Save File, Update Database
      logger.debug(`UPLOAD [user-id: ${id}] => Saving user's profile picture & updating database`)
      const picture = req.file
      if (picture === null || picture === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Picture is missing in the request",
        })
      }
      saveProfilePicture(id, picture)

      logger.info(`UPLOAD [user-id: ${id}] => Upload successful!`)
      return res.status(StatusCodes.CREATED).json({
        message: "Profile picture uploaded successfully",
      })
    })
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function downloadProfilePicture(req: Request, res: Response) {
  try {
    // Authorize user
    const { id } = res.locals.token
    logger.info(`DOWNLOAD [user-id: ${id}] => Profile Picture download authorized...`)

    // Retrieve profile picture path
    const picture: string = await getProfilePicture(id)

    if (!picture.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "This user does not have a profile picture...",
      })
    }

    // Return information
    logger.info(`DOWNLOAD [user-id: ${id}] => User profile picture retrieved successfully!`)
    res.status(StatusCodes.OK).download(picture)
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function fetchProfileInfo(req: Request, res: Response) {
  try {
    // Authorize user
    const { id, role } = res.locals.token
    logger.info(
      `PROFILE-INFO [user-id: ${id}] => Profile Info access granted. Fetching information...`
    )

    // Retrieve Profile Info
    logger.debug(
      `PROFILE-INFO [user-id: ${id}] => Locating and retrieving user info from the database...`
    )

    // Fetch Person
    const usr = await prisma.person.findUnique({ where: { id: id } })

    // Parse Response
    let base = {
      id: id,
      name: usr?.name,
      email: usr?.email,
      password: usr?.password,
      address: usr?.address,
      birthDate: usr?.birth_date,
      phoneNumber: usr?.phone_number,
      verified: usr?.verified,
      active: usr?.active,
      approved: usr?.approved,
      taxNumber: usr?.tax_number,
    }

    let therapist = null
    let data = null
    if ((therapist = await prisma.therapist.findUnique({ where: { person_id: usr?.id } }))) {
      const speciality = await prisma.therapist_speciality.findFirst({
        where: {
          therapist_person_id: usr?.id,
        },
      })
      data = {
        extern: therapist?.extern,
        license: therapist?.license,
        healthSystem: therapist?.health_system,
        speciality: speciality?.speciality_speciality,
        ...base,
      }
    } else {
      data = base
    }
    const person = { ...data, role: role }

    // Return information
    assert(person != null)
    logger.info(`PROFILE-INFO [user-id: ${id}] => Profile information fetched successfully...`)
    res.status(StatusCodes.OK).json({
      message: `${person.name} profile information fetched successfully`,
      data: person,
    })
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function editProfileInfo(req: Request<{}, {}, EditProfileBody>, res: Response) {
  try {
    // Authorize User
    const { id, role } = res.locals.token
    logger.info(`EDIT-PROFILE [user-id: ${id}] => Access granted. Editing profile...`)

    // Edit User Profile depending on the user type.
    switch (role) {
      case User.THERAPIST:
        updateInfoTherapist(id, TherapistSchema.parse(req.body))
        break
      case User.ACCOUNTANT:
        updateInfoAccountant(id, AccountantSchema.parse(req.body))
        break
      case User.GUARD:
        updateInfoGuard(id, GuardSchema.parse(req.body))
        break
      case User.INTERN:
        updateInfoIntern(id, InternSchema.parse(req.body))
        break
      case User.ADMIN:
        updateInfoAdmin(id, AdminSchema.parse(req.body))
        break
    }

    // Update complete!
    logger.info(`EDIT-PROFILE [user-id: ${id}] => Profile edited successfully!`)
    return res.status(StatusCodes.OK).json({
      message: "The user's profile was updated successfully",
    })
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function switchView(req: Request, res: Response) {
  // Authorize User
  const { id, role, admin } = res.locals.token
  try {
    if (!admin || role !== User.THERAPIST) {
      logger.info(`SWITCH [${id}] => Switch View is not possible for this user!`)
      return res.status(StatusCodes.NOT_ACCEPTABLE).json({
        message: "This operation is only defined for Admin Therapists",
      })
    }
    logger.info(`SWITCH [${id}] => Switch View Request Granted!`)

    // Access Token Information
    const accessTokenPayload = {
      id: Number(id),
      admin: admin,
      role: role === User.THERAPIST ? User.ADMIN : User.THERAPIST,
    }

    // Refresh Token Information
    const refreshTokenPayload = {
      person: Number(id),
      session: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        creationDate: req.headers.date,
      },
    }

    // Generate/Sign New Tokens
    let accessToken = createAccessToken(accessTokenPayload)
    let refreshToken = createRefreshToken(refreshTokenPayload)

    // Attach tokens as cookies
    logger.debug(`SWITCH [${id}] => Attaching cookies...`)
    attachCookies(res, accessToken, refreshToken)

    logger.info(`SWITCH [${id}] => View Switched.`)
    return res.status(StatusCodes.OK).json({
      message: "Switch View Successful!",
      accessToken: accessToken,
      refreshToken: refreshToken,
    })
  } catch (error) {
    logger.error(`SWITCH => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  uploadProfilePicture,
  downloadProfilePicture,
  fetchProfileInfo,
  editProfileInfo,
  switchView,
}
