import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"
import { refresh } from "../../src/controllers/auth.controller"

describe("0.2 token refresh", () => {
  it("0.2.0 token refresh successful", async () => {
    const refreshToken = ""; //need to generate the refresh token
    const payload = {
      refreshToken: refreshToken
    }

    const result = await request(app)
      .post("/api/auth/refresh")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.CREATED)
    expect(result.body).toHaveProperty("message", "User's access token refreshed")
    expect(result.body).toHaveProperty("accessToken")
    expect(result.body).toHaveProperty("refreshToken")
  })

  it("0.2.1 refresh request unauthorized", async () => {
    const refreshToken = ""; //need to generate unauthorized refresh token
    const payload = {
      refreshToken: refreshToken
    }

    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toHaveProperty("message", "Unauthorized. The user must login first and obtain an access token")
  })

  it("0.2.2 the user's Refresh Token expired or is invalid", async () => {
    const refreshToken = "invalid token"; //This is an already invalid token
    const payload = {
      refreshToken: refreshToken
    }

    const result = await request(app)
      .post("/api/auth/refresh")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toHaveProperty("message", "Refresh token invalid or expired")
  })
})
