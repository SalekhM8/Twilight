-- AlterTable
ALTER TABLE "public"."Treatment" ADD COLUMN     "seasonEnd" TIMESTAMP(3),
ADD COLUMN     "seasonStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."LocationBlock" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocationBlock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."LocationBlock" ADD CONSTRAINT "LocationBlock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
