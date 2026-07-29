import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing old data...')
  await prisma.journal.deleteMany()
  await prisma.vehicleHotspot.deleteMany()
  await prisma.vehicleSpecConfig.deleteMany()
  await prisma.vehicleImage.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.brand.deleteMany()

  console.log('Seeding Brand...')
  const bugatti = await prisma.brand.create({
    data: {
      name: 'Bugatti',
      slug: 'bugatti',
      description: 'French manufacturer of high-performance automobiles.',
    },
  })

  console.log('Seeding Vehicle...')
  const chiron = await prisma.vehicle.create({
    data: {
      make: 'Bugatti',
      model: 'Chiron',
      trim: 'Super Sport',
      year: 2026,
      slug: 'bugatti-chiron-super-sport-2026',
      price: 3900000,
      currency: 'USD',
      mileage: '150 km',
      status: 'published',
      isFeatured: true,
      brandId: bugatti.id,
    },
  })

  console.log('Seeding VehicleImages...')
  await prisma.vehicleImage.create({
    data: {
      vehicleId: chiron.id,
      urlOriginal: '/images/dynamic/bugatti_exterior.jpg',
      isPrimary: true,
    },
  })

  console.log('Seeding VehicleHotspots...')
  await prisma.vehicleHotspot.createMany({
    data: [
      {
        vehicleId: chiron.id,
        title: '8.0L Quad-Turbo W16',
        subtitle: 'Heart of the Hypercar',
        details: 'Hand-assembled in Molsheim. The W16 powertrain utilizes four sequential turbochargers and titanium components to deliver relentless, uninterrupted acceleration.',
        stat: '1,578 HP • 1,600 Nm Torque',
        xPosition: 35,
        yPosition: 55,
        iconType: 'Zap',
        partImageUrl: '/images/dynamic/hotspot_engine.jpg',
      },
      {
        vehicleId: chiron.id,
        title: 'Carbon Ceramic Brakes',
        subtitle: 'Aerospace-Grade Stopping Power',
        details: 'Massive 420mm carbon-silicon carbide composite rotors clamped by 8-piston titanium calipers. Capable of absorbing brutal thermal loads on the track.',
        stat: '420mm Rotors • 8-Piston Calipers',
        xPosition: 22,
        yPosition: 72,
        iconType: 'Disc',
        partImageUrl: '/images/dynamic/hotspot_brakes.jpg',
      },
      {
        vehicleId: chiron.id,
        title: 'Carbon Monocoque',
        subtitle: 'LMP1-Level Rigidity',
        details: 'A bespoke carbon fiber architecture providing 50,000 Nm per degree of torsional rigidity, ensuring razor-sharp handling and ultimate passenger safety.',
        stat: '50,000 Nm/deg Rigidity',
        xPosition: 52,
        yPosition: 45,
        iconType: 'ShieldCheck',
        partImageUrl: '/images/dynamic/hotspot_chassis.jpg',
      },
      {
        vehicleId: chiron.id,
        title: 'Active Aerodynamics',
        subtitle: 'Dynamic Downforce',
        details: 'The hydraulically actuated rear wing adjusts continuously, acting as an airbrake under heavy deceleration and maximizing downforce through high-speed apexes.',
        stat: 'Generates 600kg Downforce',
        xPosition: 82,
        yPosition: 50,
        iconType: 'Wind',
        partImageUrl: '/images/dynamic/hotspot_aero.jpg',
      }
    ],
  })

  console.log('Seeding VehicleSpecConfigs...')
  await prisma.vehicleSpecConfig.createMany({
    data: [
      {
        vehicleId: chiron.id,
        name: 'Exposed Carbon Fiber',
        hexColor: '#111111',
        imageUrl: '/images/dynamic/spec_carbon.jpg',
        displayOrder: 1,
      },
      {
        vehicleId: chiron.id,
        name: 'French Racing Blue',
        hexColor: '#0055A4',
        imageUrl: '/images/dynamic/spec_blue.jpg',
        displayOrder: 2,
      },
      {
        vehicleId: chiron.id,
        name: 'Liquid Silver',
        hexColor: '#D1D5DB',
        imageUrl: '/images/dynamic/spec_silver.jpg',
        displayOrder: 3,
      }
    ]
  })

  console.log('Seeding Journals...')
  await prisma.journal.createMany({
    data: [
      {
        title: 'Inside The Bugatti Chiron Super Sport 300+ Engineering Marvel',
        category: 'Hypercar Specs',
        snippet: 'Unpacking the 1,578 HP quad-turbo W16 engine, active aerodynamics, and titanium exhaust of Molsheim’s crown jewel.',
        imageUrl: '/images/journals/journal_1.jpg',
        readTime: '5 min read',
      },
      {
        title: 'Rolls-Royce Phantom VIII: The Art of Quiet Luxury',
        category: 'Bespoke Craft',
        snippet: 'Exploring the Starlight Headliner, 130kg of sound insulation, and hand-stitched leather gallery in Dubai’s flagship sedan.',
        imageUrl: '/images/journals/journal_2.jpg',
        readTime: '4 min read',
      },
      {
        title: 'How Crypto & Escrow Are Revolutionizing Supercar Acquisitions in GCC',
        category: 'Market Insights',
        snippet: 'Understanding multi-currency wire transfers, USDT escrow settlement, and international air freight customs clearance.',
        imageUrl: '/images/journals/journal_3.jpg',
        readTime: '6 min read',
      }
    ]
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
