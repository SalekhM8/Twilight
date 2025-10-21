import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { bookingId } = body as { bookingId: string }
    if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 })

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { treatment: true },
    })
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })

    const amountPence = Math.round(Number(booking.treatment.price) * 100)
    const currency = (booking.paymentCurrency || "gbp").toLowerCase()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            unit_amount: amountPence,
            currency,
            product_data: {
              name: booking.treatment.name,
              description: booking.treatment.description || undefined,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: booking.customerEmail,
      // Help dashboard grouping per email
      customer_creation: "if_required",
      client_reference_id: booking.id,
      metadata: { bookingId: booking.id },
      // Include the session id in success URL so the confirmation page can verify immediately
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-confirmation/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking-confirmation/${booking.id}?cancelled=1`,
    })

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentAmount: amountPence,
        paymentCurrency: currency,
        stripeCheckoutSessionId: session.id,
        paymentStatus: "pending",
      },
    })

    return NextResponse.json({ id: session.id, url: session.url })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}


