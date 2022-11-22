import z, { TypeOf } from "zod"
import schemas from "./schemas"

export type DateSchema = z.infer<typeof schemas.DateSchema>

export type RegistrationBody = z.TypeOf<typeof schemas.RegistrationSchema>["body"]

export type LoginBody = z.TypeOf<typeof schemas.LoginSchema>["body"]

export type RefreshBody = z.TypeOf<typeof schemas.RefreshSchema>["body"]

export type VerifyAccountBody = z.TypeOf<typeof schemas.VerifyAccountSchema>["body"]

export type VerificationToken = { person: number } & Object
export type ValidationToken = { id: number, admin: boolean } & Object
export type PasswordResetToken = VerificationToken

export type RefreshToken = {
    session: { ip: string; userAgent: string | undefined; creationDate: string | undefined }
    person: number
  } & Object
  export type AccessToken = { id: number; admin: boolean; role: string } & Object

export type ForgotPasswordBody = z.TypeOf<typeof schemas.ForgotPasswordSchema>["body"]

export type AccountVerificationSchema = z.TypeOf<typeof schemas.AccountVerificationSchema>["body"]

export type ResetPasswordBody = z.TypeOf<typeof schemas.ResetPasswordSchema>["body"]

export type ArchiveProcessBody = z.TypeOf<typeof schemas.ArchiveProcessSchema>["body"]

export type ProcessListBody = z.TypeOf<typeof schemas.ProcessListSchema>["body"]

export type ProcessInfoBody = z.TypeOf<typeof schemas.ProcessInfoSchema>["body"]

export type ProcessCreateBody = z.TypeOf<typeof schemas.ProcessCreateSchema>["body"]

export type ProcessEditBody = z.TypeOf<typeof schemas.ProcessEditSchema>['body']

export type EditUserBody = z.TypeOf<typeof schemas.EditUserSchema>['body']

export type AppointmentArchive = z.TypeOf<typeof schemas.AppointmentArchiveSchema>['body']

export type AppointmentCreate = z.TypeOf<typeof schemas.AppointmentCreateSchema>['body']

export type AppointmentsList = z.TypeOf<typeof schemas.AppointmentsListSchema>['body']

export type AppointmentInfo = z.TypeOf<typeof schemas.AppointmentInfoSchema>['body']

export type ProcessEditPermissionsBody = z.TypeOf<
    typeof schemas.ProcessEditPermissionsSchema
>['body']

export type AppointmentEdit = z.TypeOf<typeof schemas.AppointmentEditSchema>['body']