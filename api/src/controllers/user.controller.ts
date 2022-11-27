import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { EditUserBody } from "../utils/types"
import {
  fetchPersonProperties,
  updateInfoAccountant,
  updateInfoAdmin,
  updateInfoGuard,
  updateInfoIntern,
  updateInfoTherapist,
} from "../services/user.service"
import {
  AccountantUpdateSchema,
  AdminUpdateSchema,
  GuardUpdateSchema,
  InternUpdateSchema,
  TherapistUpdateSchema,
} from "../utils/schemas"

export async function getUsers(req: Request, res: Response) {
  const { id, role, isAdmin } = res.locals.token
  try {
    if (role === "admin" || (role === "therapist" && isAdmin)) {
      let users = await prisma.person.findMany({
        where: { id: { not: id } },
        include: {
          patient: {
            include: {
              school: true,
              profession: true,
            },
          },
          intern: true,
          therapist: true,
          accountant: true,
          guard: true,
        },
      })
      return res.status(StatusCodes.OK).json({
        message: "Successfully retrieved a user list",
        info: users,
      })
    }
    res.status(StatusCodes.FORBIDDEN).json({
      message: "The user does not have permission to access this endpoint",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function editUser(req: Request<{ user: Number }, {}, EditUserBody>, res: Response) {
  const { id, role, isAdmin } = res.locals.token
  try {
    if (isAdmin) {
      const userToEdit = await prisma.person.findUnique({
        where: { id: Number(req.params.user) },
      })

      if (!userToEdit) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "The user you wish to edit does not exist.",
        })
      }
      const userToEditProps = await fetchPersonProperties(userToEdit.id)

      if (userToEditProps.isAdmin) {
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "This user may not be edited since it has admin privileges too!",
        })
      }

      try {
        switch (userToEditProps.userRole) {
          case "therapist":
            updateInfoTherapist(Number(userToEdit.id), TherapistUpdateSchema.parse(req.body))
          case "admin":
            updateInfoAdmin(Number(userToEdit.id), AdminUpdateSchema.parse(req.body))
          case "accountant":
            updateInfoAccountant(Number(userToEdit.id), AccountantUpdateSchema.parse(req.body))
          case "guard":
            updateInfoGuard(Number(userToEdit.id), GuardUpdateSchema.parse(req.body))
          case "intern":
            updateInfoIntern(Number(userToEdit.id), InternUpdateSchema.parse(req.body))
        }
      } catch (error) {
        return res.status(StatusCodes.NOT_ACCEPTABLE).json({
          message:
            "The information provided does not match the information required to edit the user's profile",
        })
      }
    }

    res.status(StatusCodes.FORBIDDEN).json({
      msg: "You cannot edit this user's profile.",
    })
  } catch (error) {
    res.send(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default { getUsers, editUser }
