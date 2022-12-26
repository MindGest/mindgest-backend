import z, { TypeOf } from "zod"
import schemas, { SelfEditProfileSchema } from "./schemas"

export type DateSchema = z.infer<typeof schemas.DateSchema>

export type RegistrationBody = z.TypeOf<typeof schemas.RegistrationSchema>["body"]

export type LoginBody = z.TypeOf<typeof schemas.LoginSchema>["body"]

export type RefreshBody = z.TypeOf<typeof schemas.RefreshSchema>["body"]

export type VerifyAccountBody = z.TypeOf<typeof schemas.VerifyAccountSchema>["body"]

export type RefreshToken = {
  session: { ip: string; userAgent: string | undefined; creationDate: string | undefined }
  person: number
} & Object
export type AccessToken = { id: number; admin: boolean; role: string } & Object

export type VerificationToken = { person: number } & Object
export type ValidationToken = { id: number; admin: boolean } & Object
export type PasswordResetToken = VerificationToken

export type ForgotPasswordBody = z.TypeOf<typeof schemas.ForgotPasswordSchema>["body"]

export type AccountVerificationSchema = z.TypeOf<typeof schemas.AccountVerificationSchema>["body"]

export type ResetPasswordBody = z.TypeOf<typeof schemas.ResetPasswordSchema>["body"]

export type ProcessIDPrams = z.TypeOf<typeof schemas.ProcessIDSchema>["params"]

export type ProcessCreateBody = z.TypeOf<typeof schemas.ProcessCreateSchema>["body"]

export type ProcessEditBody = z.TypeOf<typeof schemas.ProcessEditSchema>["body"]

export type AppointmentArchive = z.TypeOf<typeof schemas.AppointmentArchiveSchema>["body"]

export type AppointmentCreate = z.TypeOf<typeof schemas.AppointmentCreateSchema>["body"]

export type AppointmentsList = z.TypeOf<typeof schemas.AppointmentsListSchema>["body"]

export type AppointmentInfo = z.TypeOf<typeof schemas.AppointmentInfoSchema>["body"]

export type ProcessEditPermissionsBody = z.TypeOf<
  typeof schemas.ProcessEditPermissionsSchema
>["body"]

export type AppointmentEdit = z.TypeOf<typeof schemas.AppointmentEditSchema>["body"]

export type EditProfileBody = z.TypeOf<typeof schemas.EditProfileSchema>["body"]
export type EditProfileParams = z.TypeOf<typeof schemas.EditProfileSchema>["params"]

export type TherapistUpdateBody = z.TypeOf<typeof schemas.TherapistUpdateSchema>
export type InternUpdateBody = z.TypeOf<typeof schemas.InternUpdateSchema>
export type GuardUpdateBody = z.TypeOf<typeof schemas.GuardUpdateSchema>
export type AccountantUpdateBody = z.TypeOf<typeof schemas.AccountantUpdateSchema>
export type AdminUpdateBody = z.TypeOf<typeof schemas.AdminUpdateSchema>

export type SelfEditProfileBody = z.TypeOf<typeof schemas.SelfEditProfileSchema>["body"]

export type SelfTherapistUpdateBody = z.TypeOf<typeof schemas.TherapistSchema>
export type SelfInternUpdateBody = z.TypeOf<typeof schemas.InternSchema>
export type SelfGuardUpdateBody = z.TypeOf<typeof schemas.GuardSchema>
export type SelfAccountantUpdateBody = z.TypeOf<typeof schemas.AccountantSchema>
export type SelfAdminUpdateBody = z.TypeOf<typeof schemas.AdminSchema>

export type MarkNotificationQueryParams = { notification: Number }

export type NotificationListQueryParams = z.TypeOf<typeof schemas.NotificationFilterSchema>

export type QueryListProcess = z.TypeOf<typeof schemas.QueryListProcess>["query"]
export type QueryListReceipt = z.TypeOf<typeof schemas.ReceiptListQuery>["query"]
export type QueryListRooms = z.TypeOf<typeof schemas.QueryListRooms>["query"]
export type QueryStatistics = z.TypeOf<typeof schemas.QueryStatistics>["query"]

export type NotesCreateBody = z.TypeOf<typeof schemas.NotesCreate>["body"]
export type RoomCreateBody = z.TypeOf<typeof schemas.RoomCreate>["body"]

export type SpecialityListBody = z.TypeOf<typeof schemas.SpecialityListSchema>["body"]
export type SpecialityCreateBody = z.TypeOf<typeof schemas.SpecialityCreateSchema>["body"]
