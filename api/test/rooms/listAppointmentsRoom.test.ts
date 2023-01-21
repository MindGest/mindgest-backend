import request from "supertest"
import dotenv from "dotenv"
import { StatusCodes } from "http-status-codes"

import { describe, expect, it } from "@jest/globals"

dotenv.config()

import app from "../../src/main"

describe("4.2 test listing appointments in a room", () => {
  it("4.2.0 List every appointment in a room", async () => {
    const token = "" //set this is has valid admin token
    const date = "2022/12/24"
    const room ="0"
    const message = {
      message: [
        {
          room: "room0",
          roomId: "0",
          appointmentsRoom: [
            {
              title: "Dr João Pedro Esp-A",
              id: 0,
              startDate: "2022-12-24T15:03:00.000Z",
              endDate: "2022-12-24T15:03:00.000Z"
            }
          ]
        }
      ]    
    }
    const result = await request(app)
      .get("/api/rooms/listAppointmentsRoom?date"+ date +"&room=" + room)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.OK)
    expect(result.body).toEqual(message)
  })

  it("4.2.1 User doesn't have authorization", async () => {
    const token = "" //set this has guard token
    const date = "2022/12/24"
    const room ="0"
    const message = {
      message: "User doesn't have authorization",
    }
    const result = await request(app)
      .get("/api/rooms/listAppointmentsRoom?date"+ date +"&room=" + room)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.UNAUTHORIZED)
    expect(result.body).toEqual(message)
  })

  it("4.2.2 The user's Verification Token is expired/invalid", async () => {
    const token = "invalid token" //this is equivalent to expired token
    const date = "2022/12/24"
    const room ="0"
    const message = {
      message: "Verification token invalid or expired",
    }
    const result = await request(app)
      .get("/api/rooms/listAppointmentsRoom?date"+ date +"&room=" + room)
      .set("Authorization", token)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
    expect(result.status).toEqual(StatusCodes.FORBIDDEN)
    expect(result.body).toEqual(message)
  })
})
