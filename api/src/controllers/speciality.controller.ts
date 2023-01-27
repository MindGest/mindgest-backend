import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { SpecialityCreateBody } from "../utils/types"

/**
 * listar especialidades
 */
export async function getAllSpecialities(req: Request, res: Response) {
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // permissions
    if (!callerIsAdmin) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to list all the specialities.",
      })
    }

    var specialities = await prisma.speciality.findMany({
      select: {
        speciality: true,
        code: true,
        description: true,
      },
    })

    res.status(StatusCodes.OK).json({
      data: specialities,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

/**
 * Criar uma nova especialidade
 *  speciality
 */
export async function createSpeciality(req: Request<{}, {}, SpecialityCreateBody>, res: Response) {
  try {
    var decodedToken = res.locals.token

    // otbain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    if (callerRole == "guard" || callerRole == "accountant") {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to create a speciality.",
      })
    }

    await prisma.speciality.create({
      data: {
        speciality: req.body.speciality,
        code: req.body.code,
        description: req.body.description,
      },
    })

    res.status(StatusCodes.OK).json({
      message: "The speciality has been successfully created.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  getAllSpecialities,
  createSpeciality,
}
