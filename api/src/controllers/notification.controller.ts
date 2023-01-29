import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import prisma from "../utils/prisma"
import { NotificationFilterType } from "../utils/schemas"
import {
  MarkNotificationQueryParams,
  NotificationBody,
  NotificationListQueryParams,
} from "../utils/types"

export async function mark(req: Request<MarkNotificationQueryParams>, res: Response) {
  const { id, role, admin } = res.locals.token
  try {
    const notification_id = Number(req.params.id)
    const notification = await prisma.notifications.findFirst({
      where: { person_id: id, id: notification_id },
    })
    if (notification !== null) {
      await prisma.notifications.update({
        where: { id: notification_id },
        data: {
          seen: !notification.seen,
        },
      })
      return res.status(StatusCodes.OK).json({
        message: "Notification status updated successfully",
      })
    }
    res.status(StatusCodes.NOT_FOUND).json({
      message: `Notification ${notification_id} not found for user ${id}`,
    })
  } catch (error) {
    res.send(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function list(req: Request<{}, {}, {}, NotificationListQueryParams>, res: Response) {
  const { id, role, admin } = res.locals.token
  try {
    if (req.query.filter) {

      let info = await prisma.notifications.findMany({
        where: { person_id: id, seen: req.query.filter === NotificationFilterType.READ },
        select:{
          title: true,
          body: true,
          seen: true
        }
      })

      return res.status(StatusCodes.OK).json({
        message: `Successfully retrieve all ${req.query.filter} notifications.`,
        info: info
      })
    } else {
      let info = await prisma.notifications.findMany({
        where: { person_id: id },
        select:{
          title: true,
          body: true,
          seen: true
        }
      })

      console.log(info)

      return res.status(StatusCodes.OK).json({
        message: "Successfully retrieved all notifications",
        info: info,
      })
    }
  } catch (error) {
    res.send(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export async function create(req: Request<{}, {}, NotificationBody>, res: Response) {
  const { id, role, admin } = res.locals.token
  try {
    await prisma.notifications.create({
      data: {
        title: req.body.title,
        body: req.body.body,
        person_id: id,
      },
    })
    res.send(StatusCodes.OK).json({
      message: `Notification created successfully.`,
    })
  } catch (error) {
    res.send(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Ups... Something went wrong",
    })
  }
}

export default { mark, list, create }
