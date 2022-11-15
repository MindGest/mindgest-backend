import z from 'zod'
import schemas from './schemas'

export type DateSchema = z.infer<typeof schemas.DateSchema>

export type RegistrationBody = z.TypeOf<
    typeof schemas.RegistrationSchema
>['body']

export type LoginBody = z.TypeOf<typeof schemas.LoginSchema>['body']

export type RefreshBody = z.TypeOf<typeof schemas.RefreshSchema>['body']

export type VerifyAccountBody = z.TypeOf<
    typeof schemas.VerifyAccountSchema
>['body']

export type RefreshToken = { session: number; person: number } & Object
export type VerificationToken = { person: number } & Object
export type PasswordResetToken = VerificationToken

export type ForgotPasswordBody = z.TypeOf<
    typeof schemas.ForgotPasswordSchema
>['body']

export type ResetPasswordBody = z.TypeOf<
    typeof schemas.ResetPasswordSchema
>['body']

export type ArchiveProcessBody = z.TypeOf<
    typeof schemas.ArchiveProcessSchema
>['body']