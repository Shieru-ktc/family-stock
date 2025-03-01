-- CreateTable
CREATE TABLE "FamilyOverride" (
    "familyId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FamilyOverride_pkey" PRIMARY KEY ("familyId","parameter")
);

-- AddForeignKey
ALTER TABLE "FamilyOverride" ADD CONSTRAINT "FamilyOverride_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;
