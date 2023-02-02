import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import logger from "../utils/logger"

import { ReceiptFilterQuery } from "../utils/types"
import { User } from "../utils/schemas"

export async function pay(req: Request, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(`PAY [user-id: ${id}] => Authorization to pay/regress receipt payment granted...`)

  if (!admin || role !== User.ACCOUNTANT) {
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

export async function info(req: Request, res: Response) {
  try {
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  pay,
  info,
}
