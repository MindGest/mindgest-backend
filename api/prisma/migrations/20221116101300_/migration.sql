/*
  Warnings:

  - Added the required column `verified` to the `person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "person" ADD COLUMN     "verified" BOOLEAN NOT NULL;
