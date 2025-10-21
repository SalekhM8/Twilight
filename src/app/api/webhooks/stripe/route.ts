import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any })
  const sig = req.headers.get("stripe-signature") || ""
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event
  try {
    const buf = Buffer.from(await req.arrayBuffer())
    if (!whSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET")
    event = stripe.webhooks.constructEvent(buf, sig, whSecret)
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = String(session.metadata?.bookingId || "")
        if (!bookingId) break
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: "paid",
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent as any)?.id,
            paidAt: new Date(),
            status: "confirmed",
          },
        })
        break
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent
        const bookingId = String((pi.metadata as any)?.bookingId || "")
        if (bookingId) {
          await prisma.booking.update({ where: { id: bookingId }, data: { paymentStatus: "failed" } })
        }
        break
      }
      default:
        break
    }
    return NextResponse.json({ received: true })
  } catch (e) {
    console.error("webhook handler error", e)
    return NextResponse.json({ error: "handler error" }, { status: 500 })
  }
}


