import { person } from "@prisma/client";
import * as express from "express"
import { JwtPayload } from "jsonwebtoken";


//Class that extends Request so typescript lets us use req.person
export interface IGetPersonAuthInfoRequest extends express.Request {
    person: person 
}

export interface GetPayloadAuthInfoRequest extends JwtPayload{
    person: person
    refreshToken: string
}