import z from "zod"

export enum User {
  ADMIN = "admin",
  THERAPIST = "therapist",
  INTERN = "intern",
  ACCOUNTANT = "accountant",
  GUARD = "guard",
}

export const DateSchema = z.coerce.date()

export const PersonSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  address: z.string(),
  birthDate: DateSchema,
  phoneNumber: z.number(),
})

export const TherapistSchema = z
  .object({
    extern: z.boolean(),
    healthSystem: z.string().optional(),
    license: z.string(),
    speciality: z.string(),
  })
  .merge(PersonSchema)
  .merge(z.object({ taxNumber: z.number() }))

export const AdminSchema = PersonSchema.merge(z.object({ taxNumber: z.number() }))
export const GuardSchema = PersonSchema.merge(z.object({ taxNumber: z.number() }))
export const AccountantSchema = PersonSchema.merge(z.object({ taxNumber: z.number() }))
export const InternSchema = PersonSchema

export const RegistrationSchema = z.object({
  body: z.discriminatedUnion("role", [
    AdminSchema.merge(
      z.object({
        role: z.literal(User.ADMIN),
      })
    ).strict(),
    GuardSchema.merge(
      z.object({
        role: z.literal(User.GUARD),
      })
    ).strict(),
    TherapistSchema.merge(
      z.object({
        role: z.literal(User.THERAPIST),
      })
    ).strict(),
    InternSchema.merge(
      z.object({
        role: z.literal(User.INTERN),
      })
    ).strict(),
    AccountantSchema.merge(
      z.object({
        role: z.literal(User.ACCOUNTANT),
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
    .strict(),
})

export const AuthToken = z.object({
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
        required_error: "Password is required",
      }),
      confirm: z.string({
        required_error: "Password confirmation is required",
      }),
    })
    .strict()
    .refine((data) => data.password === data.confirm, {
      message: "Passwords should match",
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

export const PersonUpdateSchema = z
  .object({
    active: z.boolean(),
    approved: z.boolean(),
  })
  .merge(PersonSchema)

export const TherapistUpdateSchema = z
  .object({
    healthSystem: z.string().optional(),
    license: z.string(),
    extern: z.boolean(),
    taxNumber: z.number(),
    speciality: z.string(),
  })
  .merge(PersonUpdateSchema)

export const AdminUpdateSchema = PersonUpdateSchema.merge(z.object({ taxNumber: z.number() }))
export const GuardUpdateSchema = PersonUpdateSchema.merge(z.object({ taxNumber: z.number() }))
export const AccountantUpdateSchema = PersonUpdateSchema.merge(z.object({ taxNumber: z.number() }))
export const InternUpdateSchema = PersonUpdateSchema

export const SelfEditProfileSchema = z.object({
  body: z.union([
    AdminSchema.strict(),
    GuardSchema.strict(),
    TherapistSchema.strict(),
    InternSchema.strict(),
    AccountantSchema.strict(),
  ]),
})

export const PatientSchema = z
  .object({
    tax_number: z.number(),
    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patienttype_id: z.number(),

    // school parameters (can be optional)
    schoolName: z.string().optional(),
    schoolCourse: z.string().optional(),
    schoolGrade: z.string().optional(),

    // profession parameters (can be optional)
    professionName: z.string().optional(),
  })
  .merge(PersonUpdateSchema)

export const EditProfileParamsSchema = z.object({
  params: z
    .object({
      user: z
        .string()
        .min(1)
        .transform((s) => Number(s)),
    })
    .strict(),
})

export const EditProfileSchema = z.object({
  params: z
    .object({
      user: z
        .string()
        .min(1)
        .transform((s) => Number(s)),
    })
    .strict(),
  body: z.union([
    AdminUpdateSchema.strict(),
    GuardUpdateSchema.strict(),
    TherapistUpdateSchema.strict(),
    InternUpdateSchema.strict(),
    AccountantUpdateSchema.strict(),
  ]),
})

export const ProcessIDSchema = z.object({
  params: z
    .object({
      processId: z.string(),
    })
    .strict(),
})

export const QueryListProcess = z.object({
  query: z.object({
    active: z.string(),
    speciality: z.string(),
  }),
})

export const ProcessCreateSchema = z.object({
  body: z.object({
    patientIds: z.array(z.number()),
    therapistId: z.number(),
    speciality: z.string(),
    remarks: z.string(),
    colaborators: z.array(z.number()),
  }),
})

export const ProcessEditSchema = z.object({
  body: z.object({
    speciality: z.string(),
    remarks: z.string(),
    colaborators: z.array(z.number()),
  }),
})

export const ProcessMigrationSchema = z.object({
  body: z.object({ therapistId: z.number() }).strict(),
})

export const ProcessEditPermissionsSchema = z.object({
  body: z.object({
    collaboratorId: z.number(),
    appoint: z.boolean(),
    statitics: z.boolean(),
    editProcess: z.boolean(),
    editPatient: z.boolean(),
    archive: z.boolean(),
    see: z.boolean(),
  }),
})

export const AppointmentCreateSchema = z.object({
  body: z.object({
    processId: z.number(),
    online: z.boolean(),
    roomId: z.number(),
    priceTableId: z.string(),
    startDate: DateSchema,
    endDate: DateSchema,
    archiveDate: DateSchema,
  }),
})

export const AppointmentArchiveSchema = z.object({
  body: z.object({
    appointmentId: z.number(),
    archiveDate: DateSchema,
  }),
})

export const AppointmentsListSchema = z.object({
  body: z.object({
    filterId: z.number(), //can either be -1 for all, an id of a therapist for their appointments or of an intern
  }),
})

export const AppointmentInfoSchema = z.object({
  body: z.object({
    appointmentId: z.number(),
  }),
})

export const AppointmentEditSchema = z.object({
  body: z.object({
    appointmentId: z.number(),
    appointmentStart: DateSchema,
    appointmentEnd: DateSchema,
    appointmentRoomId: z.number(),
  }),
})

export enum NotificationFilterType {
  READ = "seen",
  UNREAD = "unseen",
}

export const NotificationFilterSchema = z.object({
  filter: z.enum([NotificationFilterType.READ, NotificationFilterType.UNREAD]).optional(),
})

export const NotificationSchema = z.object({
  body: z
    .object({
      data: z.string(),
      type: z.string(),
    })
    .required(),
})

export enum ReceiptFilterType {
  PAYED = "settled",
  NOT_PAYED = "debt",
}

export const ReceiptListQuery = z.object({
  query: z.object({
    filter: z.enum([ReceiptFilterType.PAYED, ReceiptFilterType.NOT_PAYED]).optional(),
  }),
})

export const NotesCreate = z.object({
  body: z.object({
    title: z.string(),
    body: z.string(),
  }),
})

export const QueryListRooms = z.object({
  query: z.object({
    date: z.string(),
    room: z.string(),
  }),
})

export const RoomCreate = z.object({
  body: z.object({
    name: z.string(),
  }),
})

export const StatisticsSchema = z.object({
  body: z.object({
    startDate: z.string(),
    endDate: z.string(),
    therapistId: z.number().optional(),
    speciality: z.string().optional(),
    processId: z.number().optional(),
  }),
})

export const SpecialityCreateSchema = z.object({
  body: z.object({
    speciality: z.string(),
    code: z.string(),
    description: z.string(),
  }),
})

export const EmailSchema = z.object({
  body: z.object({
    email: z.string(),
    subject: z.string(),
    body: z.string(),
  }),
})

export const GetPermissionsSchema = z.object({
  body: z.object({
    processId: z.number(),
  }),
})

export const EditPermissionsSchema = z.object({
  body: z.object({
    processId: z.number(),
    collaboratorId: z.number(),
    appoint: z.boolean(),
    statitics: z.boolean(),
    editProcess: z.boolean(),
    editPatient: z.boolean(),
    archive: z.boolean(),
    see: z.boolean(),
  }),
})

export const GetPatientTypeSchema = z.object({
  body: z.object({
    patientId: z.number(),
  }),
})

export const GetPatientInfoSchema = z.object({
  body: z.object({
    patientId: z.number(),
    processId: z.number(),
  }),
})

export const EditCareTakerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.number(),
  type: z.string(),
  remarks: z.string(),
})

export const CreateChildPatientSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    grade: z.number(),
    school: z.string(),
  }),
})

export const CreateTeenPatientSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    grade: z.number(),
    school: z.string(),
    course: z.string(),
  }),
})

export const CreateAdultPatientSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    profession: z.string(),
  }),
})

export const EditChildPatientSchema = z.object({
  body: z.object({
    processId: z.number(),
    patientId: z.number(),

    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    grade: z.number(),
    school: z.string(),
    careTakers: z.array(EditCareTakerSchema),
  }),
})

export const EditTeenPatientSchema = z.object({
  body: z.object({
    processId: z.number(),
    patientId: z.number(),

    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    grade: z.number(),
    school: z.string(),
    course: z.string(),
    careTakers: z.array(EditCareTakerSchema),
  }),
})

export const EditAdultPatientSchema = z.object({
  body: z.object({
    processId: z.number(),
    patientId: z.number(),

    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    profession: z.string(),
    careTakers: z.array(EditCareTakerSchema),
  }),
})

export const EditCoupleOrFamilyPatientSchema = z.object({
  body: z.object({
    processId: z.number(),
    patientId: z.number(),

    name: z.string(),
    email: z.string().email(),
    address: z.string(),
    birthDate: DateSchema,
    photo: z.string(), // assumo que seja o path da imagem na db
    phoneNumber: z.number(),
    taxNumber: z.number(),

    healthNumber: z.number(),
    request: z.string(),
    remarks: z.string(),
    patientTypeId: z.number(),

    profession: z.string(),
  }),
})

export const ArchivePatientSchema = z.object({
  body: z.object({
    patientId: z.number(),
  }),
})

export const GetAvailableRoomsSchema = z.object({
  body: z.object({
    startDate: DateSchema,
    endDate: DateSchema,
  }),
})

export const GetCollaboratorsSchema = z.object({
  body: z.object({
    processId: z.number(),
  }),
})

export default {
  RegistrationSchema,
  LoginSchema,
  RefreshSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  VerifyAccountSchema,
  AccountVerificationSchema,
  DateSchema,
  ProcessCreateSchema,
  ProcessEditSchema,
  ProcessEditPermissionsSchema,
  AppointmentArchiveSchema,
  AppointmentCreateSchema,
  AppointmentsListSchema,
  AppointmentInfoSchema,
  AppointmentEditSchema,
  EditProfileSchema,
  TherapistUpdateSchema,
  InternUpdateSchema,
  GuardUpdateSchema,
  AccountantUpdateSchema,
  AdminUpdateSchema,
  NotificationFilterSchema,
  TherapistSchema,
  AccountantSchema,
  GuardSchema,
  AdminSchema,
  InternSchema,
  SelfEditProfileSchema,
  EditProfileParamsSchema,
  ProcessIDSchema,
  QueryListProcess,
  ReceiptListQuery,
  NotesCreate,
  QueryListRooms,
  RoomCreate,
  StatisticsSchema,
  SpecialityCreateSchema,
  EmailSchema,
  GetPermissionsSchema,
  EditPermissionsSchema,
  GetPatientTypeSchema,
  GetPatientInfoSchema,
  CreateChildPatientSchema,
  CreateTeenPatientSchema,
  CreateAdultPatientSchema,
  EditChildPatientSchema,
  EditTeenPatientSchema,
  EditAdultPatientSchema,
  ArchivePatientSchema,
  EditCareTakerSchema,
  EditCoupleOrFamilyPatientSchema,
  GetAvailableRoomsSchema,
  GetCollaboratorsSchema,
  NotificationSchema,
  ProcessMigrationSchema,
}
