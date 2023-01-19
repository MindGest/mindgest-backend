import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.1 the user does not exist", () => {
  it("0.1.0 login with a user that does not exist", async () => {
    const payload = {
      email: "email@student.dei.uc.pt",
      password: "password1234",
    }
    const message = {
      message: "The user does not exist!",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.NOT_FOUND)
    expect(result.body).toEqual(message)
  })

  it("0.1.1 wrong password with an existing user", async () => {
    const payload = {
      email: "johndoe@student.dei.uc.pt",
      password: "password1235",
    }
    const message = {
      message: "Login. Invalid credentials",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
  })

  it("0.1.2 Should login only if verified", async () => {
    const payload = {
      email: "johndoe@student.dei.uc.pt",
      password: "password1234",
    }
    const result = await request(app)
      .post("/api/auth/login")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toHaveProperty("message", "component name")
    expect(result.body).toHaveProperty("accessToken")
    expect(result.body).toHaveProperty("refreshToken")
  }) //user has to be verified and it has to be approved by a therapist or admin b4 this works
})
