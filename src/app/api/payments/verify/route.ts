import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { sessionId, bookingId } = await req.json()
    if (!sessionId || !bookingId) return NextResponse.json({ error: "Missing sessionId/bookingId" }, { status: 400 })
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paid = session.payment_status === "paid"
    if (paid) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "paid",
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent as any)?.id,
          paidAt: new Date(),
          status: "confirmed",
        },
      })
    }
    return NextResponse.json({ paid })
  } catch (e) {
    return NextResponse.json({ error: "verify failed" }, { status: 500 })
  }
}


