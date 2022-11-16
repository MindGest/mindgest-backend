import { Router, Request, Response } from 'express'
import { request } from 'http'
import controller from '../controllers/process.controller'
import middleware from '../middleware/api.middleware'
import schemas from '../utils/schemas'

const process = Router()

process.post(
    '/archive',
    middleware.requestValidator(schemas.ArchiveProcessSchema),
    controller.archive
)

process.get(
    '/info',
    middleware.requestValidator(schemas.ProcessInfoSchema),
    controller.info
)

export default process