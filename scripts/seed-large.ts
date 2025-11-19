import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

async function main() {
  // Wipe data for a fresh large dataset in the target DB
  try { await prisma.$executeRawUnsafe('DEALLOCATE ALL') } catch {}
  await prisma.booking.deleteMany()
  await prisma.locationBlock.deleteMany()
  await prisma.pharmacistSchedule.deleteMany()
  await prisma.pharmacistTreatment.deleteMany()
  await prisma.treatmentLocation.deleteMany()
  await prisma.pharmacistLocation.deleteMany()
  await prisma.review.deleteMany()
  await prisma.treatment.deleteMany()
  await prisma.pharmacist.deleteMany()
  await prisma.location.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.certification.deleteMany()
  await prisma.teamMember.deleteMany()

  // Locations
  const locations = await prisma.$transaction([
    prisma.location.create({ data: { name: "Small Health", code: "SH", address: "309 Bolton Rd, Small Heath, Birmingham B10 0AU", phone: "0121 772 5955", openingHours: {
      monday: { open: "09:00", close: "18:00" }, tuesday: { open: "09:00", close: "18:00" }, wednesday: { open: "09:00", close: "18:00" }, thursday: { open: "09:00", close: "18:00" }, friday: { open: "09:00", close: "18:00" }, saturday: { open: "10:00", close: "16:00" }, sunday: { open: "closed", close: "closed" },
    } } }),
    prisma.location.create({ data: { name: "Kings Heath Branch", code: "KH", address: "128-130 High St, King's Heath, Birmingham B14 7LG", phone: "0121 444 1179", openingHours: {
      monday: { open: "09:00", close: "18:00" }, tuesday: { open: "09:00", close: "18:00" }, wednesday: { open: "09:00", close: "18:00" }, thursday: { open: "09:00", close: "18:00" }, friday: { open: "09:00", close: "18:00" }, saturday: { open: "10:00", close: "16:00" }, sunday: { open: "closed", close: "closed" },
    } } }),
    prisma.location.create({ data: { name: "Billesley", code: "BL", address: "698 Yardley Wood Rd, Billesley, Birmingham B13 0HY", phone: "0121 443 4559", openingHours: {
      monday: { open: "09:00", close: "18:00" }, tuesday: { open: "09:00", close: "18:00" }, wednesday: { open: "09:00", close: "18:00" }, thursday: { open: "09:00", close: "18:00" }, friday: { open: "09:00", close: "18:00" }, saturday: { open: "10:00", close: "16:00" }, sunday: { open: "closed", close: "closed" },
    } } }),
  ])

  // Pharmacists
  const pharmacists = await prisma.$transaction([
    prisma.pharmacist.create({ data: { name: "Usman Ali", email: "usman.ali@twilightpharmacy.com", phone: "0121 555 0101", bio: "Experienced pharmacist across services" } }),
    prisma.pharmacist.create({ data: { name: "Yusuf Ali", email: "yusuf.ali@twilightpharmacy.com", phone: "0121 555 0102", bio: "Clinical pharmacist with patient-first approach" } }),
    prisma.pharmacist.create({ data: { name: "Hamza Ali", email: "hamza.ali@twilightpharmacy.com", phone: "0121 555 0103", bio: "Skilled in consultations and minor ailments" } }),
    prisma.pharmacist.create({ data: { name: "Aisha Khan", email: "aisha.khan@twilightpharmacy.com", phone: "0121 555 0104", bio: "Travel health specialist" } }),
  ])

  // Schedules: Mon–Sun, 09:00–17:00 active
  const allDays = [0,1,2,3,4,5,6]
  await prisma.pharmacistSchedule.createMany({
    data: pharmacists.flatMap((p) => allDays.map((d) => ({ pharmacistId: p.id, dayOfWeek: d, startTime: "09:00", endTime: "17:00", isActive: true }))),
  })

  // Treatments (20 total; mix of travel, NHS, seasonal on/off)
  const baseTreatments: Array<{ name: string; category: string; price: number; duration: number; isTravel?: boolean; isNhs?: boolean; seasonal?: "in"|"out"|"future" }>= [
    { name: "Weight Loss", category: "Weight Loss", price: 50, duration: 30 },
    { name: "Women's Health", category: "Women's Health", price: 45, duration: 25 },
    { name: "Digestion", category: "Digestion", price: 40, duration: 20 },
    { name: "Erectile Dysfunction", category: "Erectile Dysfunction", price: 55, duration: 30 },
    { name: "Facial Hair Removal", category: "Facial Hair Removal", price: 35, duration: 45 },
    { name: "Hair Loss", category: "Hair Loss", price: 60, duration: 30 },
    { name: "Hay Fever and Allergy", category: "Hay Fever and Allergy", price: 30, duration: 20 },
    { name: "Ear Wax Removal", category: "Ear Wax Removal", price: 25, duration: 15 },
    { name: "Travel Vaccinations", category: "Travel", price: 65, duration: 25, isTravel: true, seasonal: "in" },
    { name: "Yellow Fever Vaccine", category: "Travel", price: 90, duration: 30, isTravel: true, seasonal: "out" },
    { name: "Flu Jab (NHS)", category: "NHS", price: 0, duration: 10, isNhs: true, seasonal: "in" },
    { name: "Smoking Cessation (NHS)", category: "NHS", price: 0, duration: 20, isNhs: true },
    { name: "Blood Pressure Check", category: "Health Check", price: 15, duration: 10 },
    { name: "Diabetes Check", category: "Health Check", price: 20, duration: 15 },
    { name: "Cholesterol Test", category: "Health Check", price: 25, duration: 15 },
    { name: "Shingles Vaccine", category: "Vaccinations", price: 110, duration: 20, seasonal: "future" },
    { name: "Typhoid Vaccine", category: "Travel", price: 45, duration: 15, isTravel: true },
    { name: "Rabies Vaccine", category: "Travel", price: 95, duration: 30, isTravel: true },
    { name: "Meningitis ACWY", category: "Travel", price: 65, duration: 15, isTravel: true },
    { name: "Chickenpox Vaccine", category: "Vaccinations", price: 75, duration: 20 },
  ]

  const today = new Date()
  const treatments = [] as { id: string; name: string }[]
  for (const t of baseTreatments) {
    const seasonStart = t.seasonal === "in" ? addDays(today, -10)
      : t.seasonal === "out" ? addDays(today, -120)
      : t.seasonal === "future" ? addDays(today, 20)
      : null
    const seasonEnd = t.seasonal === "in" ? addDays(today, 30)
      : t.seasonal === "out" ? addDays(today, -60)
      : t.seasonal === "future" ? addDays(today, 120)
      : null

    const created = await prisma.treatment.create({
      data: {
        name: t.name,
        description: `${t.name} service description for testing.`,
        category: t.category,
        price: t.price,
        duration: t.duration,
        isTravel: !!t.isTravel,
        isNhs: !!t.isNhs,
        showSlots: true,
        isActive: true,
        seasonStart: seasonStart,
        seasonEnd: seasonEnd,
      },
      select: { id: true, name: true },
    })
    treatments.push(created)
  }

  // Link all treatments to all locations
  await prisma.treatmentLocation.createMany({
    data: treatments.flatMap((tr) => locations.map((l) => ({ treatmentId: tr.id, locationId: l.id }))),
  })

  // Pharmacists can perform all treatments
  await prisma.pharmacistTreatment.createMany({
    data: pharmacists.flatMap((p) => treatments.map((tr) => ({ pharmacistId: p.id, treatmentId: tr.id }))),
  })

  // Location blocks: create some random blocks for next 7 days per location
  for (const l of locations) {
    const day0 = new Date(today)
    day0.setHours(0,0,0,0)
    const block1Start = addDays(day0, 1); block1Start.setHours(12, 0, 0, 0)
    const block1End = addDays(day0, 1); block1End.setHours(13, 30, 0, 0)
    const block2Start = addDays(day0, 3); block2Start.setHours(9, 0, 0, 0)
    const block2End = addDays(day0, 3); block2End.setHours(10, 0, 0, 0)
    await prisma.locationBlock.createMany({ data: [
      { locationId: l.id, start: block1Start, end: block1End, reason: "Staff meeting" },
      { locationId: l.id, start: block2Start, end: block2End, reason: "Clean down" },
    ]})
  }

  // Create many reviews (approved and pending)
  const reviewNames = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "Grace", "Hassan", "Isha", "Jack"]
  const reviewData = [] as any[]
  for (let i = 0; i < 60; i++) {
    const name = reviewNames[i % reviewNames.length]
    const rating = 1 + (i % 5)
    const isApproved = i % 3 !== 0
    reviewData.push({ name, email: `${name.toLowerCase()}@example.com`, rating, comment: `${name}'s review ${i+1} - great service!`, isApproved, locationId: locations[i % locations.length].id })
  }
  await prisma.review.createMany({ data: reviewData })

  // Generate bookings across next 10 days, multiple per day per location
  const timeSlots = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"]
  const statuses = ["pending","confirmed","completed"]
  const customers = ["Liam","Noah","Olivia","Emma","Ava","Sophia","Mia","Lucas","Mason","Amelia"]
  const bookingsToCreate: any[] = []
  for (let d = 0; d < 10; d++) {
    const date = addDays(today, d)
    date.setHours(0,0,0,0)
    for (const l of locations) {
      for (let k = 0; k < 6; k++) { // 6 bookings per location per day
        const treatment = treatments[(d * 7 + k) % treatments.length]
        const pharmacist = pharmacists[(d * 5 + k) % pharmacists.length]
        const time = timeSlots[(d * 3 + k) % timeSlots.length]
        const customerName = customers[(d * 2 + k) % customers.length] + " Tester"
        bookingsToCreate.push({
          treatmentId: treatment.id,
          pharmacistId: pharmacist.id,
          locationId: l.id,
          customerName,
          customerEmail: customerName.toLowerCase().replace(/\s+/g, '.') + "@mail.test",
          customerPhone: "07700111222",
          preferredDate: date,
          preferredTime: time,
          notes: k % 2 === 0 ? "Please call before appointment" : null,
          status: statuses[(d + k) % statuses.length],
        })
      }
    }
  }
  // Bulk insert bookings in batches
  const chunk = 100
  for (let i = 0; i < bookingsToCreate.length; i += chunk) {
    await prisma.booking.createMany({ data: bookingsToCreate.slice(i, i + chunk) })
  }

  // About data: certifications & team members
  await prisma.certification.createMany({ data: [
    { title: "MHRA", subtitle: "UK registered pharmacy", description: "Regulatory compliance.", order: 1, isActive: true },
    { title: "GPhC", subtitle: "GPhC regulated", description: "Pharmacy regulator.", order: 2, isActive: true },
    { title: "PCI DSS", subtitle: "Compliant", description: "Payment security.", order: 3, isActive: true },
  ]})
  await prisma.teamMember.createMany({ data: [
    { name: "Usman Ali", role: "Lead Pharmacist", bio: "Experienced pharmacist across services", order: 1, isActive: true },
    { name: "Yusuf Ali", role: "Clinical Pharmacist", bio: "Patient-first approach", order: 2, isActive: true },
    { name: "Hamza Ali", role: "Pharmacist", bio: "Minor ailments specialist", order: 3, isActive: true },
  ]})

  // Admin user
  const hashed = await bcrypt.hash("admin123", 12)
  await prisma.admin.create({ data: { email: "admin@twilightpharmacy.com", password: hashed, name: "Admin User", role: "admin", isActive: true } })

  console.log("Large dataset seeded successfully.")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })




