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
          patient: true,
          intern: true,
          therapist: true,
          accountant: true,
          guard: true,
          admin: true,
        },
      })
      return res.status(StatusCodes.OK).json({
        message: "Successfully retrieved a user list",
        info: users.filter((user) => !user.patient),
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

export async function getAllTherapists(req: Request, res: Response) {
  try {
    let infoToReturn = []

    // obtain the ids of the therapists
    let therapists = await prisma.therapist.findMany()

    // obtain the name of the therapists
    for (let i = 0; i < therapists.length; i++) {
      let person = await prisma.person.findFirst({ where: { id: therapists[i].person_id } })
      infoToReturn.push({
        id: therapists[i].person_id,
        name: person?.name,
      })
    }

    res.status(StatusCodes.OK).json({
      data: infoToReturn,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function getAllInterns(req: Request, res: Response) {
  try {
    let infoToReturn = []

    // obtain the ids of the therapists
    let interns = await prisma.intern.findMany()

    // obtain the name of the therapists
    for (let i = 0; i < interns.length; i++) {
      let person = await prisma.person.findFirst({ where: { id: interns[i].person_id } })
      infoToReturn.push({
        id: interns[i].person_id,
        name: person?.name,
      })
    }

    res.status(StatusCodes.OK).json({
      data: infoToReturn,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  getUsers,
  getAllInterns,
  getAllTherapists,
}
