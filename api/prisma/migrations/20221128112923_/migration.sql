-- CreateTable
CREATE TABLE "accountant" (
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "accountant_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "appointment" (
    "online" BOOLEAN,
    "room_id" BIGINT NOT NULL,
    "pricetable_id" VARCHAR(512) NOT NULL,
    "slot_id" BIGINT NOT NULL,
    "slot_start_date" TIMESTAMP(6) NOT NULL,
    "slot_end_date" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("slot_id")
);

-- CreateTable
CREATE TABLE "appointment_process" (
    "appointment_slot_id" BIGINT NOT NULL,
    "process_id" BIGINT NOT NULL,

    CONSTRAINT "appointment_process_pkey" PRIMARY KEY ("appointment_slot_id","process_id")
);

-- CreateTable
CREATE TABLE "availability" (
    "slot_id" BIGINT NOT NULL,
    "slot_start_date" TIMESTAMP(6) NOT NULL,
    "slot_end_date" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("slot_id")
);

-- CreateTable
CREATE TABLE "guard" (
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "guard_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "admin" (
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "intern" (
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "intern_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "intern_availability" (
    "intern_person_id" BIGINT NOT NULL,
    "availability_slot_id" BIGINT NOT NULL,

    CONSTRAINT "intern_availability_pkey" PRIMARY KEY ("intern_person_id","availability_slot_id")
);

-- CreateTable
CREATE TABLE "intern_process" (
    "intern_person_id" BIGINT NOT NULL,
    "process_id" BIGINT NOT NULL,

    CONSTRAINT "intern_process_pkey" PRIMARY KEY ("intern_person_id","process_id")
);

-- CreateTable
CREATE TABLE "liable" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "email" VARCHAR(512) NOT NULL,
    "phonenumber" BIGINT NOT NULL,
    "type" VARCHAR(512) NOT NULL,
    "remarks" VARCHAR(512),

    CONSTRAINT "liable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGINT NOT NULL,
    "message" VARCHAR(512),
    "seen" BOOLEAN,
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient" (
    "health_number" BIGINT NOT NULL,
    "request" VARCHAR(512) NOT NULL,
    "remarks" VARCHAR(512),
    "patienttype_id" BIGINT NOT NULL,
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "patient_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "patient_process" (
    "patient_person_id" BIGINT NOT NULL,
    "process_id" BIGINT NOT NULL,

    CONSTRAINT "patient_process_pkey" PRIMARY KEY ("patient_person_id","process_id")
);

-- CreateTable
CREATE TABLE "patienttype" (
    "id" BIGINT NOT NULL,
    "type" VARCHAR(512) NOT NULL,

    CONSTRAINT "patienttype_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "editprocess" BOOLEAN NOT NULL DEFAULT false,
    "see" BOOLEAN NOT NULL DEFAULT false,
    "appoint" BOOLEAN NOT NULL DEFAULT false,
    "statitics" BOOLEAN NOT NULL DEFAULT false,
    "editpatitent" BOOLEAN NOT NULL DEFAULT false,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "id" BIGSERIAL NOT NULL,
    "person_id" BIGINT NOT NULL,
    "process_id" BIGINT NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "email" VARCHAR(512) NOT NULL,
    "password" VARCHAR(512) NOT NULL,
    "address" VARCHAR(512) NOT NULL,
    "birth_date" DATE NOT NULL,
    "photo" VARCHAR(512),
    "phone_number" BIGINT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "active" BOOLEAN NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "tax_number" BIGINT,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricetable" (
    "id" VARCHAR(512) NOT NULL,
    "type" VARCHAR(512) NOT NULL,
    "price" REAL NOT NULL,

    CONSTRAINT "pricetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process" (
    "id" BIGSERIAL NOT NULL,
    "ref" VARCHAR(512) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "remarks" VARCHAR(512),
    "speciality_speciality" VARCHAR(512) NOT NULL,

    CONSTRAINT "process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_liable" (
    "process_id" BIGINT NOT NULL,
    "liable_id" BIGINT NOT NULL,

    CONSTRAINT "process_liable_pkey" PRIMARY KEY ("process_id","liable_id")
);

-- CreateTable
CREATE TABLE "profession" (
    "id" BIGINT NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "patient_person_id" BIGINT NOT NULL,

    CONSTRAINT "profession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt" (
    "id" BIGSERIAL NOT NULL,
    "ref" VARCHAR(512) NOT NULL,
    "name" VARCHAR(512) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "datetime" TIMESTAMP(6) NOT NULL,
    "payed" BOOLEAN DEFAULT false,
    "appointment_slot_id" BIGINT NOT NULL,

    CONSTRAINT "receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(512) NOT NULL,

    CONSTRAINT "room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school" (
    "id" BIGSERIAL NOT NULL,
    "name" BIGINT NOT NULL,
    "course" VARCHAR(512) NOT NULL,
    "grade" BIGINT,
    "patient_person_id" BIGINT NOT NULL,

    CONSTRAINT "school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speciality" (
    "speciality" VARCHAR(512) NOT NULL,

    CONSTRAINT "speciality_pkey" PRIMARY KEY ("speciality")
);

-- CreateTable
CREATE TABLE "therapist" (
    "extern" BOOLEAN NOT NULL,
    "license" VARCHAR(512),
    "health_system" VARCHAR(512),
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "therapist_pkey" PRIMARY KEY ("person_id")
);

-- CreateTable
CREATE TABLE "therapist_availability" (
    "therapist_person_id" BIGINT NOT NULL,
    "availability_slot_id" BIGINT NOT NULL,

    CONSTRAINT "therapist_availability_pkey" PRIMARY KEY ("therapist_person_id","availability_slot_id")
);

-- CreateTable
CREATE TABLE "therapist_process" (
    "therapist_person_id" BIGINT NOT NULL,
    "process_id" BIGINT NOT NULL,

    CONSTRAINT "therapist_process_pkey" PRIMARY KEY ("therapist_person_id","process_id")
);

-- CreateTable
CREATE TABLE "therapist_speciality" (
    "therapist_person_id" BIGINT NOT NULL,
    "speciality_speciality" VARCHAR(512) NOT NULL,

    CONSTRAINT "therapist_speciality_pkey" PRIMARY KEY ("therapist_person_id","speciality_speciality")
);

-- CreateIndex
CREATE UNIQUE INDEX "process_ref_key" ON "process"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "profession_name_key" ON "profession"("name");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_ref_key" ON "receipt"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "room_name_key" ON "room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "school_grade_key" ON "school"("grade");

-- AddForeignKey
ALTER TABLE "accountant" ADD CONSTRAINT "accountant_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_fk1" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_fk2" FOREIGN KEY ("pricetable_id") REFERENCES "pricetable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment_process" ADD CONSTRAINT "appointment_process_fk1" FOREIGN KEY ("appointment_slot_id") REFERENCES "appointment"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "appointment_process" ADD CONSTRAINT "appointment_process_fk2" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "guard" ADD CONSTRAINT "guard_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern" ADD CONSTRAINT "intern_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern_availability" ADD CONSTRAINT "intern_availability_fk1" FOREIGN KEY ("intern_person_id") REFERENCES "intern"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern_availability" ADD CONSTRAINT "intern_availability_fk2" FOREIGN KEY ("availability_slot_id") REFERENCES "availability"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern_process" ADD CONSTRAINT "intern_process_fk1" FOREIGN KEY ("intern_person_id") REFERENCES "intern"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern_process" ADD CONSTRAINT "intern_process_fk2" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_fk1" FOREIGN KEY ("patienttype_id") REFERENCES "patienttype"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient" ADD CONSTRAINT "patient_fk2" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_process" ADD CONSTRAINT "patient_process_fk1" FOREIGN KEY ("patient_person_id") REFERENCES "patient"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "patient_process" ADD CONSTRAINT "patient_process_fk2" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_fk2" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "process" ADD CONSTRAINT "process_fk1" FOREIGN KEY ("speciality_speciality") REFERENCES "speciality"("speciality") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "process_liable" ADD CONSTRAINT "process_liable_fk1" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "process_liable" ADD CONSTRAINT "process_liable_fk2" FOREIGN KEY ("liable_id") REFERENCES "liable"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "profession" ADD CONSTRAINT "profession_fk1" FOREIGN KEY ("patient_person_id") REFERENCES "patient"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "receipt" ADD CONSTRAINT "receipt_fk1" FOREIGN KEY ("appointment_slot_id") REFERENCES "appointment"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "school" ADD CONSTRAINT "school_fk1" FOREIGN KEY ("patient_person_id") REFERENCES "patient"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist" ADD CONSTRAINT "therapist_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_availability" ADD CONSTRAINT "therapist_availability_fk1" FOREIGN KEY ("therapist_person_id") REFERENCES "therapist"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_availability" ADD CONSTRAINT "therapist_availability_fk2" FOREIGN KEY ("availability_slot_id") REFERENCES "availability"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_process" ADD CONSTRAINT "therapist_process_fk1" FOREIGN KEY ("therapist_person_id") REFERENCES "therapist"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_process" ADD CONSTRAINT "therapist_process_fk2" FOREIGN KEY ("process_id") REFERENCES "process"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_speciality" ADD CONSTRAINT "therapist_speciality_fk1" FOREIGN KEY ("therapist_person_id") REFERENCES "therapist"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_speciality" ADD CONSTRAINT "therapist_speciality_fk2" FOREIGN KEY ("speciality_speciality") REFERENCES "speciality"("speciality") ON DELETE NO ACTION ON UPDATE NO ACTION;
