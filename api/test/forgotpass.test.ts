import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../src/main"

describe("x.0 forgot password and user exists", () => {
  it("x.0.0 existing user sends request to change password", async () => {
    const payload = {
      "email": "johndoe@student.dei.uc.pt",
      "callback": "http://frontend.com/password-reset-page"
    }    
    const message = {
      "message": "The user does not exist!"
    } //the message is incorrect
    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })
})

describe("x.2 forgot password and user doesn't exist", () => {
  it("x.2.0 user is not in the database so it cannot recover password", async () => {
    const payload = {
      "email": "john@student.dei.uc.pt",
      "callback": "http://frontend.com/password-reset-page"
    }    
    const message = {
      "message": "The user does not exist!"
    }
    const result = await request(app)
      .post("/api/auth/forgot-password")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.BAD_REQUEST)
    expect(result.body).toEqual(message)
    
  })
})
