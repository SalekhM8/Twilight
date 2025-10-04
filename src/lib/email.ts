import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  html: string
}

let transporter: nodemailer.Transporter | null = null

function getTransport(): nodemailer.Transporter | null {
  if (transporter) return transporter
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM
  if (!host || !user || !pass || !from) {
    // Missing configuration; operate in no-op mode
    return null
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
  return transporter
}

export async function sendMail(options: MailOptions): Promise<{ ok: boolean; id?: string; error?: string }>{
  const from = process.env.SMTP_FROM || 'no-reply@twilightpharmacy.com'
  const t = getTransport()
  if (!t) {
    // Graceful fallback: log only
    try {
      console.log('[mail:noop]', { ...options, from })
    } catch {}
    return { ok: true, id: 'noop' }
  }
  try {
    const info = await t.sendMail({ from, to: options.to, subject: options.subject, html: options.html })
    return { ok: true, id: info.messageId }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Failed to send email' }
  }
}

export function renderBookingEmail(params: {
  customerName: string
  treatmentName: string
  locationName: string
  locationPhone?: string
  preferredDate?: Date
  preferredTime?: string
  durationMins?: number
  price?: number
  notes?: string | null
  bookingId: string
}) {
  const { customerName, treatmentName, locationName, locationPhone, preferredDate, preferredTime, durationMins, price, notes, bookingId } = params
  const dateStr = preferredTime === 'TBD' || !preferredDate
    ? 'To be arranged'
    : new Date(preferredDate).toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const safe = (v: unknown) => (v === undefined || v === null ? '' : String(v))
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2 style="color:#36c3f0;margin:0 0 8px">Your booking is confirmed</h2>
    <p>Hi ${safe(customerName)},</p>
    <p>Thanks for booking with Twilight Pharmacy. Here are your appointment details:</p>
    <table style="border-collapse:collapse;width:100%;max-width:560px">
      <tbody>
        <tr><td style="padding:6px 0;color:#555">Treatment</td><td style="padding:6px 0;font-weight:600">${safe(treatmentName)}</td></tr>
        <tr><td style="padding:6px 0;color:#555">Location</td><td style="padding:6px 0;font-weight:600">${safe(locationName)}</td></tr>
        <tr><td style="padding:6px 0;color:#555">When</td><td style="padding:6px 0;font-weight:600">${dateStr}${preferredTime && preferredTime !== 'TBD' ? ` · ${preferredTime}` : ''}</td></tr>
        ${durationMins ? `<tr><td style="padding:6px 0;color:#555">Duration</td><td style="padding:6px 0;font-weight:600">${durationMins} minutes</td></tr>` : ''}
        ${price !== undefined ? `<tr><td style="padding:6px 0;color:#555">Price</td><td style="padding:6px 0;font-weight:600">£${price}</td></tr>` : ''}
        ${notes ? `<tr><td style=\"padding:6px 0;color:#555\">Notes</td><td style=\"padding:6px 0\">${safe(notes)}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#555">Reference</td><td style="padding:6px 0;font-family:ui-monospace,Menlo,Consolas,monospace">${safe(bookingId).slice(-8).toUpperCase()}</td></tr>
      </tbody>
    </table>
    <p style="margin-top:16px;color:#333">If you cannot attend, please ${locationPhone ? `call ${locationPhone}` : 'contact us or reply to this email'} as soon as possible.</p>
    <p style="margin-top:6px;color:#333">If we need to make any changes on our side, we will contact you.</p>
    <p style="color:#555">Twilight Pharmacy</p>
  </div>
  `
}


