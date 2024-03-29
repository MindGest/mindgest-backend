import z from "zod"
import schemas from "./schemas"

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

export type TherapistUpdateBody = z.TypeOf<typeof schemas.TherapistSchema>
export type InternUpdateBody = z.TypeOf<typeof schemas.InternSchema>
export type GuardUpdateBody = z.TypeOf<typeof schemas.GuardSchema>
export type AccountantUpdateBody = z.TypeOf<typeof schemas.AccountantSchema>
export type AdminUpdateBody = z.TypeOf<typeof schemas.AdminSchema>

export type MarkNotificationQueryParams = { id: Number }

export type NotificationListQueryParams = z.TypeOf<typeof schemas.NotificationFilterSchema>

export type QueryListProcess = z.TypeOf<typeof schemas.QueryListProcess>["query"]
export type ReceiptFilterQuery = z.TypeOf<typeof schemas.ReceiptListQuery>["query"]
export type QueryListRooms = z.TypeOf<typeof schemas.QueryListRooms>["query"]
export type StatisticsBody = z.TypeOf<typeof schemas.StatisticsSchema>["body"]

export type NotesCreateBody = z.TypeOf<typeof schemas.NotesCreate>["body"]
export type RoomCreateBody = z.TypeOf<typeof schemas.RoomCreate>["body"]

export type NotificationBody = z.TypeOf<typeof schemas.NotificationSchema>["body"]

export type SpecialityCreateBody = z.TypeOf<typeof schemas.SpecialityCreateSchema>["body"]
export type EmailSchema = z.TypeOf<typeof schemas.EmailSchema>["body"]

export type GetPermissionsBody = z.TypeOf<typeof schemas.GetPermissionsSchema>["body"]
export type EditPermissionsBody = z.TypeOf<typeof schemas.EditPermissionsSchema>["body"]

export type CreateChildPatientBody = z.TypeOf<typeof schemas.CreateChildPatientSchema>["body"]
export type CreateTeenPatientBody = z.TypeOf<typeof schemas.CreateTeenPatientSchema>["body"]
export type CreateAdultPatientBody = z.TypeOf<typeof schemas.CreateAdultPatientSchema>["body"]
export type EditChildPatientBody = z.TypeOf<typeof schemas.EditChildPatientSchema>["body"]
export type EditTeenPatientBody = z.TypeOf<typeof schemas.EditTeenPatientSchema>["body"]
export type EditAdultPatientBody = z.TypeOf<typeof schemas.EditAdultPatientSchema>["body"]
export type EditCoupleOrFamilyPatientBody = z.TypeOf<
  typeof schemas.EditCoupleOrFamilyPatientSchema
>["body"]

export type EditCareTaker = z.TypeOf<typeof schemas.EditCareTakerSchema>

export type GetAvailableRoomsBody = z.TypeOf<typeof schemas.GetAvailableRoomsSchema>["body"]

export type GetCollaboratorsBody = z.TypeOf<typeof schemas.GetCollaboratorsSchema>["body"]

export type ProcessMigrationSchemaBody = z.TypeOf<typeof schemas.ProcessMigrationSchema>["body"]

export type UpdateNoteBody = z.TypeOf<typeof schemas.NotesUpdate>["body"]

export type CreateLiableBody = z.TypeOf<typeof schemas.CreateLiableSchema>["body"]
export type PatientListQueryParams = z.TypeOf<typeof schemas.PatientFilterSchema>
