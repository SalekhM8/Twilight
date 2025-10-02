import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    // Clear any lingering prepared statements in local Postgres (prevents 42P05 during rapid dev cycles)
    await prisma.$executeRawUnsafe('DEALLOCATE ALL')
  } catch {}
  await prisma.booking.deleteMany()
  await prisma.pharmacistSchedule.deleteMany()
  await prisma.pharmacistTreatment.deleteMany()
  await prisma.treatmentLocation.deleteMany()
  await prisma.pharmacistLocation.deleteMany()
  await prisma.pharmacist.deleteMany()
  await prisma.treatment.deleteMany()
  await prisma.location.deleteMany()
  await prisma.admin.deleteMany()
  // Skip About-related seeding; client will manage via Admin

  // Create locations
  const smallHealth = await prisma.location.create({
    data: {
      name: "Small Health",
      code: "SH",
      address: "309 Bolton rd, Small heath Birmingham B10 0AU",
      phone: "0121 772 5955",
      openingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "17:00" },
        sunday: { open: "10:00", close: "16:00" },
      },
    },
  })

  const kingsHeath = await prisma.location.create({
    data: {
      name: "Kings Heath Branch",
      code: "KH",
      address: "128-130 High St, King's Heath, Birmingham, B14 7LG",
      phone: "0121 444 1179",
      openingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "17:00" },
        sunday: { open: "10:00", close: "16:00" },
      },
    },
  })

  const billesley = await prisma.location.create({
    data: {
      name: "Billesley",
      code: "BL",
      address: "698 Yardley Wood Rd, Billesley, Birmingham B13 0HY",
      phone: "0121 443 4559",
      openingHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "09:00", close: "17:00" },
        sunday: { open: "10:00", close: "16:00" },
      },
    },
  })

  // Treatments
  const treatments = await prisma.$transaction([
    prisma.treatment.create({ data: { name: "Weight Loss", description: "Professional weight management consultation and treatment", category: "Weight Loss", price: 50, duration: 30, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Women's Health", description: "Comprehensive women's health consultations", category: "Women's Health", price: 45, duration: 25, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Digestion", description: "Digestive health assessment and treatment", category: "Digestion", price: 40, duration: 20, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Erectile Dysfunction", description: "Confidential consultation and treatment for ED", category: "Erectile Dysfunction", price: 55, duration: 30, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Facial Hair Removal", description: "Professional facial hair removal services", category: "Facial Hair Removal", price: 35, duration: 45, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Hair Loss", description: "Hair loss assessment and treatment options", category: "Hair Loss", price: 60, duration: 30, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Hay Fever and Allergy", description: "Allergy testing and hay fever treatment", category: "Hay Fever and Allergy", price: 30, duration: 20, isTravel: false } }),
    prisma.treatment.create({ data: { name: "Ear Wax Removal", description: "Professional ear wax removal service", category: "Ear Wax Removal", price: 25, duration: 15, isTravel: false } }),
    prisma.treatment.create({ data: { name: "HGV, PCV & Taxi Medicals", description: "Medical examinations for professional drivers", category: "HGV, PCV & Taxi Medicals", price: 80, duration: 45, isTravel: true } }),
  ])

  // Pharmacists (full availability; all locations; all treatments)
  const usman = await prisma.pharmacist.create({ data: { name: "Usman Ali", email: "usman.ali@twilightpharmacy.com", phone: "0121 555 0101", bio: "Experienced pharmacist across services" } })
  const yusuf = await prisma.pharmacist.create({ data: { name: "Yusuf Ali", email: "yusuf.ali@twilightpharmacy.com", phone: "0121 555 0102", bio: "Clinical pharmacist with patient-first approach" } })
  const hamza = await prisma.pharmacist.create({ data: { name: "Hamza Ali", email: "hamza.ali@twilightpharmacy.com", phone: "0121 555 0103", bio: "Skilled in consultations and minor ailments" } })

  const allLocationIds = [smallHealth.id, kingsHeath.id, billesley.id]
  const allPharmacistIds = [usman.id, yusuf.id, hamza.id]

  // Link pharmacists to all locations
  await prisma.pharmacistLocation.createMany({
    data: allPharmacistIds.flatMap((pid) => allLocationIds.map((lid) => ({ pharmacistId: pid, locationId: lid }))),
  })

  // Treatments available at all locations
  await prisma.treatmentLocation.createMany({
    data: treatments.flatMap((t) => allLocationIds.map((lid) => ({ treatmentId: t.id, locationId: lid }))),
  })

  // Pharmacists can perform all treatments
  await prisma.pharmacistTreatment.createMany({
    data: allPharmacistIds.flatMap((pid) => treatments.map((t) => ({ pharmacistId: pid, treatmentId: t.id }))),
  })

  // Schedules: full week 09:00-17:00 (Mon-Sun)
  const days = [0,1,2,3,4,5,6]
  await prisma.pharmacistSchedule.createMany({
    data: allPharmacistIds.flatMap((pid) => days.map((d) => ({ pharmacistId: pid, dayOfWeek: d, startTime: "09:00", endTime: "17:00", isActive: true }))),
  })

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)
  await prisma.admin.create({ data: { email: "admin@twilightpharmacy.com", password: hashedPassword, name: "Admin User" } })

  console.log("Database seeded successfully with Usman, Yusuf, Hamza and full availability.")

  // About Us: Certifications (from provided screenshot content)
  await prisma.certification.createMany({
    data: [
      {
        title: "MHRA",
        subtitle: "UK registered pharmacy",
        description: "The MHRA regulates medicines and medical devices in the UK.",
        icon: "mhra",
        order: 1,
      },
      {
        title: "General Pharmaceutical Council",
        subtitle: "GPhC regulated pharmacy",
        description: "The GPhC regulates pharmacists, pharmacy technicians and pharmacies in Great Britain.",
        icon: "gphc",
        order: 2,
      },
      {
        title: "PCI DSS Compliant",
        subtitle: "PCI DSS Compliant",
        description: "PCI DSS is an information security standard for organisations that handle credit card payments.",
        icon: "pci",
        order: 3,
      },
      {
        title: "ICO registered website",
        subtitle: "ICO registered website",
        description: "The UK's independent authority set up to uphold information rights in the public interest.",
        icon: "ico",
        order: 4,
      },
    ],
  })

  await prisma.teamMember.createMany({
    data: [
      { name: "Usman Ali", role: "Lead Pharmacist", bio: "Experienced pharmacist across services", imageUrl: null, order: 1 },
      { name: "Yusuf Ali", role: "Clinical Pharmacist", bio: "Clinical pharmacist with patient-first approach", imageUrl: null, order: 2 },
      { name: "Hamza Ali", role: "Pharmacist", bio: "Skilled in consultations and minor ailments", imageUrl: null, order: 3 },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
