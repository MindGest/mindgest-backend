import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { GetPermissionsBody, EditPermissionsBody } from "../utils/types"

// retornar as permissões de todos os interns de um determinado processo
export async function getInternsPermissions(
  req: Request<{}, {}, GetPermissionsBody>,
  res: Response
) {
  /**
   * Returns the permissions of all the interns in the process.
   */

  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // get the info from the request body
    let processId = req.body.processId

    let isProcessTherapist = false

    // if the caller is a therapist he needs to be a therapist of the given process to access this information.
    if (callerRole == "therapist") {
      let therapistInProcess = await prisma.therapist_process.findFirst({
        where: { therapist_person_id: callerId, process_id: processId },
      })
      if (therapistInProcess != null) {
        isProcessTherapist = true
      }
    }

    // allow only therapists and admins to access this information
    if (isProcessTherapist == false && !callerIsAdmin) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You don't have permissions to access this information.",
      })
    }

    // get the permissions of the interns in the proces
    let collaborators_permissions = await prisma.permissions.findMany({
      where: { process_id: processId },
      select: {
        editprocess: true,
        see: true,
        appoint: true,
        statitics: true,
        editpatitent: true,
        archive: true,
        person_id: true,
      },
    })

    let interns_permissions = []
    // remove the collaborators that are therapists
    for (let collaborator_permissions of collaborators_permissions) {
      let intern = await prisma.intern.findFirst({
        where: { person_id: collaborator_permissions.person_id },
      })
      if (intern != null) {
        // is intern
        interns_permissions.push(collaborator_permissions)
      }
    }

    let infoToReturn = []

    for (let i = 0; i < interns_permissions.length; i++) {
      // get the name of the intern
      let intern = await prisma.person.findFirst({
        where: { id: interns_permissions[i].person_id },
        select: { name: true },
      })
      infoToReturn.push({
        editprocess: interns_permissions[i].editprocess,
        see: interns_permissions[i].see,
        appoint: interns_permissions[i].appoint,
        statistics: interns_permissions[i].statitics,
        editpatient: interns_permissions[i].editpatitent,
        archive: interns_permissions[i].archive,
        name: intern?.name,
        collaboratorId: interns_permissions[i].person_id,
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

// retornar as permissões de um intern de um determinado processo
export async function getInternPermissions(
  req: Request<{}, {}, GetPermissionsBody>,
  res: Response
) {
  /**
   * Returns the permissions of the caller (if intern) in the process.
   */

  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    // get the info from the request body
    let processId = req.body.processId
    let internId = callerId

    // TODO: authorization
    if (callerRole != "intern") {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You should not be here.",
      })
    }

    // get the permissions of the intern in the proces
    let intern_permissions = await prisma.permissions.findFirst({
      where: { process_id: processId, person_id: internId },
      select: {
        editprocess: true,
        see: true,
        appoint: true,
        statitics: true,
        editpatitent: true,
        archive: true,
        person_id: true,
      },
    })

    let intern = await prisma.person.findFirst({ where: { id: internId } })

    let infoToReturn = {
      editprocess: intern_permissions?.editprocess,
      see: intern_permissions?.see,
      appoint: intern_permissions?.appoint,
      statistics: intern_permissions?.statitics,
      editpatient: intern_permissions?.editpatitent,
      archive: intern_permissions?.archive,
      name: intern?.name,
      collaboratorId: intern_permissions?.person_id,
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

// editar as permissões de um intern num dado processo.
export async function editInternPermissions(
  req: Request<{}, {}, EditPermissionsBody>,
  res: Response
) {
  /**
   * Used to edit the permissions of an intern in the given process.
   */
  try {
    var decodedToken = res.locals.token

    // obtain the caller properties
    var callerId = decodedToken.id
    var callerRole = decodedToken.role
    var callerIsAdmin = decodedToken.admin

    let isProcessTherapist = false

    let processId = req.body.processId

    // if the caller is a therapist he needs to be a therapist of the given process to access this information.
    if (callerRole == "therapist") {
      let therapistInProcess = await prisma.therapist_process.findFirst({
        where: { therapist_person_id: callerId, process_id: processId },
      })
      if (therapistInProcess != null) {
        isProcessTherapist = true
      }
    }

    // check if caller is admin or a therapist of the process
    if (isProcessTherapist == false && !callerIsAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You don't have permissions to access this information.",
      })
    }

    // check if the intern of the given id is associated with the process.
    let intern_process = await prisma.intern_process.findFirst({
      where: { process_id: processId, intern_person_id: req.body.collaboratorId },
    })
    if (intern_process == null) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The given intern id is not associated with the given process.",
      })
    }

    // get the id of the permission
    let permission = await prisma.permissions.findFirst({
      where: {
        person_id: req.body.collaboratorId,
        process_id: processId,
      },
    })

    // update the permissions of the intern
    await prisma.permissions.update({
      where: { id: permission?.id },
      data: {
        editprocess: req.body.editProcess,
        see: req.body.see,
        appoint: req.body.appoint,
        statitics: req.body.statitics,
        editpatitent: req.body.editPatient,
        archive: req.body.archive,
      },
    })

    // return
    res.status(StatusCodes.OK).json({
      message: "The permissions of the specified intern have been updated.",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  getInternsPermissions,
  editInternPermissions,
  getInternPermissions,
}
