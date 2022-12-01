import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { User } from "../utils/schemas"

export async function getUsers(req: Request, res: Response) {
  const { id, role, isAdmin } = res.locals.token
  try {
    if (role === User.ADMIN || (role === User.THERAPIST && isAdmin)) {
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

export default { getUsers }
