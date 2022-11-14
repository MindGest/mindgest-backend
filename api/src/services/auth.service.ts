import prisma from '../utils/prisma'
import jwt from 'jsonwebtoken'
import { access } from 'fs'

import type { Response } from 'express'
import logger from '../utils/logger'

// Environment Variables
const JWT_ACCESS_SECRET = String(process.env.JWT_ACCESS_SECRET)
const JWT_REFRESH_SECRET = String(process.env.JWT_REFRESH_SECRET)
const JWT_UTIL_SECRET = String(process.env.JWT_UTIL_SECRET)

const NODE_ENV = String(process.env.NODE_ENV)

export function createAccessToken(payload: Object) {
    return signJWT(payload, JWT_ACCESS_SECRET, {
        expiresIn: '15m',
    })
}

export function createRefreshToken(payload: Object) {
    const refreshToken = signJWT({ ...payload }, JWT_REFRESH_SECRET, {
        expiresIn: '1h',
    })
    return refreshToken
}

export function createToken(payload: Object) {
    const token = signJWT({ ...payload }, JWT_UTIL_SECRET, {
        expiresIn: '1h',
    })
    return token 
}

export function verifyAccessToken<T>(token: string): T | null {
    return verifyJWT<T>(token, JWT_ACCESS_SECRET)
}

export function verifyRefreshToken<T>(token: string): T | null {
    return verifyJWT<T>(token, JWT_REFRESH_SECRET)
}


export function verifyToken<T>(token: string): T | null {
    return verifyJWT<T>(token, JWT_UTIL_SECRET)
}

export function attachCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
) {
    // Assigning Access token in http-only cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        signed: true,
        secure: NODE_ENV !== 'development',
        maxAge: 15 * 60 * 1000,
    })

    // Assigning Refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        signed: true,
        secure: NODE_ENV !== 'development',
        maxAge: 60 * 60 * 1000,
    })
}

function signJWT(
    payload: Object,
    secret: string,
    options?: jwt.SignOptions | undefined
) {
    const key = Buffer.from(secret, 'base64').toString('ascii')
    return jwt.sign(payload, key, { ...(options && options) })
}

function verifyJWT<T>(token: string, secret: string): T | null {
    const key = Buffer.from(secret, 'base64').toString('ascii')
    try {
        return jwt.verify(token, key) as T
    } catch (err) {
        return null
    }
}
