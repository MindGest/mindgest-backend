import { patienttype, person, prisma, refreshtoken } from "@prisma/client"
import { StatusCodes } from 'http-status-codes'
import { createTokenUser } from '../utils/permissions/createToken.js'
import { hashString } from '../utils/permissions/createHash.js'
import { attachCookiesToResponse } from '../utils/permissions/jwt.js'
import * as crypto from 'crypto'
import {Errors} from "typescript-rest"
import { IGetPersonAuthInfoRequest, GetPayloadAuthInfoRequest } from "../utils/requestDefinitions.js"
import * as express from 'express'
import { PrismaClient } from '@prisma/client'
import log from '../utils/logger.js'


export async function register(req:IGetPersonAuthInfoRequest, res:express.Response){
    const body = req.body;
    const prisma = new PrismaClient()

    const emailAlreadyExists = await prisma.person.findFirst({
        where:{
            email: body.email 
        } 
    });
    if (emailAlreadyExists) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'User type doesnt exist!',
      })
      return
    }
    const verificationToken = crypto.randomBytes(40).toString('hex');

    if(body.type == 'accountant'){
        const accountant = await prisma.accountant.create({
            data :{
                person: {
                    create:{
                            active: true, 
                            address: body.address,
                            name: body.name,
                            email: body.email,
                            aproved: true, //mudar para false
                            birth_date: body.birth_date,
                            password: body.password,
                            phone_number: body.phone_number,
                    }
                }
            }
        })
    }
    else if(body.type == 'guard'){
        const guard = await prisma.guard.create({
            data :{
                person: {
                    create:{
                            active: true, 
                            address: body.address,
                            name: body.name,
                            email: body.email,
                            aproved: true, //mudar para false
                            birth_date: body.birth_date,
                            password: body.password,
                            phone_number: body.phone_number,
                    }
                }
            }
        })
    }
    else if (body.type == 'intern'){
        const intern = await prisma.intern.create({
            data :{
                person: {
                    create:{
                            active: true, 
                            address: body.address,
                            name: body.name,
                            email: body.email,
                            aproved: true, //mudar para false
                            birth_date: body.birth_date,
                            password: body.password,
                            phone_number: body.phone_number,
                    }
                }
            }
        })
    }
    else if(body.type == 'patient'){
        const patient = await prisma.patient.create({
            data :{
                tax_number: body.tax_number,
                health_number: body.health_number,
                request: body.request,
                remarks: body.remarks,
                patienttype: {
                    connect:{
                        id: body.patienttype
                    }
                },
                school: {
                    connect:{
                        id: body.school
                    }
                },
                profession:{
                    connect:{
                        id: body.profession
                    }
                },
                person: {
                    create:{
                            active: true, 
                            address: body.address,
                            name: body.name,
                            email: body.email,
                            aproved: true, //mudar para false
                            birth_date: body.birth_date,
                            password: body.password,
                            phone_number: body.phone_number,
                    }
                }
            }
        })
    }
    else if(body.type == 'therapist'){
        const therapist = await prisma.therapist.create({
            data :{
                extern : body.extern,
                admin: body.admin,
                cedula: body.cedula,
                person: {
                    create:{
                            active: true, 
                            address: body.address,
                            name: body.name,
                            email: body.email,
                            aproved: true, //mudar para false
                            birth_date: body.birth_date,
                            password: body.password,
                            phone_number: body.phone_number,
                    }
                }
            }
        })
    }
    else{
      res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'User type doesnt exist!',
      })
      return
    }
  // const origin = 'http://localhost:3000';
  // const newOrigin = 'https://react-node-user-workflow-front-end.netlify.app';

  // const tempOrigin = req.get('origin');
  // const protocol = req.protocol;
  // const host = req.get('host');
  // const forwardedHost = req.get('x-forwarded-host');
  // const forwardedProtocol = req.get('x-forwarded-proto');

  /*await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  }); */
  // send verification token back only while testing in postman!!!
  res.status(StatusCodes.CREATED).json({
    msg: 'Success!',
  })
};

/*const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
};*/

export async function login(req:IGetPersonAuthInfoRequest, res:express.Response){
  const { email, password } = req.body
  const prisma = new PrismaClient()

  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'Please provide email and password!',
    })
  }
  const user = await prisma.person.findFirst(
    {
      where: {
        email: email
      }
    }
  );

  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Invalid credentials USER!',
    })
    return
  }

  if (password != user.password) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Invalid credentials Password!',
    })
    return
  }
  if (!user.aproved) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: 'Unauthorized user',
    })
    return
  }
  const tokenUser = await createTokenUser(user)

  // create refresh token
  let refreshToken = ''
  // check for existing token
  const existingToken = await prisma.refreshtoken.findFirst({ 
    where: {
      person_id: user.id
    }
  });

  if (existingToken) {
    const { isvalid } = existingToken;
    if (!isvalid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        msg: 'Invalid credentials! NOT VALID',
      })
      return
    }
    refreshToken = existingToken.refreshtoken
    attachCookiesToResponse(res,tokenUser, refreshToken )
    res.status(StatusCodes.OK).json({ user: tokenUser })
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip

  await prisma.refreshtoken.create({
    data: {
      refreshtoken: refreshToken,
      ip:ip,
      useragent: userAgent,
      isvalid: true,
      person:{
        connect:{
          id: user.id
        }
      }
    } 
  });

  attachCookiesToResponse(res, tokenUser, refreshToken);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

export async function logout(req:IGetPersonAuthInfoRequest, res:express.Response){
  const prisma = new PrismaClient()
  conawait prisma.refreshtoken.delete({
    where: {
      person: 
    }
  })
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

/*const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    // send email
    const origin = 'http://localhost:3000';
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' });
};
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.send('reset password');
};*/
