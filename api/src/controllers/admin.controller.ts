import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import logger from "../utils/logger"
import { EditProfileBody } from "../utils/types"
import {
  fetchPersonProperties,
  updateInfoAccountant,
  updateInfoAdmin,
  updateInfoGuard,
  updateInfoIntern,
  updateInfoTherapist,
} from "../services/user.service"
import {
  AccountantSchema,
  AdminSchema,
  GuardSchema,
  InternSchema,
  TherapistSchema,
  User,
} from "../utils/schemas"
import assert from "assert"
import { getProfilePicture, saveProfilePicture } from "../services/profile.service"
import uploadPicture from "../utils/upload"

export async function uploadUserProfilePicture(req: Request, res: Response) {
  try {
    // Authenticate / Authorize User
    const { id } = res.locals.token
    logger.info(`UPLOAD [user-id: ${id}] => User's profile picture upload by admin authorized.`)

    // Upload Profile picture
    uploadPicture(req, res, async (err) => {
      if (err) {
        logger.debug(`UPLOAD [user-id: ${id}] => Upload Failed. Invalid file format!`)
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Invalid picture format (must be jpg, png, jpeg)",
        })
      }

      // Fetch user
      const user = await prisma.person.findUnique({
        where: { id: Number(req.params.user) },
      })

      // Check if user exists
      if (!user) {
        logger.debug(`UPLOAD [user-id: ${id}] => User with id ${req.params.user} does not exist!`)
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "The user you wish to edit does not exist.",
        })
      }

      // Save File, Update Database
      logger.debug(
        `UPLOAD [user-id: ${id}] => Saving user's [user-id: ${user.id}] profile picture & updating database`
      )
      const picture = req.file
      if (picture === null || picture === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Picture is missing in the request",
        })
      }
      saveProfilePicture(Number(user.id), picture)

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

export async function downloadUserProfilePicture(req: Request<{ user: string }>, res: Response) {
  try {
    // Authenticate / Authorize user
    logger.info(
      `DOWNLOAD [user-id: ${req.params.user}] => Admin download of user's profile authorized...`
    )

    // Fetch user
    const user = await prisma.person.findUnique({
      where: { id: Number(req.params.user) },
    })

    // Check if user exists
    if (!user) {
      logger.debug(
        `UPLOAD [user-id: ${req.params.user}] => User with id ${req.params.user} does not exist!`
      )
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The user you wish to retrieve does not exist.",
      })
    }

    // Retrieve profile picture path
    logger.info(`DOWNLOAD [user-id: ${user.id}] => User profile picture retrieved successfully!`)
    const picture = await getProfilePicture(Number(user.id))
    res.status(StatusCodes.OK).download(picture)
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function fetchUserProfileInfo(req: Request<{ user: string }>, res: Response) {
  try {
    // Authenticate / Authorized User
    logger.info(
      `PROFILE-INFO [user-id: ${req.params.user}] => Admin access to user's profile info granted. Fetching information...`
    )

    // Fetch user
    const user = await prisma.person.findUnique({
      where: { id: Number(req.params.user) },
    })

    // Check if user exists
    if (!user) {
      logger.debug(
        `PROFILE-INFO [user-id: ${req.params.user}] => User with id ${req.params.user} does not exist!`
      )
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The user you wish to retrieve does not exist.",
      })
    }

    // Retrieve Profile Info
    logger.debug(
      `PROFILE-INFO [user-id: ${user.id}] => Locating and retrieving user info from the database...`
    )
    const userProps = await fetchPersonProperties(user.id)
    let usr = await prisma.person.findUnique({
      where: { id: user.id },
    })

    // Parse Response
    let data = null
    let base = {
      id: user.id,
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
    const person = { role: userProps.userRole, ...data }

    // Return information
    assert(person != null)
    logger.info(`PROFILE-INFO [user-id: ${user.id}] => Profile information fetched successfully...`)
    res.status(StatusCodes.OK).json({
      message: `${person.name} profile information retrieved successfully`,
      data: person,
    })
  } catch (error) {
    logger.error(error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function editUserProfileInfo(
  req: Request<{ user: string }, {}, EditProfileBody>,
  res: Response
) {
  try {
    // Authenticate / Authorize User
    const { id, role, isAdmin } = res.locals.token
    logger.info(`EDIT-PROFILE [user-id: ${id}] => Access granted to Admin User. Editing profile...`)

    // Fetch User
    const user = await prisma.person.findUnique({
      where: { id: Number(req.params.user) },
    })

    // Check if user exists
    if (!user) {
      logger.debug(
        `EDIT-PROFILE[user-id: ${id}] => User with id ${req.params.user} does not exist!`
      )
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The user you wish to edit does not exist.",
      })
    }

    const userProps = await fetchPersonProperties(user.id)
    console.log(userProps)
    if (userProps.isAdmin) {
      logger.debug(
        `EDIT-PROFILE[user-id: ${id}] => This user may not be edited since it has admin privileges too!`
      )
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "This user may not be edited since it has admin privileges too!",
      })
    }

    // Edit User Profile depending on the user type.
    switch (userProps.userRole) {
      case User.THERAPIST:
        updateInfoTherapist(Number(user.id), TherapistSchema.parse(req.body))
        break
      case User.ADMIN:
        updateInfoAdmin(Number(user.id), AdminSchema.parse(req.body))
        break
      case User.ACCOUNTANT:
        updateInfoAccountant(Number(user.id), AccountantSchema.parse(req.body))
        break
      case User.GUARD:
        updateInfoGuard(Number(user.id), GuardSchema.parse(req.body))
        break
      case User.INTERN:
        updateInfoIntern(Number(user.id), InternSchema.parse(req.body))
        break
    }

    // Update complete!
    logger.info(`EDIT-PROFILE [user-id: ${user.id}] => Profile edited successfully!`)
    res.status(StatusCodes.OK).json({
      message: "The user's profile was updated successfully",
    })
  } catch (error) {
    logger.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function approve(req: Request, res: Response) {
  try {
    // Authenticate / Authorize User
    logger.info(
      `APPROVE [user-id: ${req.params.user}] => Access granted to Admin User. Editing profile...`
    )

    // Fetch User
    const user = await prisma.person.findUnique({
      where: { id: Number(req.params.user) },
    })

    // Check if user exists
    if (!user) {
      logger.debug(
        `APPROVE[user-id: ${req.params.user}] => User with id ${req.params.user} does not exist!`
      )
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The user you wish to edit does not exist.",
      })
    }
    const userProps = await fetchPersonProperties(user.id)

    if (userProps.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "This user may not be edited since it has admin privileges too!",
      })
    }

    // Approve User Account
    await prisma.person.update({
      where: { id: user.id },
      data: {
        approved: true,
      },
    })

    logger.info(`APPROVE [user-id: ${user.id}] => Profile edited successfully!`)
    return res.status(StatusCodes.OK).json({
      message: "The user account was approved successfully",
    })
  } catch (error) {
    logger.error(error)
    res.send(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  editUserProfileInfo,
  fetchUserProfileInfo,
  uploadUserProfilePicture,
  downloadUserProfilePicture,
  approve,
}
