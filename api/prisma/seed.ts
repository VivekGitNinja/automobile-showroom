import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ─── 1. Admin User ─────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@apex.ae'
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123'
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('⚠️  ADMIN_PASSWORD not set — seeding with the default development password. Set ADMIN_PASSWORD before going live!')
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Apex Administrator',
      role: 'admin',
      isActive: true,
    },
  })
  console.log(`✅ Admin user created: ${admin.email}`)

  // ─── 2. Site Settings ──────────────────────────
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      showroomName: 'Apex Luxury Automobiles',
      address: 'Sheikh Zayed Road, Al Quoz Industrial 3, Dubai, UAE',
      phone: '+971 50 891 9441',
      whatsappNumber: '+971 50 891 9441',
      email: 'concierge@apex.ae',
      openingHours: 'Saturday – Thursday: 10:00 AM – 9:00 PM (GST)',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115535.48529555694!2d55.197063!3d25.1884351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae',
      socialLinks: {
        instagram: 'https://instagram.com/apex_luxury',
        facebook: 'https://facebook.com/apexluxury',
        twitter: 'https://twitter.com/apexluxury',
      },
    },
  })
  console.log(`✅ Site settings created: ${settings.showroomName}`)

  // ─── 3. FAQ Categories ─────────────────────────
  const categories = [
    { title: 'Financing & Payment', slug: 'financing', sortOrder: 1 },
    { title: 'Viewing & Booking', slug: 'viewing', sortOrder: 2 },
    { title: 'Sell Your Car', slug: 'sell-your-car', sortOrder: 3 },
    { title: 'Warranty & Inspection', slug: 'warranty', sortOrder: 4 },
    { title: 'Shipping & Import', slug: 'shipping', sortOrder: 5 },
    { title: 'Showroom & Location', slug: 'location', sortOrder: 6 },
  ]

  for (const cat of categories) {
    await prisma.faqCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        label: cat.title,
        slug: cat.slug,
        displayOrder: cat.sortOrder,
        isActive: true,
      },
    })
  }
  console.log(`✅ ${categories.length} FAQ categories created`)

  // ─── 4. Sample FAQs ────────────────────────────
  const financingCat = await prisma.faqCategory.findUnique({ where: { slug: 'financing' } })
  const viewingCat = await prisma.faqCategory.findUnique({ where: { slug: 'viewing' } })
  const sellCat = await prisma.faqCategory.findUnique({ where: { slug: 'sell-your-car' } })
  const warrantyCat = await prisma.faqCategory.findUnique({ where: { slug: 'warranty' } })

  const faqs = [
    {
      question: 'Do you offer financing for luxury vehicles?',
      answer: 'Yes, we partner with leading UAE banks and financial institutions to offer competitive financing options. Our concierge team will assist you with the entire process, including documentation and approval.',
      keywords: ['finance', 'loan', 'emi', 'payment', 'installment', 'bank'],
      categoryId: financingCat?.id,
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, certified cheques, and major credit/debit cards. Cash transactions follow UAE regulatory guidelines. Our finance team can guide you through the best payment option.',
      keywords: ['payment', 'credit card', 'bank transfer', 'cash', 'cheque'],
      categoryId: financingCat?.id,
    },
    {
      question: 'Can I schedule a private viewing?',
      answer: 'Absolutely. We offer private showroom viewings by appointment. Contact our concierge team via WhatsApp or the booking form to schedule a viewing at your convenience.',
      keywords: ['viewing', 'appointment', 'visit', 'showroom', 'schedule', 'book'],
      categoryId: viewingCat?.id,
    },
    {
      question: 'Do you offer test drives?',
      answer: 'Test drives are available for select vehicles by appointment only. Please contact our sales team to discuss availability and requirements.',
      keywords: ['test drive', 'drive', 'try'],
      categoryId: viewingCat?.id,
    },
    {
      question: 'How can I sell my car through your showroom?',
      answer: 'Simply fill out our "Sell Your Car" form with your vehicle details and photos. Our acquisition team will evaluate your vehicle and provide a competitive offer within 24 hours.',
      keywords: ['sell', 'trade', 'buy my car', 'valuation'],
      categoryId: sellCat?.id,
    },
    {
      question: 'Do all vehicles come with a warranty?',
      answer: 'Most vehicles in our inventory come with remaining manufacturer warranty or our comprehensive in-house warranty. Warranty details are listed on each vehicle\'s detail page.',
      keywords: ['warranty', 'guarantee', 'coverage', 'protection'],
      categoryId: warrantyCat?.id,
    },
    {
      question: 'Are your vehicles inspected before sale?',
      answer: 'Every vehicle undergoes a rigorous multi-point inspection by our certified technicians before being listed. We provide full inspection reports and vehicle history documentation.',
      keywords: ['inspection', 'check', 'condition', 'history', 'report'],
      categoryId: warrantyCat?.id,
    },
  ]

  let faqCount = 0
  for (const faq of faqs) {
    if (faq.categoryId) {
      // Idempotent: never duplicate a question that already exists
      const existing = await prisma.faq.findFirst({
        where: { question: faq.question, categoryId: faq.categoryId },
      })
      if (existing) continue
      await prisma.faq.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          keywords: faq.keywords,
          categoryId: faq.categoryId,
          displayOrder: faqCount + 1,
          isActive: true,
          createdBy: admin.id,
        },
      })
      faqCount++
    }
  }
  console.log(`✅ ${faqCount} sample FAQs created`)

  // ─── 5. Sample Brands ──────────────────────────
  const brands = [
    { name: 'Rolls-Royce', slug: 'rolls-royce', description: 'The pinnacle of bespoke luxury and effortless power.' },
    { name: 'Bugatti', slug: 'bugatti', description: 'Unmatched W16 hypercar engineering and speed mastery.' },
    { name: 'Ferrari', slug: 'ferrari', description: 'Pure Italian racing heritage and electrifying performance.' },
    { name: 'Lamborghini', slug: 'lamborghini', description: 'Extroverted design, atmospheric V12 sound, and raw emotion.' },
    { name: 'Porsche', slug: 'porsche', description: 'Precision engineering, track-focused GT models, and iconic silhouettes.' },
    { name: 'Mercedes-Benz', slug: 'mercedes-benz', description: 'German engineering excellence, innovation and luxury since 1886.' },
    { name: 'Bentley', slug: 'bentley', description: 'Handcrafted luxury grand tourers from Crewe, England.' },
    { name: 'McLaren', slug: 'mclaren', description: 'Lightweight, mid-engine supercars born from Formula 1 technology.' },
    { name: 'Aston Martin', slug: 'aston-martin', description: 'British grand touring excellence and timeless sophistication.' },
    { name: 'Pagani', slug: 'pagani', description: 'Artisanal Italian hypercars where science meets art.' },
  ]

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
      },
    })
  }
  console.log(`✅ ${brands.length} brands created`)

  // ─── 6. Sample Vehicles ────────────────────────
  const sampleVehicles = [
    { make: 'Rolls-Royce', model: 'Phantom', trim: 'Series VIII', year: 2023, price: 2500000, mileage: '500', transmission: 'Automatic', fuelType: 'Petrol', bodyType: 'Sedan', exteriorColor: 'Black', interiorColor: 'Tan', engine: '6.75L V12', status: 'published', isFeatured: true, brandSlug: 'rolls-royce' },
    { make: 'Ferrari', model: 'SF90 Stradale', trim: 'Assetto Fiorano', year: 2022, price: 1800000, mileage: '1200', transmission: 'Automatic', fuelType: 'Hybrid', bodyType: 'Coupe', exteriorColor: 'Red', interiorColor: 'Black', engine: '4.0L V8', status: 'published', isFeatured: true, brandSlug: 'ferrari' },
    { make: 'Lamborghini', model: 'Urus', trim: 'Performante', year: 2024, price: 1500000, mileage: '100', transmission: 'Automatic', fuelType: 'Petrol', bodyType: 'SUV', exteriorColor: 'Yellow', interiorColor: 'Black', engine: '4.0L V8 Twin-Turbo', status: 'published', isFeatured: false, brandSlug: 'lamborghini' },
    { make: 'Porsche', model: '911', trim: 'GT3 RS', year: 2023, price: 1200000, mileage: '800', transmission: 'PDK', fuelType: 'Petrol', bodyType: 'Coupe', exteriorColor: 'Silver', interiorColor: 'Red', engine: '4.0L Flat-6', status: 'published', isFeatured: true, brandSlug: 'porsche' },
    { make: 'Mercedes-Benz', model: 'G-Class', trim: 'G63 AMG', year: 2023, price: 850000, mileage: '1500', transmission: 'Automatic', fuelType: 'Petrol', bodyType: 'SUV', exteriorColor: 'White', interiorColor: 'Red', engine: '4.0L V8 Biturbo', status: 'published', isFeatured: false, brandSlug: 'mercedes-benz' },
  ]

  let vehicleCount = 0
  for (const v of sampleVehicles) {
    const brand = await prisma.brand.findUnique({ where: { slug: v.brandSlug } })
    if (brand) {
      await prisma.vehicle.upsert({
        where: { slug: `${v.make}-${v.model}-${v.year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
        update: {},
        create: {
          brandId: brand.id,
          make: v.make,
          model: v.model,
          trim: v.trim,
          year: v.year,
          slug: `${v.make}-${v.model}-${v.year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          price: v.price,
          mileage: v.mileage,
          transmission: v.transmission,
          fuelType: v.fuelType,
          bodyType: v.bodyType,
          exteriorColor: v.exteriorColor,
          interiorColor: v.interiorColor,
          engine: v.engine,
          // @ts-ignore
          status: v.status,
          isFeatured: v.isFeatured,
          isCertified: true,
          hasServiceHistory: true,
          hasInspectionReport: true,
          hasWarranty: true,
          financeAvailable: true,
          exportAvailable: true,
          gccVerified: true,
          noAccidents: true,
          originalPaint: true,
          createdBy: admin.id,
        }
      })
      vehicleCount++
    }
  }
  console.log(`✅ ${vehicleCount} sample vehicles created`)

  // ─── 7. Parts Categories & Catalog ─────────────
  const partCategories = [
    { name: 'Wheels & Tyres', slug: 'wheels-tyres', description: 'Forged wheels, performance tyres and TPMS sensors.', displayOrder: 1 },
    { name: 'Brakes', slug: 'brakes', description: 'Carbon-ceramic discs, pads and big-brake kits.', displayOrder: 2 },
    { name: 'Exterior & Carbon', slug: 'exterior-carbon', description: 'Carbon fibre aero, body panels and styling.', displayOrder: 3 },
    { name: 'Interior & Comfort', slug: 'interior-comfort', description: 'Bespoke trim, detailing and comfort upgrades.', displayOrder: 4 },
    { name: 'Service Parts', slug: 'service-parts', description: 'Genuine filters, fluids and wear components.', displayOrder: 5 },
  ]

  const partCatIds: Record<string, string> = {}
  for (const cat of partCategories) {
    const existing = await prisma.partCategory.findUnique({ where: { slug: cat.slug } })
    if (existing) {
      partCatIds[cat.slug] = existing.id
      continue
    }
    const created = await prisma.partCategory.create({ data: cat })
    partCatIds[cat.slug] = created.id
  }
  console.log(`✅ ${partCategories.length} part categories ensured`)

  const sampleParts = [
    { sku: 'APX-WHL-001', name: '21" Forged Monoblock Wheel Set', categorySlug: 'wheels-tyres', brandName: 'Apex Forged', condition: 'NEW', price: 48000, stockQty: 6, compatibleMakes: ['Ferrari', 'Lamborghini', 'Porsche'], description: 'Aerospace-grade 6061-T6 forged aluminium monoblock wheels, finished in satin graphite. Weight-optimized motorsport design with load ratings certified for UAE highway conditions.' },
    { sku: 'APX-WHL-002', name: 'Michelin Pilot Sport Cup 2 R (Set of 4)', categorySlug: 'wheels-tyres', brandName: 'Michelin', condition: 'NEW', price: 12400, stockQty: 12, compatibleMakes: ['Ferrari', 'Porsche', 'Lamborghini'], description: 'Track-homologated semi-slick tyres with Bi-Compound technology. The reference for hypercar performance on road and circuit.' },
    { sku: 'APX-BrK-001', name: 'Carbon-Ceramic Brake Disc Set', categorySlug: 'brakes', brandName: 'Brembo', condition: 'NEW', price: 96000, stockQty: 3, compatibleMakes: ['Ferrari', 'Lamborghini', 'Bentley'], description: 'Genuine Brembo carbon-ceramic rotor set with Red Devil pads. Fade-free braking and 60% unsprung weight reduction versus steel.' },
    { sku: 'APX-BrK-002', name: 'Big Brake Kit — 8-Piston Front', categorySlug: 'brakes', brandName: 'APX Performance', condition: 'NEW', price: 62000, stockQty: 4, compatibleMakes: ['Mercedes-Benz', 'Porsche'], description: 'Complete 8-piston monobloc caliper conversion with stainless lines and pads. Street and track calibrated.' },
    { sku: 'APX-CF-001', name: 'Carbon Fibre Front Lip Splitter', categorySlug: 'exterior-carbon', brandName: 'Apex Carbon', condition: 'NEW', price: 18500, stockQty: 8, compatibleMakes: ['Lamborghini', 'Ferrari'], description: 'Pre-preg autoclaved carbon fibre front splitter with UV-stable clear coat. Direct bolt-on fitment with included hardware.' },
    { sku: 'APX-CF-002', name: 'Carbon Fibre Side Skirt Blades', categorySlug: 'exterior-carbon', brandName: 'Apex Carbon', condition: 'NEW', price: 14900, stockQty: 7, compatibleMakes: ['Lamborghini'], description: 'Aero side skirt blades in visible twill weave. Feather-light, motorsport-derived profile.' },
    { sku: 'APX-INT-001', name: 'Bespoke Alcantara Interior Trim Set', categorySlug: 'interior-comfort', brandName: 'Apex Bespoke', condition: 'NEW', price: 32400, stockQty: 2, compatibleMakes: ['Rolls-Royce', 'Bentley'], description: 'Hand-trimmed Alcantara and carbon interior set. Configured per vehicle — contact the concierge for colourways.' },
    { sku: 'APX-SRV-001', name: 'Genuine Oil Service Kit', categorySlug: 'service-parts', brandName: 'OEM', condition: 'NEW', price: 3200, stockQty: 25, compatibleMakes: ['Ferrari', 'Lamborghini', 'Porsche', 'Bentley', 'Rolls-Royce', 'Mercedes-Benz'], description: 'Factory oil filter, magnetic drain plug and full-synthetic 0W-40 fill. The exact kit our workshop uses for in-house services.' },
    { sku: 'APX-SRV-002', name: 'Cabin Air Filter — Activated Carbon', categorySlug: 'service-parts', brandName: 'OEM', condition: 'NEW', price: 640, stockQty: 40, compatibleMakes: ['Mercedes-Benz', 'Porsche'], description: 'Activated-carbon cabin filter for desert dust and allergen filtration. Genuine OEM part.' },
    { sku: 'APX-WHL-003', name: 'TPMS Sensor Set (4 pcs)', categorySlug: 'wheels-tyres', brandName: 'OEM', condition: 'NEW', price: 2100, stockQty: 15, compatibleMakes: ['Ferrari', 'Lamborghini', 'Porsche', 'Rolls-Royce', 'Bentley', 'Mercedes-Benz'], description: 'Pre-programmed tyre pressure monitoring sensors with metal valve stems. Supplied in sets of four.' },
    { sku: 'APX-BrK-003', name: 'Performance Brake Pads — Track Compound', categorySlug: 'brakes', brandName: 'APX Performance', condition: 'NEW', price: 5800, stockQty: 10, compatibleMakes: ['Porsche', 'Ferrari'], description: 'Track-focused pad compound with high initial bite and consistent friction at extreme temperatures. For motorsport use; not recommended for daily street driving.' },
    { sku: 'APX-SRV-003', name: 'Showroom-Refurbished Alloy Wheel', categorySlug: 'wheels-tyres', brandName: 'OEM', condition: 'REFURBISHED', price: 7800, stockQty: 3, compatibleMakes: ['Mercedes-Benz', 'Bentley'], description: 'Factory alloy wheel professionally refurbished to as-new standard by our certified paint shop. Fully inspected and balanced.' },
  ]

  let partCount = 0
  for (const p of sampleParts) {
    const existing = await prisma.part.findUnique({ where: { sku: p.sku } })
    if (existing) continue
    const slug = `${p.name}-${p.sku}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    await prisma.part.create({
      data: {
        slug,
        sku: p.sku,
        name: p.name,
        description: p.description,
        categoryId: partCatIds[p.categorySlug],
        brandName: p.brandName,
        compatibleMakes: p.compatibleMakes,
        // @ts-ignore
        condition: p.condition,
        price: p.price,
        stockQty: p.stockQty,
        status: 'PUBLISHED',
        displayOrder: partCount + 1,
      },
    })
    partCount++
  }
  console.log(`✅ ${partCount} sample parts created`)

  // ─── 8. Journal Posts ──────────────────────────
  const journalPosts = [
    {
      slug: 'apex-showroom-dubai-grand-tour',
      title: 'Inside the Apex Collection: A Grand Tour of Our Dubai Showroom',
      category: 'Showroom',
      snippet: 'From temperature-controlled vitrines to a private viewing lounge, take a walk through the space built for the world\'s rarest motorcars.',
      content: 'Behind a discreet façade on Sheikh Zayed Road sits one of the most concentrated collections of hypercars in the Middle East.\n\nEvery vehicle in our inventory is housed in a climate-controlled environment with dedicated air circulation for each bay — the same standard expected by collectors whose cars are the only examples of their kind in the region.\n\nThe showroom floor is intentionally minimal. Lighting is tuned to a colour temperature that reveals paint depth the way daylight would, and each display position is chosen so no car competes for attention. Our private viewing lounge allows clients to examine documentation, provenance files and inspection reports in complete confidentiality.\n\nViewings are by appointment. Our concierge team arranges everything — including discreet vehicle transfers for clients who prefer to evaluate a car away from the public floor.',
      imageUrl: '/images/hero/hero-car-1.jpg',
      readTime: '4 min read',
      tags: ['showroom', 'dubai', 'collection'],
    },
    {
      slug: 'buying-a-hypercar-in-dubai-guide',
      title: 'Buying a Hypercar in Dubai: The Complete 2026 Guide',
      category: 'Intelligence',
      snippet: 'Import duties, GCC specifications, insurance and registration — everything a buyer needs to know before acquiring a hypercar in the UAE.',
      content: 'Dubai is one of the most liquid hypercar markets in the world, but buying well requires understanding a few local specifics.\n\nFirst, specification. GCC-specification cars are built for desert heat, with upgraded cooling, dust sealing and air conditioning. They command a premium at resale here, while non-GCC imports can be excellent value for collectors planning to export.\n\nSecond, documentation. Every vehicle we list carries a verified history file: service records, accident history and — for cars imported by us — the full customs and shipping dossier. Never acquire a car of this value without an independent inspection; our own workshop provides exactly that for every listing.\n\nThird, ownership costs. Insurance for hypercars in the UAE typically runs 1.5–3% of agreed value annually, and comprehensive cover is available from several specialist underwriters in the DIFC.\n\nOur acquisition desk handles the entire process — sourcing, inspection, import logistics, registration and delivery — as a single managed engagement.',
      imageUrl: '/images/hero/hero-car-4.jpg',
      readTime: '7 min read',
      tags: ['buying guide', 'dubai', 'acquisition'],
    },
    {
      slug: 'genuine-parts-oem-vs-aftermarket',
      title: 'OEM vs Aftermarket: Protecting the Value of Your Supercar',
      category: 'Service',
      snippet: 'Why the parts fitted to your car matter as much as who fits them — a workshop chief\'s perspective on genuine components and documented service.',
      content: 'A supercar is a system. Its braking, cooling, aero and electronics are calibrated as a whole, which is why component substitution carries risks far beyond the part itself.\n\nGenuine OEM parts preserve three things: safety calibration, warranty eligibility and — most importantly for owners in this market — resale value. A documented all-OEM service history can be worth tens of thousands of dirhams at resale, because the next buyer inherits certainty.\n\nThat said, select aftermarket components — properly homologated wheels, track brake compounds, carbon aero — have their place, particularly for cars driven on circuit. Our parts counter stocks both genuine and carefully vetted performance components, and our advisors will tell you plainly which is right for your use.\n\nEvery part we sell is logged against the vehicle it is fitted to, building the documented history that protects your investment.',
      imageUrl: '/images/journals/journal_1.jpg',
      readTime: '5 min read',
      tags: ['service', 'parts', 'oem'],
    },
  ]

  let journalCount = 0
  for (const post of journalPosts) {
    const existing = await prisma.journal.findUnique({ where: { slug: post.slug } })
    if (existing) continue
    await prisma.journal.create({
      data: {
        ...post,
        // @ts-ignore
        status: 'PUBLISHED',
      },
    })
    journalCount++
  }
  console.log(`✅ ${journalCount} journal posts created`)

  // ─── 9. Parts & Service FAQs ───────────────────
  const partsFaqCat = await prisma.faqCategory.findUnique({ where: { slug: 'parts-service' } })
  if (!partsFaqCat) {
    const createdCat = await prisma.faqCategory.create({
      data: {
        label: 'Parts & Service',
        slug: 'parts-service',
        icon: 'wrench',
        displayOrder: 6,
      },
    })
    const partsFaqs = [
      {
        question: 'Do you sell genuine spare parts for luxury and supercars?',
        answer: 'Yes. Our parts counter stocks genuine OEM components plus carefully vetted performance parts — wheels, brakes, carbon aero, service items — for the marques we represent. Browse the catalogue at /parts or contact the concierge for availability.',
        keywords: ['parts', 'spare', 'spare parts', 'components', 'genuine', 'oem', 'catalog'],
      },
      {
        question: 'Can you source a part that is not in your catalogue?',
        answer: 'In most cases, yes. Our parts desk orders directly from factory channels in Europe and the Gulf. Typical lead time is 5–14 working days depending on the marque. Send us your vehicle VIN and the part requirement via WhatsApp or the enquiry form.',
        keywords: ['source', 'order', 'special order', 'vin', 'lead time', 'unavailable'],
      },
      {
        question: 'Do you fit the parts you sell?',
        answer: 'Yes. Our certified workshop installs everything we sell, and every installation is logged against your vehicle\'s service history — which protects warranty eligibility and resale value.',
        keywords: ['install', 'fit', 'fitting', 'workshop', 'service', 'mechanic'],
      },
      {
        question: 'Do you service and maintain vehicles bought elsewhere?',
        answer: 'Absolutely. Our workshop services all marques we represent regardless of where the vehicle was purchased, including pre-purchase inspections and full condition reports.',
        keywords: ['maintenance', 'inspection', 'pre-purchase', 'service outside', 'workshop'],
      },
    ]
    for (const f of partsFaqs) {
      const existing = await prisma.faq.findFirst({ where: { question: f.question, categoryId: createdCat.id } })
      if (existing) continue
      await prisma.faq.create({
        data: {
          question: f.question,
          answer: f.answer,
          keywords: f.keywords,
          categoryId: createdCat.id,
          displayOrder: (createdCat as any).displayOrder || 6,
          isActive: true,
          createdBy: admin.id,
        },
      })
    }
    console.log('✅ Parts & Service FAQ category created with 4 FAQs')
  } else {
    console.log('ℹ️  Parts & Service FAQ category already exists — skipped')
  }

  console.log('\n🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
