import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { verifyAccessToken } from "../services/auth.service"

import { SpecialityCreateBody, AccessToken } from "../utils/types"

/**
 * listar especialidades
 */
export async function getAllSpecialities(req: Request, res: Response) {
  // verify the token
  var decodedToken = res.locals.token
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

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
    },
  })

  res.status(StatusCodes.OK).json({
    data: specialities,
  })
}

/**
 * Criar uma nova especialidade
 *  speciality
 */
export async function createSpeciality(req: Request<{}, {}, SpecialityCreateBody>, res: Response) {
  // verify the token
  var decodedToken = res.locals.token
  if (!decodedToken) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "The token provided is not valid.",
    })
  }

  // otbain the caller properties
  var callerId = decodedToken.id
  var callerRole = decodedToken.role
  var callerIsAdmin = decodedToken.admin

  if (callerRole == "guard" || callerRole == "accountant") {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "You do not have permission to create a speciality.",
    })
  }

  prisma.speciality.create({
    data: {
      speciality: req.body.speciality,
    },
  })

  res.status(StatusCodes.OK).json({
    message: "The speciality has been successfully created.",
  })
}

export default {
  getAllSpecialities,
  createSpeciality,
}
