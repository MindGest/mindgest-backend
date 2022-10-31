-- CreateTable
CREATE TABLE "refreshtoken" (
    "refreshtoken" VARCHAR(512) NOT NULL,
    "ip" VARCHAR(512),
    "useragent" VARCHAR(512),
    "isvalid" BOOLEAN,
    "person_id" BIGINT NOT NULL,

    CONSTRAINT "refreshtoken_pkey" PRIMARY KEY ("refreshtoken")
);

-- AddForeignKey
ALTER TABLE "refreshtoken" ADD CONSTRAINT "refreshtoken_fk1" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
