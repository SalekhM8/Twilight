import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PaymentBadge from '@/components/PaymentBadge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Calendar, MapPin, User, Clock, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BookingConfirmationPageProps {
  params: Promise<{ id: string }>
}

export default async function BookingConfirmationPage({ params }: BookingConfirmationPageProps) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      treatment: true,
      location: true,
      pharmacist: true
    }
  })

  if (!booking) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TWILIGHT</h1>
                <p className="text-sm text-gray-600">More than just a Pharmacy</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">
            Your consultation has been successfully booked. We'll be in touch soon to confirm your appointment.
          </p>
          <div className="mt-4"><PaymentBadge bookingId={booking.id} initial={(booking as any).paymentStatus} /></div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Appointment Details</span>
              </CardTitle>
              <CardDescription>Your scheduled consultation information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{booking.treatment.name}</p>
                  <p className="text-sm text-gray-600">{booking.treatment.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  {booking.preferredTime === 'TBD' ? (
                    <>
                      <p className="font-semibold text-gray-900">Scheduling To Be Arranged</p>
                      <p className="text-sm text-gray-600">You will be contacted to book a slot.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.preferredDate).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">at {booking.preferredTime}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Duration: {booking.treatment.duration} minutes</p>
                  <p className="text-sm text-gray-600">Price: £{booking.treatment.price}</p>
                </div>
              </div>

              {booking.pharmacist && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.pharmacist.name}</p>
                    <p className="text-sm text-gray-600">Your assigned pharmacist</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Location Details</span>
              </CardTitle>
              <CardDescription>Where your appointment will take place</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{booking.location.name}</h3>
                <p className="text-gray-600 mb-4">{booking.location.address}</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{booking.location.phone}</p>
                  <p className="text-sm text-gray-600">Call us if you have any questions</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Opening Hours</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {(() => {
                    const hours = booking.location.openingHours as any
                    return Object.entries(hours).map(([day, time]: [string, any]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}:</span>
                        <span>
                          {time.open === 'closed' ? 'Closed' : `${time.open} - ${time.close}`}
                        </span>
                      </div>
                    ))
                  })()}
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Customer Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <span>Your Information</span>
            </CardTitle>
            <CardDescription>Contact details we have on file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{booking.customerEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{booking.customerPhone}</p>
              </div>
            </div>
            
            {booking.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Additional Notes</p>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">1</span>
                </div>
                <p>We'll review your booking and confirm your appointment within 24 hours</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">2</span>
                </div>
                <p>You'll receive a confirmation email with detailed appointment information</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold">3</span>
                </div>
                <p>Arrive 10 minutes early for your appointment with any relevant medical information</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="text-center mt-12 space-y-4">
          <div className="space-x-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
            <Link href="/consultation">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Book Another Consultation
              </Button>
            </Link>
            {booking.paymentStatus !== 'paid' && (
              <form action={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/checkout`} method="post" className="inline">
                <input type="hidden" name="bookingId" value={booking.id} />
                {/* This form is progressive enhancement backup; main flow uses client POST */}
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" formAction={`/api/checkout`}>
                  Pay now
                </Button>
              </form>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Booking Reference: <span className="font-mono font-semibold">{booking.id.slice(-8).toUpperCase()}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
