import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import logger from "../utils/logger"
import assert from "assert"
import { buildReceipt } from "../services/receipt.service"

import { ReceiptFilterQuery } from "../utils/types"
import { User } from "../utils/schemas"

export async function pay(req: Request, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(`PAY [user-id: ${id}] => Authorization to pay/regress receipt payment granted...`)

  if (!admin && role !== User.ACCOUNTANT) {
    logger.info(
      `RECEIPT [user-id: ${id}] => Authorization to pay receipt revoked (insufficient permissions)`
    )
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Receipt Payment Failed (insufficient permissions)",
    })
  }

  try {
    logger.debug(`PAY [user-id: ${id}] => Updating the receipt status...`)

    // Pay / Regress Debt
    const receiptRef = Number(req.params.receiptId)
    let receipt = await prisma.receipt.findUnique({
      where: { id: receiptRef },
    })
    await prisma.receipt.update({
      data: { payed: !receipt?.payed },
      where: { id: receiptRef },
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

export async function info(req: Request<{ receiptId: string }>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  const receiptId = Number(req.params.receiptId)

  // Fetch Receipt
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
  })

  // Check If It Exists
  if (receipt === null || receipt === undefined) {
    logger.info(`RECEIPT [user-id: ${id}] => The receipt does not exist.`)
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `Receipt with id '${receipt} does not exist...`,
    })
  }

  try {
    let appointment_process = await prisma.appointment_process.findFirst({
      where: { appointment_slot_id: receipt.appointment_slot_id },
    })
    if (!appointment_process) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "It seems that the process and appointment do not exist.",
      })
    }
    let processId = appointment_process.process_id
    // Check Permissions (Admin access is always granted)
    if (!admin && role !== User.ACCOUNTANT) {
      let access = false
      if (role == User.THERAPIST) {
        // Grant access if therapist belongs to the process
        const process = await prisma.therapist_process.findUnique({
          where: {
            therapist_person_id_process_id: {
              therapist_person_id: id,
              process_id: processId,
            },
          },
        })
        if (process !== null && process !== undefined) {
          access = true
        }
      } else if (role === User.INTERN) {
        // Grant access if intern belongs to the current process and has `archive` permissions.
        const process = await prisma.intern_process.findUnique({
          where: {
            intern_person_id_process_id: {
              intern_person_id: id,
              process_id: processId,
            },
          },
        })
        const permissions = await prisma.permissions.findUnique({
          where: { id: id },
        })
        assert(permissions !== null)
        if (process !== null && process !== undefined && permissions.see) {
          access = true
        }
      }

      // Grant Access
      if (!access) {
        logger.info(
          `RECEIPT [user-id: ${id}] => Authorization to fetch receipts revoked (insufficient permissions)`
        )
        return res.status(StatusCodes.FORBIDDEN).json({
          message: "Receipt Listing Failed (insufficient permissions)",
        })
      }
    }
    // get receipt info
    let receiptInfo = await buildReceipt(Number(receipt.appointment_slot_id))

    res.status(StatusCodes.OK).json({
      data: receiptInfo,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  const receiptId = Number(req.params.receiptId)
  try {
    // if guard, do not allow
    if (role == User.GUARD) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "You do not have access to this information.",
      })
    }
    // get all receipts
    let receipts = await prisma.receipt.findMany()
    let receiptsInfo = []
    for (let receipt of receipts) {
      // verify that this information can be accessed
      let appointment_process = await prisma.appointment_process.findFirst({
        where: { appointment_slot_id: receipt.appointment_slot_id },
      })
      if (!appointment_process) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "It seems that the process and appointment do not exist.",
        })
      }
      let processId = appointment_process.process_id
      // Check Permissions (Admin access is always granted)
      if (!admin && role !== User.ACCOUNTANT) {
        let access = false
        if (role == User.THERAPIST) {
          // Grant access if therapist belongs to the process
          const process = await prisma.therapist_process.findUnique({
            where: {
              therapist_person_id_process_id: {
                therapist_person_id: id,
                process_id: processId,
              },
            },
          })
          if (process !== null && process !== undefined) {
            access = true
          }
        } else if (role === User.INTERN) {
          // Grant access if intern belongs to the current process and has `archive` permissions.
          const process = await prisma.intern_process.findUnique({
            where: {
              intern_person_id_process_id: {
                intern_person_id: id,
                process_id: processId,
              },
            },
          })
          const permissions = await prisma.permissions.findUnique({
            where: { id: id },
          })
          assert(permissions !== null)
          if (process !== null && process !== undefined && permissions.see) {
            access = true
          }
        }

        // Grant Access
        if (!access) {
          continue
        }
      }
      receiptsInfo.push(await buildReceipt(Number(receipt.appointment_slot_id)))
    }
    res.status(StatusCodes.OK).json({
      message: "Receipt List Retrieved Successfully!",
      data: receiptsInfo,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  pay,
  info,
  list,
}
