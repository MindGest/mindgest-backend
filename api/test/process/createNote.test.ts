import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("3.8 test creating notes in process", () => {
  it("3.8.0 Note Created", async () => {
    const token = "" //set this is has valid admin token
    const processId = "0"
    const payload = {
      title: "note0",
      body: "some text",
    }
    const message = {
      message: "Note Created",
    }
    const result = await request(app)
      .post("/api/process/" + processId + "/createNote")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("3.8.1 User doesn't have authorization", async () => {
    const token = "" //set this is has guard token
    const processId = "0"
    const payload = {
      title: "note1",
      body: "some text",
    }
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .post("/api/process/" + processId + "/createNote")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("3.8.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const processId = "0"
    const payload = {
      title: "note1",
      body: "some text",
    }
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .post("/api/process/" + processId + "/createNote")
      .send(payload)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
