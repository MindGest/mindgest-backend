import {Errors} from "typescript-rest"
import { isTokenValid } from '../utils/permissions/jwt.js'
import * as express from 'express'
import { IGetPersonAuthInfoRequest, GetPayloadAuthInfoRequest } from "../utils/requestDefinitions.js"

//Function for authentication, checks header and cookies to see if user is alreadu authenticado, else will authenticate
export async function authenticateUser(req:IGetPersonAuthInfoRequest, res:express.Response, next:Function){
  let token;
  // check header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1];
  }
  // check cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new Errors.UnauthorizedError('Authentication invalid');
  }
  try {
    const payload = isTokenValid(token) as GetPayloadAuthInfoRequest;

    // Attach the user and his permissions to the req object
    req.user = {
      userId: payload.user.userId,
      role: payload.user.role,
    };

    next();
  } catch (error) {
    throw new Errors.UnauthorizedError('Authentication invalid');
  }
};

/*const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};*/
