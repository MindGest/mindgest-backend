import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("0.3 if an account is already verified", () => {
  it("0.3.0 the admin account has already been verified", async () => {
    const payload = {
      email: "sarab@student.dei.uc.pt",
    } // no callback so token comes in body and is not sent by email
    const verificationResult = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = verificationResult.body.token

    const payload1 = {
      token: token,
    }
    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })

  it("0.3.1 the therapist account has already been verified", async () => {
    const payload = {
      email: "johndoe@student.dei.uc.pt",
    } // no callback so token comes in body and is not sent by email
    const verificationResult = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = verificationResult.body.token

    const payload1 = {
      token: token,
    }
    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })

  it("0.3.2 the security account has already been verified", async () => {
    const payload = {
      email: "obliquo@student.dei.uc.pt",
    } // no callback so token comes in body and is not sent by email
    const verificationResult = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = verificationResult.body.token

    const payload1 = {
      token: token,
    }
    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })

  it("0.3.3 the accountant account has already been verified", async () => {
    const payload = {
      email: "caroldam@student.dei.uc.pt",
    } // no callback so token comes in body and is not sent by email
    const verificationResult = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = verificationResult.body.token

    const payload1 = {
      token: token,
    }
    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })

  it("0.3.4 the intern account has already been verified", async () => {
    const payload = {
      email: "mmenezes@student.dei.uc.pt",
    } // no callback so token comes in body and is not sent by email
    const verificationResult = await request(app)
      .post("/api/auth/account-verification")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")

    const token = verificationResult.body.token

    const payload1 = {
      token: token,
    }
    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
  })

  it("0.3.5 with invalid token", async () => {
    const payload = {
      token: "invalid token",
    }

    const result = await request(app)
      .post("/api/auth/verify-account")
      .send(payload)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
  })
})
