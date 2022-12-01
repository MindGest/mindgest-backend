import fs from "fs"
import path from "path"
import assert from "assert"

import prisma from "../utils/prisma"
import logger from "../utils/logger"

const FILE_UPLOAD_DIR = String(process.env.FILE_UPLOAD_DIR)

export async function saveProfilePicture(user: number, picture: Express.Multer.File) {
  // Retrieve user from the database
  logger.debug(`UPLOAD [user-id: ${user}] => Fetching person for profile picture update!`)
  const person = await prisma.person.findUnique({ where: { id: user } })
  assert(person !== null)

  // Check if the person has a photo, remove the old one.
  if (person.photo) {
    logger.debug(`UPLOAD [user-id: ${user}] => Removing old the profile picture!`)
    fs.rm(path.join(FILE_UPLOAD_DIR, person.photo), () => {})
  }

  // Update profile path in the database
  logger.debug(`UPLOAD [user-id: ${user}] => Updating picture in the database!`)
  await prisma.person.update({
    where: { id: user },
    data: {
      photo: picture.filename,
    },
  })
}

export async function getProfilePicture(user: number) {
  // Retrieve user from the database (find profile image path)
  const person = await prisma.person.findUnique({ where: { id: user } })
  assert(person !== null)

  // Return the profile picture file path
  logger.debug(`DOWNLOAD [user-id: ${user}] => Fetching the user's profile picture...`)
  return person.photo ? path.join(FILE_UPLOAD_DIR, String(person.photo)) : ""
}

export default { saveProfilePicture, getProfilePicture }
