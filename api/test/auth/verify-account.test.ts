import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"
import prisma from "../../src/utils/prisma"

dotenv.config()

import app from "../../src/main"
import { any } from "zod"

describe("0.3 verify an account", () => {
  it("0.3.0 verify admin account", async () => {
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
    const result1 = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("0.3.1 verify therapist account", async () => {
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
    const result1 = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("0.3.2 verify guard account", async () => {
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
    const result1 = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("0.3.3 verify accountant account", async () => {
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
    const result1 = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
  })

  it("0.3.4 verify intern account", async () => {
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
    const result1 = await request(app)
      .post("/api/auth/verify-account")
      .send(payload1)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result1.status).toEqual(StatusCodes.OK)
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

  it("approving every verified account cause (there is no endpoint for it)", async () => {
    prisma.person.updateMany({
      where: {
        email: {
          contains: "dei.uc.pt",
        },
      },
      data: {
        approved: true,
      },
    })

    expect(1).toEqual(1)
  })
})
