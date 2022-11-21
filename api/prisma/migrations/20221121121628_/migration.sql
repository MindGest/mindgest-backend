-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_fk1";

-- CreateTable
CREATE TABLE "therapist_process_permissions" (
    "therapist_person_id" BIGINT NOT NULL,
    "permissions_id" BIGINT NOT NULL,

    CONSTRAINT "therapist_process_permissions_pkey" PRIMARY KEY ("therapist_person_id","permissions_id")
);

-- CreateTable
CREATE TABLE "intern_process_permissions" (
    "intern_person_id" BIGINT NOT NULL,
    "permissions_id" BIGINT NOT NULL,

    CONSTRAINT "intern_process_permissions_pkey" PRIMARY KEY ("intern_person_id","permissions_id")
);

-- AddForeignKey
ALTER TABLE "therapist_process_permissions" ADD CONSTRAINT "therapist_process_permissions_fk1" FOREIGN KEY ("therapist_person_id") REFERENCES "therapist"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "therapist_process_permissions" ADD CONSTRAINT "therapist_process_permissions_fk2" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern_process_permissions" ADD CONSTRAINT "intern_process_permissions_fk1" FOREIGN KEY ("intern_person_id") REFERENCES "intern"("person_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "intern_process_permissions" ADD CONSTRAINT "intern_process_permissions_fk2" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
