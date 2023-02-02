import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { CreateLiableBody } from "../utils/types"

/**
 * Return all the prices from the table
 */

export async function listPrices(req: Request, res: Response) {
  try {
    // get the prices
    let prices = await prisma.pricetable.findMany()

    res.status(StatusCodes.OK).json({
      data: prices,
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default {
  listPrices,
}
