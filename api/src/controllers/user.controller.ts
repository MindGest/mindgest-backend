import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

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

export async function editUser(req: Request, res: Response) {
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

  // TODO: fazer uma funcao que retorna o tipo do user com base no seu person_id.
  var userType = await getUserType(req.body.id) // so we know what type of user we want to update

  if (!canEdit()) {
    res.status(StatusCodes.FORBIDDEN).json({
      msg: "You cannot edit this user's profile.",
    })
    return
  }

  if (userType == "therapist") {
    updateInfoTherapist(req, res, "therapist")
  } else if (userType == "accountant") {
    updateInfoPerson(req, res, "accountant")
  } else if (userType == "patient") {
    updateInfoPatient(req, res, "patient")
  } else if (userType == "guard") {
    updateInfoPerson(req, res, "guard")
  } else if (userType == "intern") {
    updateInfoPerson(req, res, "intern")
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

async function updateInfoTherapist(req: Request, res: Response, userType: String) {
  var EMPTY_FIELD = "null"
  var body = req.body // it must have a parameter named "data" that has the json structure of a therapist.
  var userId = req.body.id

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.therapist.findUnique({
    include: { person: true },
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
      extern: body.extern == EMPTY_FIELD ? oldData.extern : body.extern,
      admin: body.admin == EMPTY_FIELD ? oldData.admin : body.admin,
      cedula: body.cedula == EMPTY_FIELD ? oldData.cedula : body.cedula,
      person: {
        update: {
          active: body.active == EMPTY_FIELD ? oldData.person.active : body.active,
          address: body.address == EMPTY_FIELD ? oldData.person.address : body.address,
          name: body.name == EMPTY_FIELD ? oldData.person.name : body.name,
          email: body.email == EMPTY_FIELD ? oldData.person.email : body.email,
          aproved: body.aproved == EMPTY_FIELD ? oldData.person.aproved : body.aproved,
          birth_date: body.birth_date == EMPTY_FIELD ? oldData.person.birth_date : body.birth_date,
          password: body.password == EMPTY_FIELD ? oldData.person.password : body.password, // ISTO FAZ SEQUER SENTIDO?
          phone_number:
            body.phone_number == EMPTY_FIELD ? oldData.person.phone_number : body.phone_number,
        },
      },
    },
    where: { person_id: userId },
  })
}

async function updateInfoIntern(req: Request, res: Response, userType: String) {
  var EMPTY_FIELD = "null"
  var body = req.body // it must have a parameter named "data" that has the json structure of a therapist.
  var userId = req.body.id

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.intern.findUnique({
    include: { person: true },
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
          active: body.active == EMPTY_FIELD ? oldData.person.active : body.active,
          address: body.address == EMPTY_FIELD ? oldData.person.address : body.address,
          name: body.name == EMPTY_FIELD ? oldData.person.name : body.name,
          email: body.email == EMPTY_FIELD ? oldData.person.email : body.email,
          aproved: body.aproved == EMPTY_FIELD ? oldData.person.aproved : body.aproved,
          birth_date: body.birth_date == EMPTY_FIELD ? oldData.person.birth_date : body.birth_date,
          password: body.password == EMPTY_FIELD ? oldData.person.password : body.password, // ISTO FAZ SEQUER SENTIDO?
          phone_number:
            body.phone_number == EMPTY_FIELD ? oldData.person.phone_number : body.phone_number,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoGuard(req: Request, res: Response, userType: String) {
  var EMPTY_FIELD = "null"
  var body = req.body // it must have a parameter named "data" that has the json structure of a therapist.
  var userId = req.body.id

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.guard.findUnique({
    include: { person: true },
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
          active: body.active == EMPTY_FIELD ? oldData.person.active : body.active,
          address: body.address == EMPTY_FIELD ? oldData.person.address : body.address,
          name: body.name == EMPTY_FIELD ? oldData.person.name : body.name,
          email: body.email == EMPTY_FIELD ? oldData.person.email : body.email,
          aproved: body.aproved == EMPTY_FIELD ? oldData.person.aproved : body.aproved,
          birth_date: body.birth_date == EMPTY_FIELD ? oldData.person.birth_date : body.birth_date,
          password: body.password == EMPTY_FIELD ? oldData.person.password : body.password, // ISTO FAZ SEQUER SENTIDO?
          phone_number:
            body.phone_number == EMPTY_FIELD ? oldData.person.phone_number : body.phone_number,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoAccountant(req: Request, res: Response, userType: String) {
  var EMPTY_FIELD = "null"
  var body = req.body // it must have a parameter named "data" that has the json structure of a therapist.
  var userId = req.body.id

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.accountant.findUnique({
    include: { person: true },
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
          active: body.active == EMPTY_FIELD ? oldData.person.active : body.active,
          address: body.address == EMPTY_FIELD ? oldData.person.address : body.address,
          name: body.name == EMPTY_FIELD ? oldData.person.name : body.name,
          email: body.email == EMPTY_FIELD ? oldData.person.email : body.email,
          aproved: body.aproved == EMPTY_FIELD ? oldData.person.aproved : body.aproved,
          birth_date: body.birth_date == EMPTY_FIELD ? oldData.person.birth_date : body.birth_date,
          password: body.password == EMPTY_FIELD ? oldData.person.password : body.password, // ISTO FAZ SEQUER SENTIDO?
          phone_number:
            body.phone_number == EMPTY_FIELD ? oldData.person.phone_number : body.phone_number,
        },
      },
    },
    where: { person_id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

async function updateInfoPatient(req: Request, res: Response, userType: String) {
  var EMPTY_FIELD = "null"
  var body = req.body // it must have a parameter named "data" that has the json structure of a therapist.
  var userId = req.body.id

  // fetch the current record from the database -> needed for the update
  // also usefull to guarantee that the user actually exists and is a therapist
  var oldData = await prisma.patient.findUnique({
    include: {
      person: true,
      school: true,
      profession: true,
      patient_type: true,
    },
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
      tax_number: body.tax_number == EMPTY_FIELD ? oldData.tax_number : body.tax_number,
      health_number: body.health_number == EMPTY_FIELD ? oldData.health_number : body.health_number,
      request: body.request == EMPTY_FIELD ? oldData.request : body.request,
      remarks: body.remarks == EMPTY_FIELD ? oldData.remarks : body.remarks,
      patient_type: {
        update: {
          id: body.patienttype == EMPTY_FIELD ? oldData.patien_type_id : body.patienttype,
        },
      },
      person: {
        update: {
          active: body.active == EMPTY_FIELD ? oldData.person.active : body.active,
          address: body.address == EMPTY_FIELD ? oldData.person.address : body.address,
          name: body.name == EMPTY_FIELD ? oldData.person.name : body.name,
          email: body.email == EMPTY_FIELD ? oldData.person.email : body.email,
          aproved: body.aproved == EMPTY_FIELD ? oldData.person.aproved : body.aproved,
          birth_date: body.birth_date == EMPTY_FIELD ? oldData.person.birth_date : body.birth_date,
          password: body.password == EMPTY_FIELD ? oldData.person.password : body.password, // ISTO FAZ SEQUER SENTIDO?
          phone_number:
            body.phone_number == EMPTY_FIELD ? oldData.person.phone_number : body.phone_number,
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
      where: { id: oldData.school[0].id },
      data: {
        name: body.school_name == EMPTY_FIELD ? oldSchool.name : body.school_name,
        grade: body.school_grade == EMPTY_FIELD ? oldSchool.grade : body.school_grade,
      },
    })
  }

  // update profession info
  var oldProfession = await prisma.profession.findFirst({
    where: { patient_person_id: userId },
  })

  if (oldProfession) {
    prisma.profession.update({
      where: { id: oldData.profession[0].id },
      data: {
        name: body.profession_name == EMPTY_FIELD ? oldProfession.name : body.profession_name,
      },
    })
  }

  res.status(StatusCodes.OK).json({
    msg: "Success.",
  })
}

async function updateInfoPerson(req: Request, res: Response, userType: String) {
  /**
   * Use this one to update accountant, guard and intern.
   * They don't have parameters in the respective entity.
   */
  var EMPTY_FIELD = "null"
  var body = req.body // it must have a parameter named "data" that has the json structure of a therapist.
  var userId = req.body.id

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
      active: body.active == EMPTY_FIELD ? oldData.active : body.active,
      address: body.address == EMPTY_FIELD ? oldData.address : body.address,
      name: body.name == EMPTY_FIELD ? oldData.name : body.name,
      email: body.email == EMPTY_FIELD ? oldData.email : body.email,
      aproved: body.aproved == EMPTY_FIELD ? oldData.aproved : body.aproved,
      birth_date: body.birth_date == EMPTY_FIELD ? oldData.birth_date : body.birth_date,
      password: body.password == EMPTY_FIELD ? oldData.password : body.password, // ISTO FAZ SEQUER SENTIDO?
      phone_number: body.phone_number == EMPTY_FIELD ? oldData.phone_number : body.phone_number,
    },
    where: { id: userId },
  })

  res.status(StatusCodes.OK).json({
    msg: "Sucssess.",
  })
}

export default { getAllUsers, editUser, uploadAvatar }
