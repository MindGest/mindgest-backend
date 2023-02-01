import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import logger from "../utils/logger"

import { ReceiptFilterQuery } from "../utils/types"

export async function create(req: Request, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(`RECEIPT [user-id: ${id}] => Authorization to create receipt granted...`)
  try {
    const appointmentId = parseInt(req.params.appointmentId)

    // Create Receipt
    logger.debug(`RECEIPT [user-id: ${id}] => Generating Receipt...`)
    await prisma.receipt.create({
      data: { appointment_slot_id: appointmentId },
    })

    logger.debug(`RECEIPT [user-id: ${id}] => Receipt Created Successfully...`)
    res.status(StatusCodes.OK).json({
      message: "Receipt Created Successfully",
    })
  } catch (error) {
    logger.error(`RECEIPT => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function pay(req: Request, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(`PAY [user-id: ${id}] => Authorization to pay/regress receipt payment granted...`)
  try {
    logger.debug(`PAY [user-id: ${id}] => Updating the receipt status...`)

    // Pay / Regress Debt
    const receiptRef = req.params.receiptId
    let receipt = await prisma.receipt.findUnique({
      where: { ref: receiptRef },
    })
    await prisma.receipt.update({
      data: { payed: !receipt?.payed },
      where: { ref: receiptRef },
    })

    logger.info(`PAY [user-id: ${id}] => Receipt Updated Successfully`)
    return res.status(StatusCodes.OK).json({
      message: "Receipt Payed!",
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

// TODO: Hello
export async function list(req: Request<{}, {}, {}, ReceiptFilterQuery>, res: Response) {
  //   try {
  //     var queryParams = req.query
  //
  //     var payed = true
  //     var notPayed = true
  //     if (queryParams.payed != null) {
  //       payed = queryParams.payed === "true"
  //     }
  //     if (queryParams.notPayed != null) {
  //       notPayed = queryParams.notPayed === "true"
  //     }
  //
  //     if ((payed == notPayed) == false) {
  //       return res.status(StatusCodes.OK).json({
  //         message: [],
  //       })
  //     }
  //
  //     var listOfReceipts = []
  //
  //     if (queryParams.userId == null) {
  //       var listReceipts: receipt[] = []
  //
  //       if ((payed == notPayed) == true) {
  //         listReceipts = await prisma.receipt.findMany()
  //       } else if (payed == true) {
  //         listReceipts = await prisma.receipt.findMany({
  //           where: {
  //             payed: true,
  //           },
  //         })
  //       } else if (notPayed == true) {
  //         listReceipts = await prisma.receipt.findMany({
  //           where: {
  //             payed: false,
  //           },
  //         })
  //       }
  //
  //       for (let receipt of listReceipts) {
  //         var appointment = await prisma.appointment.findUnique({
  //           where: {
  //             slot_id: receipt.appointment_slot_id,
  //           },
  //         })
  //
  //         var appointment_process = await prisma.appointment_process.findFirst({
  //           where: {
  //             appointment_slot_id: appointment?.slot_id,
  //           },
  //         })
  //
  //         var process = await prisma.process.findUnique({
  //           where: {
  //             id: appointment_process?.process_id,
  //           },
  //         })
  //
  //         var patientProcess = await prisma.patient_process.findFirst({
  //           where: {
  //             process_id: process?.id,
  //           },
  //         })
  //
  //         var patient = await prisma.person.findUnique({
  //           where: {
  //             id: patientProcess?.patient_person_id,
  //           },
  //         })
  //
  //         var therapists = await prisma.therapist_process.findMany({
  //           where: {
  //             process_id: process?.id,
  //           },
  //         })
  //
  //         var flag = false
  //         var mainTherapist
  //         for (let therapist of therapists) {
  //           if (flag == false) {
  //             var permissions = await prisma.permissions.findFirst({
  //               where: {
  //                 person_id: therapist.therapist_person_id,
  //                 process_id: process?.id,
  //               },
  //             })
  //
  //             if (permissions?.isMain) {
  //               mainTherapist = therapist.therapist_person_id
  //             }
  //           }
  //         }
  //
  //         var mainTherapistObject = await prisma.person.findUnique({
  //           where: {
  //             id: mainTherapist,
  //           },
  //         })
  //
  //         var moreInfoPatient = await prisma.patient.findFirst({
  //           where: {
  //             person_id: patient?.id,
  //           },
  //         })
  //
  //         console.log(appointment)
  //         let dateParsed = new Date(appointment!.slot_end_date)
  //         const currentTime = new Date()
  //
  //         let isDone = ""
  //
  //         if (currentTime.getTime() > dateParsed.getTime()) {
  //           isDone = "Concluída"
  //         } else {
  //           isDone = "Não Concluída"
  //         }
  //
  //         let price = await prisma.pricetable.findFirst({
  //           where: {
  //             id: appointment?.pricetable_id,
  //           },
  //         })
  //
  //         let date = receipt?.datetime
  //         const formattedDate = date.toLocaleDateString("en-GB", {
  //           day: "2-digit",
  //           month: "2-digit",
  //           year: "numeric",
  //         })
  //
  //         listOfReceipts.push({
  //           patientName: patient?.name,
  //           therapistListing: mainTherapistObject?.name,
  //           appointmentCode: receipt?.ref,
  //           appointmentDate: formattedDate,
  //           //nif: patient?.tax_number,
  //           //sns: moreInfoPatient?.health_number,
  //           //address: patient?.address,
  //           //email: patient?.email,
  //           //state: isDone,
  //           //cost: price?.price,
  //           paid: receipt.payed,
  //         })
  //       }
  //     } else {
  //       var userId = parseInt(queryParams.userId)
  //       var processId = await prisma.patient_process.findFirst({
  //         where: {
  //           patient_person_id: userId,
  //         },
  //       })
  //
  //       var appointments = await prisma.appointment_process.findMany({
  //         where: {
  //           process_id: processId?.process_id,
  //         },
  //       })
  //
  //       for (let appointment of appointments) {
  //         var appointmentInfo = await prisma.appointment.findUnique({
  //           where: {
  //             slot_id: appointment.appointment_slot_id,
  //           },
  //         })
  //
  //         var receipt = await prisma.receipt.findFirst({
  //           where: {
  //             appointment_slot_id: appointmentInfo?.slot_id,
  //           },
  //         })
  //
  //         var process = await prisma.process.findUnique({
  //           where: {
  //             id: appointment?.process_id,
  //           },
  //         })
  //
  //         var patientProcess = await prisma.patient_process.findFirst({
  //           where: {
  //             process_id: process?.id,
  //           },
  //         })
  //
  //         var patient = await prisma.person.findUnique({
  //           where: {
  //             id: patientProcess?.patient_person_id,
  //           },
  //         })
  //
  //         var therapists = await prisma.therapist_process.findMany({
  //           where: {
  //             process_id: process?.id,
  //           },
  //         })
  //
  //         var flag = false
  //         var mainTherapist
  //         for (let therapist of therapists) {
  //           var person = await prisma.person.findUnique({
  //             where: {
  //               id: therapist.therapist_person_id,
  //             },
  //           })
  //           if (flag == false) {
  //             var permissions = await prisma.permissions.findFirst({
  //               where: {
  //                 person_id: therapist.therapist_person_id,
  //                 process_id: process?.id,
  //               },
  //             })
  //
  //             if (permissions?.isMain) {
  //               mainTherapist = therapist.therapist_person_id
  //             }
  //           }
  //         }
  //
  //         var mainTherapistObject = await prisma.person.findUnique({
  //           where: {
  //             id: mainTherapist,
  //           },
  //         })
  //
  //         var moreInfoPatient = await prisma.patient.findFirst({
  //           where: {
  //             person_id: patient?.id,
  //           },
  //         })
  //
  //         let dateParsed = new Date(appointmentInfo!.slot_end_date)
  //         const currentTime = new Date()
  //
  //         let isDone = ""
  //         if (currentTime.getTime() > dateParsed.getTime()) {
  //           isDone = "Concluída"
  //         } else {
  //           isDone = "Não Concluída"
  //         }
  //         let price = await prisma.pricetable.findFirst({
  //           where: {
  //             id: appointmentInfo?.pricetable_id,
  //           },
  //         })
  //
  //         if (
  //           (payed == notPayed) == true ||
  //           (payed == true && receipt?.payed) ||
  //           (notPayed == true && !receipt?.payed)
  //         ) {
  //           listOfReceipts.push({
  //             patientName: patient?.name,
  //             mainTherapist: mainTherapistObject?.name,
  //             ref: receipt?.ref,
  //             date: receipt?.datetime,
  //             nif: patient?.tax_number,
  //             sns: moreInfoPatient?.health_number,
  //             morada: patient?.address,
  //             email: patient?.email,
  //             estado: isDone,
  //             custo: price?.price,
  //             pago: receipt?.payed,
  //           })
  //         }
  //       }
  //     }
  //     return res.status(StatusCodes.OK).json({
  //       message: listOfReceipts,
  //     })
  //   } catch (error) {
  //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //       message: "Ups... Something went wrong",
  //     })
  //   }
}

export async function info(req: Request, res: Response) {
  try {
    var receiptId = req.params.processId

    var receipt = await prisma.receipt.findFirst({
      where: {
        ref: receiptId,
      },
    })
    var appointment = await prisma.appointment.findUnique({
      where: {
        slot_id: receipt?.appointment_slot_id,
      },
    })

    var appointment_process = await prisma.appointment_process.findFirst({
      where: {
        appointment_slot_id: appointment?.slot_id,
      },
    })

    var process = await prisma.process.findUnique({
      where: {
        id: appointment_process?.process_id,
      },
    })

    var patientProcess = await prisma.patient_process.findFirst({
      where: {
        process_id: process?.id,
      },
    })

    var patient = await prisma.person.findUnique({
      where: {
        id: patientProcess?.patient_person_id,
      },
    })

    var therapists = await prisma.therapist_process.findMany({
      where: {
        process_id: process?.id,
      },
    })

    var flag = false
    var mainTherapist
    for (let therapist of therapists) {
      if (flag == false) {
        var permissions = await prisma.permissions.findFirst({
          where: {
            person_id: therapist.therapist_person_id,
            process_id: process?.id,
          },
        })

        if (permissions?.isMain) {
          mainTherapist = therapist.therapist_person_id
        }
      }
    }

    var mainTherapistObject = await prisma.person.findUnique({
      where: {
        id: mainTherapist,
      },
    })

    var moreInfoPatient = await prisma.patient.findFirst({
      where: {
        person_id: patient?.id,
      },
    })

    let dateParsed = new Date(appointment!.slot_end_date)
    const currentTime = new Date()

    let isDone = ""

    if (currentTime.getTime() > dateParsed.getTime()) {
      isDone = "Concluída"
    } else {
      isDone = "Não Concluída"
    }

    let price = await prisma.pricetable.findFirst({
      where: {
        id: appointment?.pricetable_id,
      },
    })

    let date = receipt?.datetime
    const formattedDate = date?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    res.status(StatusCodes.OK).json({
      name: patient?.name,
      tax_number: patient?.tax_number,
      sns: moreInfoPatient?.health_number,
      address: patient?.address,
      email: patient?.email,
      custo: price?.price,
      paid: receipt?.payed,
      responsavel: mainTherapistObject?.name,
      data: formattedDate,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function listProcess(req: Request, res: Response) {
  var processId = parseInt(req.params.processId)
  var decoded = res.locals.token

  let appointmentsProcess = await prisma.appointment_process.findMany({
    where: {
      process_id: processId,
    },
  })

  var info = []
  for (let appointmentId of appointmentsProcess) {
    let receiptAppointment = await prisma.receipt.findFirst({
      where: {
        appointment_slot_id: appointmentId.appointment_slot_id,
      },
    })

    if (receiptAppointment != null) {
      let date = receiptAppointment!.datetime
      let formattedDate = date?.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      if (decoded.role == "admin") {
        info.push({
          id: receiptAppointment.id,
          ref: receiptAppointment.ref,
          date: formattedDate,
          paid: receiptAppointment.payed,
          appointmentId: receiptAppointment.appointment_slot_id,
        })
      } else {
        info.push({
          id: receiptAppointment.id,
          date: formattedDate,
          paid: receiptAppointment.payed,
          appointmentId: receiptAppointment.appointment_slot_id,
        })
      }
    }
  }

  return res.status(StatusCodes.OK).json({
    message: info,
  })
}

export default {
  list,
  create,
  pay,
  info,
  listProcess,
}
