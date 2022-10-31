import { person } from "@prisma/client";
import * as jwt from 'jsonwebtoken'
import * as express from 'express'

export function createJWT(payload:any){
  const token = jwt.sign(payload, process.env.JWT_SECRET as string);
  return token;
};

export function isTokenValid(token:string){
  return jwt.verify(token, process.env.JWT_SECRET as string)
}

export function attachCookiesToResponse(res:express.Response, person:person, refreshToken:string){
  const accessTokenJWT = createJWT({ payload: { person } });
  const refreshTokenJWT = createJWT({ payload: { person, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};