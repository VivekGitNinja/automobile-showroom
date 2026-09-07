const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../public/uploads/vehicles');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Model-matched real luxury car photos (5 per vehicle)
const VEHICLES_DATA = [
  {
    slug: 'mercedes-benz-g-class-2023',
    brandSlug: 'mercedes-benz',
    make: 'Mercedes-Benz',
    model: 'G-Class',
    trim: 'G 63 AMG Grand Edition',
    year: 2023,
    price: 1150000,
    currency: 'AED',
    mileage: '1,200 km',
    transmission: 'AMG SPEEDSHIFT TCT 9G',
    fuelType: 'Super 98 Unleaded',
    bodyType: 'SUV',
    exteriorColor: 'Obsidian Black / Gold Accents',
    interiorColor: 'Black Nappa Leather / Gold',
    engine: '4.0L V8 Biturbo AMG (M177)',
    doors: 5,
    isFeatured: true,
    description: 'An imposing symbol of unrestrained capability and modern prestige. Finished in rare Obsidian Black Metallic with satin gold livery, this GCC-spec G 63 AMG Grand Edition boasts a handcrafted 577-hp biturbo V8, carbon-fiber interior architecture, and a Burmester 3D surround sound system. Exceptionally preserved in pristine Dubai showroom condition with factory warranty and full service history.',
    specsJson: {
      acceleration: '4.5 s',
      '0-200 km/h': '16.8 s',
      '0-300 km/h': 'N/A',
      topSpeed: "240 km/h (AMG Driver's Package)",
      power: '577 hp (585 PS / 430 kW) @ 6,000 RPM',
      torque: '850 Nm (627 lb-ft) @ 2,500–3,500 RPM',
      drivetrain: 'AMG Performance 4MATIC All-Wheel Drive with 3 Differential Locks',
      engine: '4.0-liter twin-turbocharged AMG V8 (M177)',
      transmission: 'AMG SPEEDSHIFT TCT 9-Speed Automatic',
      fuelType: 'Super 98 Unleaded',
      bodyType: 'Luxury Off-Road SUV',
      exteriorColor: 'Obsidian Black Metallic / Satin Gold Accents',
      interiorColor: 'Designo Black Nappa Leather with Gold Honeycomb Stitching',
      seats: '5 Ergonomic Dynamic Multicontour Seats with Massage',
      doors: 5,
      aerodynamics: 'AMG Aerodynamic Wheel Arch Flares & Front Apron Air Curtains',
      roofArchitecture: 'Electric Sliding Sunroof with Tilt Function'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1600&q=80', title: 'Mercedes-Benz G 63 AMG Front 3/4', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80', title: 'Mercedes-Benz G 63 AMG Rear Stance', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1600&q=80', title: 'Mercedes-Benz G 63 AMG Side Profile', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=80', title: 'Mercedes-Benz G 63 AMG Luxury Cabin Cockpit', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1600&q=80', title: 'Mercedes-Benz G 63 AMG Wheel & Grille Detail', category: 'gallery' }
    ]
  },
  {
    slug: 'ferrari-sf90-stradale-2022',
    brandSlug: 'ferrari',
    make: 'Ferrari',
    model: 'SF90 Stradale',
    trim: 'Assetto Fiorano',
    year: 2022,
    price: 1850000,
    currency: 'AED',
    mileage: '1,500 km',
    transmission: '8-Speed F1 Dual-Clutch',
    fuelType: 'Hybrid / Super 98 Unleaded',
    bodyType: 'Coupe',
    exteriorColor: 'Rosso Corsa / Nero Two-Tone',
    interiorColor: 'Nero Alcantara / Carbon Racing Seats',
    engine: '4.0L Twin-Turbo 90° V8 + 3 Electric Motors',
    doors: 2,
    isFeatured: true,
    description: "Maranello's flagship plug-in hybrid hypercar represents the pinnacle of Formula 1 technology adapted for road dominance. Featuring the lightweight Assetto Fiorano package with Multimatic shock absorbers, titanium springs, and high-downforce carbon aero generating 390 kg of downforce. Delivered new in the UAE with remaining 7-year genuine maintenance and Ferrari factory warranty.",
    specsJson: {
      acceleration: '2.5 s',
      '0-200 km/h': '6.7 s',
      '0-300 km/h': 'N/A',
      topSpeed: '340 km/h',
      power: '986 hp (1,000 PS) Combined Hybrid Powertrain',
      torque: '800 Nm (590 lb-ft) @ 6,000 RPM',
      drivetrain: 'e-4WD RAC-e Electric Front Axle All-Wheel Drive',
      engine: '3,990 cc Twin-Turbocharged 90° V8 (F154FA)',
      transmission: '8-Speed Dual-Clutch F1 Transmission with e-Reverse',
      fuelType: 'PHEV Super 98 Unleaded',
      bodyType: 'Mid-Engine Hybrid Berlinetta',
      exteriorColor: 'Rosso Corsa with Nero Lucido Two-Tone Roof',
      interiorColor: 'Nero Alcantara with Carbon-Fiber Racing Seats & Rosso Contrast Stitching',
      seats: '2 Carbon-Fiber Racing Bucket Seats with 4-Point Harness Preparation',
      doors: 2,
      aerodynamics: 'Assetto Fiorano High-Downforce Carbon Rear Wing (390 kg downforce @ 250 km/h)',
      roofArchitecture: 'Nero Two-Tone Fixed Coupe Canopy'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1600&q=80', title: 'Ferrari SF90 Stradale Front 3/4', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80', title: 'Ferrari SF90 Stradale Berlinetta Profile', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1617814076231-2c58846db944?auto=format&fit=crop&w=1600&q=80', title: 'Ferrari SF90 Stradale Rear Active Aero', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80', title: 'Ferrari SF90 Stradale F1 Cockpit & Carbon Steering Wheel', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80', title: 'Ferrari SF90 Stradale Track Stance & Carbon Diffuser', category: 'gallery' }
    ]
  },
  {
    slug: 'porsche-911-2023',
    brandSlug: 'porsche',
    make: 'Porsche',
    model: '911',
    trim: 'GT3 RS (992) Weissach',
    year: 2023,
    price: 1200000,
    currency: 'AED',
    mileage: '850 km',
    transmission: '7-Speed PDK Short Ratio',
    fuelType: 'Super 98 Unleaded',
    bodyType: 'Coupe',
    exteriorColor: 'GT Silver Metallic / Pyro Red',
    interiorColor: 'Black Race-Tex / Guards Red',
    engine: '4.0L Naturally Aspirated Boxer-6',
    doors: 2,
    isFeatured: true,
    description: 'The absolute benchmark for naturally aspirated motorsport engineering. The 992-generation GT3 RS commands 518 atmospheric horsepower revving to 9,000 RPM, paired with active DRS aerodynamics and front-axle lift. Specified with the Weissach Package, magnesium center-lock wheels, and Porsche Ceramic Composite Brakes (PCCB). GCC certified in showroom delivery condition.',
    specsJson: {
      acceleration: '3.2 s',
      '0-200 km/h': '10.6 s',
      '0-300 km/h': 'N/A',
      topSpeed: '296 km/h',
      power: '518 hp (525 PS / 386 kW) @ 8,500 RPM (9,000 RPM Redline)',
      torque: '465 Nm @ 6,300 RPM',
      drivetrain: 'Rear-Wheel Drive (RWD) with Rear-Axle Steering and Torque Vectoring Plus',
      engine: '3,996 cc Naturally Aspirated High-Revving Boxer-6 (MA275)',
      transmission: '7-Speed Porsche Doppelkupplung (PDK) with Motorsport Ratios',
      fuelType: 'Super 98 Unleaded',
      bodyType: 'Track-Focused Super Sports Coupe',
      exteriorColor: 'GT Silver Metallic with Pyro Red Graphics & Decals',
      interiorColor: 'Black Race-Tex and Leather with Guards Red Contrast Accents',
      seats: '2 Full Carbon-Fiber Lightweight Bucket Seats',
      doors: 2,
      aerodynamics: 'Active Drag Reduction System (DRS) & Swan-Neck Carbon Rear Wing (860 kg downforce)',
      roofArchitecture: 'Lightweight Carbon-Fiber Reinforced Plastic (CFRP) Double-Bubble Roof'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80', title: 'Porsche 911 GT3 RS Front 3/4', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=80', title: 'Porsche 911 GT3 RS Swan-Neck Wing & Rear Fascia', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?auto=format&fit=crop&w=1600&q=80', title: 'Porsche 911 GT3 RS Side Track Silhouette', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80', title: 'Porsche 911 GT3 RS Race-Tex Motorsport Cockpit', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80', title: 'Porsche 911 GT3 RS Weissach Magnesium Wheels & PCCB Brakes', category: 'gallery' }
    ]
  },
  {
    slug: 'lamborghini-urus-2024',
    brandSlug: 'lamborghini',
    make: 'Lamborghini',
    model: 'Urus',
    trim: 'Performante',
    year: 2024,
    price: 1500000,
    currency: 'AED',
    mileage: '900 km',
    transmission: '8-Speed Automatic with ANIMA',
    fuelType: 'Super 98 Unleaded',
    bodyType: 'SUV',
    exteriorColor: 'Giallo Auge Solid Yellow',
    interiorColor: 'Nero Ade Alcantara / Giallo',
    engine: '4.0L Twin-Turbocharged V8',
    doors: 5,
    isFeatured: false,
    description: 'The sharpest expression of the Super SUV concept, engineered for extreme responsiveness on both tarmac and desert rally stages. The Urus Performante combines extensive carbon-fiber weight reduction with an Akrapovič titanium exhaust system, lowered steel-spring suspension, and 23-inch Pelope wheels. Full GCC specification with comprehensive Lamborghini warranty.',
    specsJson: {
      acceleration: '3.3 s',
      '0-200 km/h': '11.5 s',
      '0-300 km/h': 'N/A',
      topSpeed: '306 km/h',
      power: '657 hp (666 CV / 490 kW) @ 6,000 RPM',
      torque: '850 Nm @ 2,300–4,500 RPM',
      drivetrain: 'Permanent 4WD with Torsen Central Self-Locking Differential and Active Torque Vectoring',
      engine: '3,996 cc 90° Twin-Turbocharged V8',
      transmission: '8-Speed Automatic Transmission with ANIMA Drive Select (STRADA/SPORT/CORSA/RALLY)',
      fuelType: 'Super 98 Unleaded',
      bodyType: 'Super Sports Utility Vehicle',
      exteriorColor: 'Giallo Auge Solid Yellow with Gloss Carbon Bonnet & Roof',
      interiorColor: 'Nero Ade Alcantara with Hexagonal Q-Citura Giallo Stitching',
      seats: '5 Sport Seats with Heating, Ventilation and Memory Function',
      doors: 5,
      aerodynamics: 'Carbon-Fiber Aerodynamic Rear Spoiler (+38% Downforce) & Front Air Curtains',
      roofArchitecture: 'Visible Carbon-Fiber Lightweight Roof'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Urus Performante Front 3/4', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Urus Performante Rear Akrapovič Exhaust', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1570288685369-f7305163d0e3?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Urus Performante Low-Slung Profile', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Urus Performante Alcantara Cockpit & Tamburo Controls', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Urus Performante Carbon Fascia & 23-inch Pelope Wheels', category: 'gallery' }
    ]
  },
  {
    slug: 'rolls-royce-phantom-2023',
    brandSlug: 'rolls-royce',
    make: 'Rolls-Royce',
    model: 'Phantom',
    trim: 'Series VIII Extended Wheelbase',
    year: 2023,
    price: 2500000,
    currency: 'AED',
    mileage: '600 km',
    transmission: '8-Speed Satellite-Aided Auto',
    fuelType: 'Super 98 Unleaded',
    bodyType: 'Sedan',
    exteriorColor: 'Diamond Black / Silver Sand',
    interiorColor: 'Grace White & Seashell Leather',
    engine: '6.75L Twin-Turbocharged V12 (N74)',
    doors: 4,
    isFeatured: true,
    description: "The undisputed summit of automotive serenity, presence, and bespoke artisan craftsmanship. Featuring the peerless 6.75L twin-turbo V12 and 'Magic Carpet Ride' planar suspension, this Phantom Series VIII Extended Wheelbase provides an unmatched rolling sanctuary. Equipped with the Shooting Star Starlight Headliner, rear theater suite, refrigerated champagne console, and power-closing coach doors.",
    specsJson: {
      acceleration: '5.3 s',
      '0-200 km/h': '18.2 s',
      '0-300 km/h': 'N/A',
      topSpeed: '250 km/h (Electronically Governed)',
      power: '563 hp (571 PS / 420 kW) @ 5,000 RPM',
      torque: '900 Nm (664 lb-ft) @ 1,700 RPM',
      drivetrain: 'Rear-Wheel Drive with Active 4-Wheel Steering and Flagbearer Predictive Air Suspension',
      engine: '6,749 cc Twin-Turbocharged 60° V12 (N74)',
      transmission: '8-Speed Satellite Aided Transmission (SAT)',
      fuelType: 'Super 98 Unleaded',
      bodyType: 'Ultra-Luxury Flagship Saloon',
      exteriorColor: 'Diamond Black over Silver Sand Two-Tone with Hand-Painted Gold Coachline',
      interiorColor: 'Grace White & Seashell Extended Leather with High-Gloss Piano Black Veneer',
      seats: '4 Individual Immersive Seating with Massage, Heating, Ventilation and Footrests',
      doors: 4,
      aerodynamics: 'Acoustic Double Glazing (6mm) & Silent-Seal Foam-Injected Tires',
      roofArchitecture: 'Bespoke Fiber-Optic Shooting Star Starlight Headliner'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=1600&q=80', title: 'Rolls-Royce Phantom Pantheon Grille & Spirit of Ecstasy', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80', title: 'Rolls-Royce Phantom Extended Stance & Coach Doors', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&w=1600&q=80', title: 'Rolls-Royce Phantom Rear Presence & Chrome Accents', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=80', title: 'Rolls-Royce Phantom Starlight Lounge & Executive Rear Suite', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80', title: 'Rolls-Royce Phantom Luxury Detailing & Laser Headlamps', category: 'gallery' }
    ]
  },
  {
    slug: 'lamborghini-aventador-svj-2022',
    brandSlug: 'lamborghini',
    make: 'Lamborghini',
    model: 'Aventador',
    trim: 'SVJ LP 770-4',
    year: 2022,
    price: 2150000,
    currency: 'AED',
    mileage: '1,100 km',
    transmission: '7-Speed ISR Gearbox',
    fuelType: 'Super 98 Unleaded',
    bodyType: 'Coupe',
    exteriorColor: 'Verde Alceo Matte / Carbon',
    interiorColor: 'Nero Cosmus Alcantara / Verde',
    engine: '6.5L Naturally Aspirated V12',
    doors: 2,
    isFeatured: true,
    description: 'The ultimate atmospheric V12 supercar, holder of the Nürburgring Nordschleife production car lap record. Powered by the legendary 759-horsepower 6.5L V12 and featuring the revolutionary Aerodinamica Lamborghini Attiva (ALA 2.0) active aerodynamic system. Delivered in ultra-rare Verde Alceo with carbon monocoque and telemetry system in collector-grade condition.',
    specsJson: {
      acceleration: '2.8 s',
      '0-200 km/h': '8.6 s',
      '0-300 km/h': '24.0 s',
      topSpeed: '352 km/h',
      power: '759 hp (770 CV / 566 kW) @ 8,500 RPM',
      torque: '720 Nm @ 6,750 RPM',
      drivetrain: 'Electronically Controlled All-Wheel Drive with Rear-Wheel Steering',
      engine: '6,498 cc Naturally Aspirated 60° V12 (L539)',
      transmission: '7-Speed Independent Shifting Rods (ISR) with Corsa Shift Logic',
      fuelType: 'Super 98 Unleaded',
      bodyType: 'Mid-Engine V12 Super Sports Coupe',
      exteriorColor: 'Verde Alceo Matte Finish with Satin Carbon Pack',
      interiorColor: 'Nero Cosmus Alcantara with Verde Contrast Laser-Cut Details',
      seats: '2 Carbon Monocoque Lightweight Racing Seats',
      doors: 2,
      aerodynamics: 'Aerodinamica Lamborghini Attiva 2.0 (ALA 2.0) Active Aero Vectoring Wing',
      roofArchitecture: 'Fixed Carbon-Fiber Monocoque Roof'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Aventador SVJ Front 3/4', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Aventador SVJ Active ALA 2.0 Carbon Wing', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Aventador SVJ High Mounted Titanium Exhaust', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Aventador SVJ Fighter Jet Cockpit with Carbon Monocoque', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1600&q=80', title: 'Lamborghini Aventador SVJ Front Splitter & Carbon Intakes', category: 'gallery' }
    ]
  },
  {
    slug: 'aston-martin-dbs-2023',
    brandSlug: 'aston-martin',
    make: 'Aston Martin',
    model: 'DBS',
    trim: 'Superleggera V12',
    year: 2023,
    price: 1450000,
    currency: 'AED',
    mileage: '1,400 km',
    transmission: 'ZF 8-Speed Automatic',
    fuelType: 'Super 98 Unleaded',
    bodyType: 'Coupe',
    exteriorColor: 'Xenon Grey Metallic / Carbon',
    interiorColor: 'Oxford Tan & Obsidian Black',
    engine: '5.2L Twin-Turbocharged V12',
    doors: 2,
    isFeatured: false,
    description: 'The definitive British super grand tourer combining ferocious muscularity with bespoke Savile Row tailoring. The 5.2-liter twin-turbo V12 unleashes an earth-shattering 900 Nm of torque enveloped in lightweight carbon-composite body panels and active aerodynamics. Specified with Bang & Olufsen BeoSound audio and carbon ceramic brakes in pristine UAE condition.',
    specsJson: {
      acceleration: '3.4 s',
      '0-200 km/h': '10.5 s',
      '0-300 km/h': 'N/A',
      topSpeed: '340 km/h',
      power: '715 hp (725 PS / 533 kW) @ 6,500 RPM',
      torque: '900 Nm (663 lb-ft) @ 1,800–5,000 RPM',
      drivetrain: 'Rear-Wheel Drive with Carbon-Fiber Propshaft and Mechanical Limited-Slip Differential',
      engine: '5,204 cc All-Alloy Quad Overhead Cam 48-Valve Twin-Turbo V12',
      transmission: 'Rear Mid-Mounted ZF 8-Speed Automatic with Column-Mounted Shift Paddles',
      fuelType: 'Super 98 Unleaded',
      bodyType: 'Super GT Coupe',
      exteriorColor: 'Xenon Grey Metallic with Gloss 2x2 Twill Carbon Aero Package',
      interiorColor: 'Oxford Tan Handcrafted Caithness Leather with Triaxial Quilting',
      seats: '2+2 Sports Plus Electric Memory Seating',
      doors: 2,
      aerodynamics: 'Aeroblade II Downforce System & Double Diffuser (180 kg downforce at Vmax)',
      roofArchitecture: 'Sculpted Carbon-Fiber Roof Panel'
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1600&q=80', title: 'Aston Martin DBS Superleggera Front 3/4', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1600&q=80', title: 'Aston Martin DBS Superleggera Muscular Rear Haunches', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1600&q=80', title: 'Aston Martin DBS Superleggera Side Aeroblade Stance', category: 'exterior' },
      { url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1600&q=80', title: 'Aston Martin DBS Superleggera Handcrafted British Cabin', category: 'interior' },
      { url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80', title: 'Aston Martin DBS Superleggera Iconic Front Grille & Carbon Splitter', category: 'gallery' }
    ]
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 20000) {
          return reject(new Error(`File too small: ${buffer.length} bytes`));
        }
        const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
        if (!isJpeg && !isPng) {
          return reject(new Error('Invalid image format header'));
        }
        fs.writeFileSync(destPath, buffer);
        resolve({ size: buffer.length, mime: isJpeg ? 'image/jpeg' : 'image/png' });
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting Real Luxury Vehicle Data & Image Population...\n');

  const admin = await prisma.user.findFirst({
    where: { role: 'admin' },
  });
  const adminId = admin ? admin.id : null;

  for (const vData of VEHICLES_DATA) {
    console.log(`\n───────────────────────────────────────────────────`);
    console.log(`Processing: ${vData.year} ${vData.make} ${vData.model} (${vData.slug})`);

    let brand = await prisma.brand.findUnique({ where: { slug: vData.brandSlug } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: vData.make,
          slug: vData.brandSlug,
          description: `Luxury vehicles from ${vData.make}`
        }
      });
      console.log(`  ✅ Created brand: ${brand.name}`);
    }

    const savedImages = [];
    for (let i = 0; i < vData.images.length; i++) {
      const imgInfo = vData.images[i];
      const filename = `${vData.slug}-${i}.jpg`;
      const destPath = path.join(UPLOADS_DIR, filename);

      try {
        if (!fs.existsSync(destPath) || fs.statSync(destPath).size < 20000) {
          process.stdout.write(`  ⬇️ Downloading image [${i}] ${filename}... `);
          const result = await downloadFile(imgInfo.url, destPath);
          console.log(`SUCCESS (${Math.round(result.size / 1024)} KB)`);
          savedImages.push({
            filename,
            size: result.size,
            mime: result.mime,
            isPrimary: i === 0,
            displayOrder: i,
            category: imgInfo.category,
            title: imgInfo.title
          });
        } else {
          const stats = fs.statSync(destPath);
          console.log(`  ⚡ Existing verified image [${i}] ${filename} (${Math.round(stats.size / 1024)} KB)`);
          savedImages.push({
            filename,
            size: stats.size,
            mime: 'image/jpeg',
            isPrimary: i === 0,
            displayOrder: i,
            category: imgInfo.category,
            title: imgInfo.title
          });
        }
      } catch (err) {
        console.error(`  ❌ Failed to download ${filename}: ${err.message}`);
      }
    }

    const vehicle = await prisma.vehicle.upsert({
      where: { slug: vData.slug },
      update: {
        make: vData.make,
        model: vData.model,
        trim: vData.trim,
        year: vData.year,
        price: new Prisma.Decimal(vData.price),
        currency: vData.currency,
        mileage: vData.mileage,
        transmission: vData.transmission,
        fuelType: vData.fuelType,
        bodyType: vData.bodyType,
        exteriorColor: vData.exteriorColor,
        interiorColor: vData.interiorColor,
        engine: vData.engine,
        doors: vData.doors,
        description: vData.description,
        specsJson: vData.specsJson,
        status: 'published',
        isFeatured: vData.isFeatured,
        isCertified: true,
        hasServiceHistory: true,
        hasInspectionReport: true,
        hasWarranty: true,
        financeAvailable: true,
        exportAvailable: true,
        gccVerified: true,
        noAccidents: true,
        originalPaint: true,
        brandId: brand.id
      },
      create: {
        slug: vData.slug,
        make: vData.make,
        model: vData.model,
        trim: vData.trim,
        year: vData.year,
        price: new Prisma.Decimal(vData.price),
        currency: vData.currency,
        mileage: vData.mileage,
        transmission: vData.transmission,
        fuelType: vData.fuelType,
        bodyType: vData.bodyType,
        exteriorColor: vData.exteriorColor,
        interiorColor: vData.interiorColor,
        engine: vData.engine,
        doors: vData.doors,
        description: vData.description,
        specsJson: vData.specsJson,
        status: 'published',
        isFeatured: vData.isFeatured,
        isCertified: true,
        hasServiceHistory: true,
        hasInspectionReport: true,
        hasWarranty: true,
        financeAvailable: true,
        exportAvailable: true,
        gccVerified: true,
        noAccidents: true,
        originalPaint: true,
        brandId: brand.id,
        createdBy: adminId
      }
    });

    console.log(`  ✅ Updated Vehicle in DB: ${vehicle.make} ${vehicle.model} (ID: ${vehicle.id})`);

    const deleted = await prisma.vehicleImage.deleteMany({
      where: { vehicleId: vehicle.id }
    });
    if (deleted.count > 0) {
      console.log(`  🧹 Deleted ${deleted.count} stale VehicleImage rows`);
    }

    for (const img of savedImages) {
      const publicUrl = `http://localhost:4000/uploads/vehicles/${img.filename}`;
      await prisma.vehicleImage.create({
        data: {
          vehicleId: vehicle.id,
          urlOriginal: publicUrl,
          urlLg: publicUrl,
          urlMd: publicUrl,
          urlSm: publicUrl,
          isPrimary: img.isPrimary,
          displayOrder: img.displayOrder,
          mediaCategory: img.category,
          title: img.title,
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${img.title}`,
          fileSize: img.size,
          mimeType: img.mime
        }
      });
    }
    console.log(`  📸 Inserted ${savedImages.length} verified VehicleImage records`);
  }

  console.log('\n🎉 Real Vehicle Data & Image Population Complete!\n');
}

main()
  .catch(e => {
    console.error('Fatal error in population script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
