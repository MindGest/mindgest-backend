/*
  Warnings:

  - You are about to drop the column `intern_person_id` on the `permissions` table. All the data in the column will be lost.
  - You are about to drop the `intern_process_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `therapist_process_permissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `person_id` to the `permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "intern_process_permissions" DROP CONSTRAINT "intern_process_permissions_fk1";

-- DropForeignKey
ALTER TABLE "intern_process_permissions" DROP CONSTRAINT "intern_process_permissions_fk2";

-- DropForeignKey
ALTER TABLE "therapist_process_permissions" DROP CONSTRAINT "therapist_process_permissions_fk1";

-- DropForeignKey
ALTER TABLE "therapist_process_permissions" DROP CONSTRAINT "therapist_process_permissions_fk2";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "intern_person_id",
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "person_id" BIGINT NOT NULL;

-- DropTable
DROP TABLE "intern_process_permissions";

-- DropTable
DROP TABLE "therapist_process_permissions";

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
