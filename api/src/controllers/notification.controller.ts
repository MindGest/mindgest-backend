import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import assert from "assert"

import prisma from "../utils/prisma"
import { NotificationFilterType } from "../utils/schemas"
import {
  MarkNotificationQueryParams,
  NotificationBody,
  NotificationListQueryParams,
} from "../utils/types"

import logger from "../utils/logger"
import { randomUUID } from "crypto"
import notification from "../routes/notification.route"

export async function mark(req: Request<MarkNotificationQueryParams>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(
    `MARK NOTIFICATION [user-id: ${id}] => Authorization to change notification status granted...`
  )

  try {
    // Fetch Notification
    logger.debug(`MARK NOTIFICATION [user-id: ${id}] => Fetching Notification...`)
    const notification_id = Number(req.params.id)
    const notification = await prisma.notifications.findFirst({
      where: { person_id: id, id: notification_id },
    })

    if (notification !== null) {
      // Update Notification
      logger.debug(
        `MARK NOTIFICATION [notification: ${notification_id}] => Notification found. Updating...`
      )

      let not = await prisma.notifications.update({
        where: { id: notification_id },
        data: {
          seen: !notification.seen,
        },
      })

      logger.info(
        `MARK NOTIFICATION [notification: ${notification_id}, seen: ${not.seen}] => Status changed successfully!`
      )
      return res.status(StatusCodes.OK).json({
        message: "Notification status updated successfully",
      })
    }

    logger.debug(`MARK NOTIFICATION [notification: ${notification_id}] => Notification not found.`)
    res.status(StatusCodes.NOT_FOUND).json({
      message: `Notification "${notification_id}" not found for user "${id}"`,
    })
  } catch (error) {
    logger.error(`MARK NOTIFICATION => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function settle(req: Request, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(
    `SETTLE [user-id: ${id}] => Authorization to settle request (notification) granted...`
  )

  try {
    // Fetch Notification
    logger.debug(`SETTLE [user-id: ${id}] => Fetching Requests (notifications)...`)
    const notification_id = Number(req.params.id)
    const notification = await prisma.notifications.findFirst({
      where: { person_id: id, id: notification_id },
    })

    if (notification !== null) {
      logger.debug(
        `SETTLE [request: ${notification_id}] => Request (notification) found. Settling...`
      )

      await prisma.notifications.updateMany({
        where: { ref: notification.ref },
        data: { settled: true },
      })

      logger.info(`SETTLE [request: ${notification_id}] => Request Settled!`)
      return res.status(StatusCodes.OK).json({
        message: "Request (notification) was settled successfully",
      })
    }

    logger.debug(`SETTLE [request: ${notification_id}] => Request (notification) not found.`)
    res.status(StatusCodes.NOT_FOUND).json({
      message: `Request (notification) "${notification_id}" not found for user "${id}"`,
    })
  } catch (error) {
    logger.error(`SETTLE => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request<{}, {}, {}, NotificationListQueryParams>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(`NOTIFICATIONS [user-id: ${id}] => Authorization to list notifications granted...`)
  try {
    // Applying Filter
    if (req.query.filter) {
      logger.debug(`NOTIFICATIONS [user-id: ${id}] => Applying Filter (${req.query.filter})...`)

      // Filtered List
      let list = await prisma.notifications.findMany({
        where: { person_id: id, seen: req.query.filter === NotificationFilterType.READ },
      })

      // Send Notification List (filtered)
      res.status(StatusCodes.OK).json({
        message: `Successfully retrieve all ${req.query.filter} notifications.`,
        data: list,
      })
    } else {
      // Send Notification List
      return res.status(StatusCodes.OK).json({
        message: "Successfully retrieved all notifications",
        data: await prisma.notifications.findMany(),
      })
    }
    logger.info(`NOTIFICATIONS [user-id: ${id}] => Successfully retrieved notifications!`)
  } catch (error) {
    logger.error(`LIST NOTIFICATIONS => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function create(req: Request<{}, {}, NotificationBody>, res: Response) {
  // Authorizing User
  const { id, role, admin } = res.locals.token
  logger.info(`NOTIFICATION [user-id: ${id}] => Authorization to post notifications granted...`)

  try {
    // Generate Notifications (Admin Users)
    logger.info(`NOTIFICATION [user-id: ${id}] => Generating notifications...`)

    // Generate Unique Reference For Notification
    let uuid = randomUUID()

    for (let admin of await prisma.admin.findMany()) {
      logger.debug(`-> Generating notification for admin user ${admin.person_id}`)
      await prisma.notifications.create({
        data: {
          person: { connect: { id: admin.person_id } },
          data: req.body.data,
          type: req.body.type,
          settled: false,
          seen: false,
          ref: uuid,
        },
      })
    }
    logger.info(`NOTIFICATION [user-id: ${id}] => Notifications generated successfully!`)
    res.status(StatusCodes.OK).json({
      message: `Notifications generated successfully.`,
    })
  } catch (error) {
    logger.error(`NOTIFICATION => Server Error: ${error}`)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default { mark, list, create, settle }
