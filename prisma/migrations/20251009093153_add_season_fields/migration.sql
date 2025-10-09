-- AlterTable
ALTER TABLE "public"."Treatment" ADD COLUMN     "seasonEnd" TIMESTAMP(3),
ADD COLUMN     "seasonStart" TIMESTAMP(3);

-- Idempotent create of LocationBlock for environments where it does not yet exist
CREATE TABLE IF NOT EXISTS "public"."LocationBlock" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocationBlock_pkey" PRIMARY KEY ("id")
);

-- Add FK only if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'LocationBlock_locationId_fkey'
    ) THEN
        ALTER TABLE "public"."LocationBlock"
        ADD CONSTRAINT "LocationBlock_locationId_fkey"
        FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END$$;
