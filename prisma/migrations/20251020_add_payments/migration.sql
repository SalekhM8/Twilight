-- Add payment fields to Booking
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS "paymentAmount" INTEGER,
  ADD COLUMN IF NOT EXISTS "paymentCurrency" TEXT DEFAULT 'gbp',
  ADD COLUMN IF NOT EXISTS "stripeCheckoutSessionId" TEXT,
  ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT,
  ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP;



