import * as express from 'express'
import { PrismaClient } from '@prisma/client'

// export async function authenticateUser(
//     req: express.Request,
//     res: express.Response,
//     next: Function
// ) {
//     const { refreshToken, accessToken } = req.signedCookies
//
//     try {
//         if (accessToken) {
//             const payload = isTokenValid(accessToken)
//             // req.person = payload.person
//             return next()
//         }
//         const payload = isTokenValid(refreshToken)
//         const prisma = new PrismaClient()
//
//         const existingToken = await prisma.refreshtoken.findFirst({
//             where: {
//                 person_id: payload.person.id,
//                 refreshtoken: payload.refreshToken,
//             },
//         })
//
//         if (!existingToken || !existingToken?.isvalid) {
//             throw new Error('Authentication Invalid')
//         }
//
//         attachCookiesToResponse(res, payload.user, existingToken.refreshtoken)
//
//         req.person = payload.user
//         next()
//     } catch (error) {
//         throw new Error('Authentication Invalid')
//     }
// }

/*export function authorizePermissions(...roles:any){
  return (req:express.Request, res:express.Response, next:Function) => {
    if (!roles.includes(req.user.role)) {
      throw new Errors.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
    next();
  };
};*/
