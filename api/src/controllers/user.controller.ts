import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"


import {
  EditUserBody
} from "../utils/types";


//TODO
export async function uploadAvatar(req: Request, res: Response) {}

// estava a dar stresses com BigInts, então a internet ajudou
;(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}
export async function getAllUsers(req: Request, res: Response) {
  // para filtrar info receber parametros pelo body

  var users = await prisma.person.findMany({
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

  console.log(users)
  res.status(StatusCodes.OK).json({
    users: users,
  })
}

/**
 * Acho que para cenas como alterar a role de alguem no sistema, tem de se usar outro endpoint, especifico para isso
 */

export async function editUser(req: Request<{}, {}, EditUserBody>, res: Response) {
  /**
   * No body do request tem de vir o id da pessoa (preciso de saber quem vai ser alterado)
   * Com toda a informacao. Campos que nao são preenchidos pelo utilizador devem estar no body do request como null.
   *
   * Todos tem de estar como body.<property>, mesmo que sejam pertencentes a um sub-objeto.
   */

  // TODO
  // verify that the person who called the method as access to edit the user's info
  // It should work when:
  //  - it is called by the actual user
  //  - it is called by a therapist, admin and maybe an intern

  var userToEditType = req.body.userToEdit.role;
  

  if (!canEdit()) {
    res.status(StatusCodes.FORBIDDEN).json({
      msg: "You cannot edit this user's profile.",
    })
    return
  }

  switch(req.body.userToEdit.role){
    case "admin":
      updateInfoPerson(req.body.userToEdit, res, req.body.id)
    case "therapist":
      updateInfoTherapist(req.body.userToEdit, res, req.body.id)
    case "accountant":
      updateInfoPerson(req.body.userToEdit, res, req.body.id)
    case "guard":
      updateInfoPerson(req.body.userToEdit, res, req.body.id)
    case "intern":
      updateInfoPerson(req.body.userToEdit, res, req.body.id)
    case "patient":
      updateInfoPatient(req.body.userToEdit, res, req.body.id)

  }
}

// interface Dictionary<T> {
//     [Key: string]: T;
// }

async function canEdit() {
  // tem de ter acesso a quem esta a fazer o pedido (jwt?) e de quem se quer alterar.

  // checks if a user can edit or not
  // if he is the user himself, then can, otherwise only can if he is an admin or one of the patients therapist

  // type: patient -> admin, intern (with permissions?), therapist on the process
  // type: other -> admin(?), himself



  return true
}

async function getUserType(id: number) {
  /**
   * parameters:
   * id: id that allows us to search the person in the database
   *
   * return:
   * returns the type of the user that has id as an id.
   */

  var user

  // check if the user is a patient
  user = await prisma.patient.findUnique({ where: { person_id: id } })
  if (user) return "patient"

  // check if the user is an intern
  user = await prisma.intern.findUnique({ where: { person_id: id } })
  if (user) return "intern"

  // check if the user is a therapist
  user = await prisma.therapist.findUnique({ where: { person_id: id } })
  if (user) return "therapist"

  // check if the user is an accountant
  user = await prisma.accountant.findUnique({ where: { person_id: id } })
  if (user) return "accountant"

  // check if the user is a guard
  user = await prisma.guard.findUnique({ where: { person_id: id } })
  if (user) return "guard"
}

async function updateInfoTherapist(body: any, res: Response, userId: number) {
  var userType = body.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.therapist.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

    prisma.therapist.update({
      data: {
        extern: body.extern,
        cedula: body.cedula,
        person: {
          update: {
            active: body.active,
            address: body.address,
            name: body.name,
            email: body.email,
            aproved: body.aproved,
            birth_date: body.birthDate,
            //password: await argon2.hash(body.password),
            phone_number: body.phoneNumber
          },
        },
      },
      where: { person_id: userId },
    })
}

async function updateInfoIntern(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.intern.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.intern.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          //password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoGuard(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.guard.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.guard.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          // password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoAccountant(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.accountant.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.accountant.update({
    data: {
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          // password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoPatient(body: any, res: Response, userId: number) {
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.patient.findUnique({
    where: { person_id: userId },
  })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.patient.update({
    data: {
      tax_number: body.taxNumber,
      health_number: body.healthNumber,
      request: body.request,
      remarks: body.remarks,
      patienttype: {
        update: {
          id: body.patienttype_id,
        },
      },
      person: {
        update: {
          active: body.active,
          address: body.address,
          name: body.name,
          email: body.email,
          aproved: body.aproved,
          birth_date: body.birthDate,
          // password: await argon2.hash(body.password),
          phone_number: body.phoneNumber,
        },
      },
    },
    where: { person_id: userId },
  })

  // update school info
  var oldSchool = await prisma.school.findFirst({
    where: { patient_person_id: userId },
  })

  if (oldSchool) {
    prisma.school.update({
      where: {id: oldSchool.id},
      data: {
        name: body.schoolName,
        course: body.schoolCourse,
        grade: body.schoolGrade,
      },
    })
  }

  // update profession info
  var oldProfession = await prisma.profession.findFirst({
    where: { patient_person_id: userId },
  })

  if (oldProfession) {
    prisma.profession.update({
      where: {id: oldProfession.id},
      data: {
        name: body.professionName,
      },
    })
  }

  res.status(StatusCodes.OK).json({
    msg: "Success.",
  })
}

async function updateInfoPerson(body: any, res: Response, userId: number) {
  /**
   * Use this one to update accountant, guard and intern.
   * They don't have parameters in the respective entity.
   */
  var userType = body.userToEdit.role

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.person.findUnique({ where: { id: userId } })

  if (!oldData) {
    res.status(StatusCodes.NOT_FOUND).json({
      msg: `The given id does not belong to an ${userType}. It might not exist at all, or just is not an ${userType}.`,
    })
    return
  }

  prisma.person.update({
    data: {
      active: body.active,
      address: body.address,
      name: body.name,
      email: body.email,
      aproved: body.aproved,
      birth_date: body.birthDate,
      // password: await argon2.hash(body.password),
      phone_number: body.phoneNumber,
    },
    where: { id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

export default { getAllUsers, editUser, uploadAvatar }
