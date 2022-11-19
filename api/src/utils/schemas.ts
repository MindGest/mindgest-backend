import { callbackPromise } from "nodemailer/lib/shared"
import z, { ZodAny } from "zod"

export const DateSchema = z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
}, z.date())

export const PersonSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  address: z.string(),
  birthDate: DateSchema,
  phoneNumber: z.number(),
  nif: z.number(),
})

export const TherapistSchema = z
  .object({ healthsystem: z.string().optional(), cedula: z.string() })
  .merge(PersonSchema)

export const GuardSchema = PersonSchema
export const InternSchema = PersonSchema
export const AccountantSchema = PersonSchema

export const RegistrationSchema = z.object({
  body: z.discriminatedUnion("role", [
    GuardSchema.merge(
      z.object({
        role: z.literal("guard"),
      })
    ).strict(),
    TherapistSchema.merge(
      z.object({
        role: z.literal("therapist"),
      })
    ).strict(),
    InternSchema.merge(
      z.object({
        role: z.literal("intern"),
      })
    ).strict(),
    AccountantSchema.merge(
      z.object({
        role: z.literal("accountant"),
      })
    ).strict(),
  ]),
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
    email: z.string().email(),
    callback: z.string().url().optional(),
  }),
})

export const AccountVerificationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    callback: z.string().url().optional(),
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
        .refine((data) => data.password === data.confirm, {
            message: 'Passwords should match',
        }),
})

export const VerifyAccountSchema = z.object({
  body: z
    .object({
      token: z.string(),
    })
    .strict()
    .required(),
})

export const EditUserSchema = z.object({
    body: z.object({
        token: z.string(),
    }),
})

export const ArchiveProcessSchema = z.object({
  body: z.object({
      token: z.string(),
      processId: z.number()
  }),
})

export const ProcessInfoSchema = z.object({
  body: z.object({
      token: z.string(),
      processId: z.number(),
  }),
})

export const ProcessListSchema = z.object({
  body: z.object({
      token: z.string(),
  }),
})

export const ProcessCreateSchema = z.object({
  body: z.object({
      token: z.string(),
      processId: z.number(),
      patientId: z.number(),
      terapeutaId: z.number(),
      speciality: z.string(),
      remarks: z.string()
  }),
})



export const ProcessEditSchema = z.object({
  body: z.object({
      token: z.string(),
      terapeutaId: z.number(),
      speciality: z.string(),
      remarks: z.string(),
      interns: z.array(z.number())
  }),
})




export default {
    RegistrationSchema,
    LoginSchema,
    RefreshSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    VerifyAccountSchema,
    ArchiveProcessSchema,
    AccountVerificationSchema,
    DateSchema,
    ProcessListSchema,
    ProcessInfoSchema,
    ProcessCreateSchema,
    ProcessEditSchema
}
