import fs from "fs"
import path from "path"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import logger from "../utils/logger"
import assert from "assert"
import { EditProfileBody } from "../utils/types"

const FILE_UPLOAD_DIR = String(process.env.FILE_UPLOAD_DIR)

export async function uploadProfilePicture(req: Request, res: Response) {
  try {
    const { id } = res.locals.token
    const picture = req.file
    if (picture === null || picture === undefined) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Picture is missing in the request",
      })
    }

    const person = await prisma.person.findUnique({ where: { id: id } })
    assert(person !== null)

    if (person.photo) {
      fs.rm(path.join(FILE_UPLOAD_DIR, person.photo), () => {})
      console.log(person.photo)
    }

    await prisma.person.update({
      where: { id: id },
      data: {
        photo: picture.filename,
      },
    })

    return res.status(StatusCodes.CREATED).json({
      message: "Profile picture uploaded successfully",
    })
  } catch (error) {
    logger.error(error)
  }
}

export async function downloadProfilePicture(req: Request, res: Response) {
  try {
    const { id } = res.locals.token
    const person = await prisma.person.findUnique({ where: { id: id } })
    assert(person !== null)

    res.download(path.join(FILE_UPLOAD_DIR, String(person.photo)))
  } catch (error) {
    logger.error(error)
  }
}

export async function fetchProfileInfo(req: Request, res: Response) {
  try {
    const { id, role } = res.locals.token

    const person = await prisma.person.findUnique({
      where: { id: id },
      include: {
        therapist: role === "therapist",
        guard: role === "guard",
        accountant: role === "accountant",
        intern: role === "intern",
      },
    })

    assert(person != null)
    res.status(StatusCodes.OK).json({
      message: `${person.name} profile information fetched successfully`,
      info: person,
    })
  } catch (error) {
    logger.error(error)
  }
}

export async function editProfileInfo(req: Request<{}, {}, EditProfileBody>, res: Response) {
  const { id, role } = res.locals.token
  if (role !== req.body.role) {
    return res.status(StatusCodes.NOT_ACCEPTABLE).json({
      message:
        "The information provided does not match the information required to update the user's profile",
    })
  }
}

export default { uploadProfilePicture, downloadProfilePicture, fetchProfileInfo }
