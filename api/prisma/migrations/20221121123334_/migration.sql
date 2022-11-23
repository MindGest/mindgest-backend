-- AlterTable
CREATE SEQUENCE "permissions_id_seq";
ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT nextval('permissions_id_seq');
ALTER SEQUENCE "permissions_id_seq" OWNED BY "permissions"."id";
