import prisma from "../utils/prisma"

import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

import { CreateLiableBody } from "../utils/types"

/**
 * Create liable
 */
export async function createLiable(req: Request<{}, {}, CreateLiableBody>, res: Response){
    /**
     * Allow admins,
     * Allow therapists,
     * Allow interns,
     */
    try{
        var decodedToken = res.locals.token

        // otbain the caller properties
        var callerId = decodedToken.id
        var callerRole = decodedToken.role
        var callerIsAdmin = decodedToken.admin

        // check authorization 
        if (callerRole == "acountant" && callerRole == "guard"){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "You do not have permission to access this information."
            })
        }

        // create the liable
        await prisma.liable.create({
            data: {
                type: req.body.type,
                name: req.body.name,
                email: req.body.email,
                remarks: req.body.remarks,
                phonenumber: req.body.phoneNumber,
            }
         })

         res.status(StatusCodes.OK).json({
            message: "The liable has been successfully created."
         })
    }
    catch (error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Ups... Something went wrong",
          })
    }
}

/**
 * Liable info
 */
export async function infoLiable(req: Request<{liableId: string}, {}, {}>, res: Response){
    try{
        var decodedToken = res.locals.token

        // otbain the caller properties
        var callerId = decodedToken.id
        var callerRole = decodedToken.role
        var callerIsAdmin = decodedToken.admin

        // check authorization 
        if (callerRole == "acountant" && callerRole == "guard"){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "You do not have permission to access this information."
            })
        }

        // get liable (care taker)
        let liable = await prisma.liable.findFirst({where: {id: parseInt(req.params.liableId)}});

        res.status(StatusCodes.OK).json({
            data: {
                type: liable?.type,
                name: liable?.name,
                email: liable?.email,
                remarks: liable?.remarks,
                phoneNumber: liable?.phonenumber,
            },
        })

    }
    catch (error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Ups... Something went wrong",
          })
    }
}

/**
 * List liables
 */
export async function listLiables(req: Request, res: Response){
    try{
        var decodedToken = res.locals.token

        // otbain the caller properties
        var callerId = decodedToken.id
        var callerRole = decodedToken.role
        var callerIsAdmin = decodedToken.admin

        // check authorization 
        if (callerRole == "acountant" && callerRole == "guard"){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "You do not have permission to access this information."
            })
        }

        // get all the liables
        let liables = await prisma.liable.findMany();
        let infoToReturn = [];
        for (let liable of liables){
            infoToReturn.push({
                type: liable?.type,
                name: liable?.name,
                email: liable?.email,
                remarks: liable?.remarks,
                phoneNumber: liable?.phonenumber,
            })
        }

        res.status(StatusCodes.OK).json({
            data: infoToReturn,
        })
    }
    catch (error){
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Ups... Something went wrong",
          })
    }
}

export default {
    createLiable,
    listLiables,
    infoLiable,
}
