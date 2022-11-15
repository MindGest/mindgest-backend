import z from 'zod'

export const DateSchema = z.preprocess((arg:any) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

const PersonSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    address: z.string(),
    birthDate: DateSchema,
    phoneNumber: z.number(),
    nif: z.number(),
})

const TherapistSchema = z
    .object({ health_system: z.string(), cedula: z.string() })
    .and(PersonSchema)

const GuardSchema = PersonSchema
const InternSchema = PersonSchema
const AccountantSchema = PersonSchema

const UserInfoSchema = GuardSchema.and(z.object({ role: z.literal('guard') }))
    .or(TherapistSchema.and(z.object({ role: z.literal('therapist') })))
    .or(InternSchema.and(z.object({ role: z.literal('intern') })))
    .or(AccountantSchema.and(z.object({ role: z.literal('accountant') })))

export const RegistrationSchema = z.object({
    body: UserInfoSchema,
})

export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
})

export const RefreshSchema = z.object({
    body: z
        .object({
            refreshToken: z.string().optional(),
        })
        .strict()
        .required(),
})

export const ForgotPasswordSchema = z.object({
    body: z.object({
        email: z
            .string({
                required_error: 'Email is required',
            })
            .email('Email not valid'),
    }),
})

export const ResetPasswordSchema = z.object({
    body: z
        .object({
            token: z.string(),
            password: z.string({
                required_error: 'Password is required',
            }),
            confirm: z.string({
                required_error: 'Password confirmation is required',
            }),
        })
        .strict()
        .refine((data:any) => data.password === data.confirm, {
            message: 'Passwords should match',
        }),
})

export const VerifyAccountSchema = z.object({
    body: z
        .object({
            verification: z.string(),
        })
        .strict()
        .required(),
})

export const ArchiveProcessSchema = z.object({
    body: z.object({
        token: z.string(),
        processId: z.number()
    }),
})


export default {
    RegistrationSchema,
    LoginSchema,
    RefreshSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    VerifyAccountSchema,
    DateSchema,
    ArchiveProcessSchema
}
