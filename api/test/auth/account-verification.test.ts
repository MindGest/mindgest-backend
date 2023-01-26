import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"
import exp from "constants"

describe("0.4 test account verification token", () => {
   it("0.4.0 account verified", async () => {
    const payload = {
      email: "johndoe@student.dei.uc.pt",
    } // no call back means that a mail is not sent and the token is sent in the reponse body

    const result = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toHaveProperty("token")
   })

  it("0.4.1 the user is not registered in the application", async () => {
    const payload = {
      email: "email@student.dei.uc.pt",
    } // no call back means that a mail is not sent and the token is sent in the reponse body


    const result = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.NOT_FOUND)
  })
})
