import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { SpecialityCreateBody } from "../utils/types"
import speciality from "../routes/speciality.route"

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
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have permission to create a speciality.",
      })
    }

    // verify if a speciality with the given code already exists
    let speciality = await prisma.speciality.findFirst({where: {OR: [{code: req.body.code}, {speciality: req.body.speciality}]}});

    if (speciality != null){
      return res.status(StatusCodes.CONFLICT).json({
        message: "A speciality already exists with the given code or name. Cannot create another with the same code or name."
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
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  getAllSpecialities,
  createSpeciality,
}
