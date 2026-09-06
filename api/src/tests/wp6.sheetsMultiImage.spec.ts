import { parseImageUrls } from '../services/googleSheets.service'
import { prisma } from '../config/database'

jest.mock('../config/database', () => ({
  prisma: {
    syncLog: {
      create: jest.fn().mockResolvedValue({ id: 'mock-sync-log-1' }),
      update: jest.fn().mockResolvedValue({}),
    },
    brand: {
      upsert: jest.fn().mockResolvedValue({ id: 'brand-1', name: 'Ferrari', slug: 'ferrari' }),
    },
    vehicle: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    vehicleImage: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    syncQuarantine: {
      create: jest.fn(),
    },
  },
}))

describe('WP6 — Sheets Sync Multi-Image Gallery', () => {
  describe('parseImageUrls pure parser', () => {
    it('parses comma-separated URLs with trimming', () => {
      const input = 'https://images.unsplash.com/car1.jpg,  https://images.unsplash.com/car2.jpg '
      const result = parseImageUrls(input)
      expect(result).toEqual([
        'https://images.unsplash.com/car1.jpg',
        'https://images.unsplash.com/car2.jpg',
      ])
    })

    it('parses semicolon-separated URLs', () => {
      const input = 'https://images.unsplash.com/car1.jpg; https://images.unsplash.com/car2.jpg'
      const result = parseImageUrls(input)
      expect(result).toEqual([
        'https://images.unsplash.com/car1.jpg',
        'https://images.unsplash.com/car2.jpg',
      ])
    })

    it('parses newline-separated URLs', () => {
      const input = 'https://images.unsplash.com/car1.jpg\nhttps://images.unsplash.com/car2.jpg\nhttps://images.unsplash.com/car3.jpg'
      const result = parseImageUrls(input)
      expect(result).toEqual([
        'https://images.unsplash.com/car1.jpg',
        'https://images.unsplash.com/car2.jpg',
        'https://images.unsplash.com/car3.jpg',
      ])
    })

    it('parses mixed delimiters (comma, semicolon, newline)', () => {
      const input = 'https://images.unsplash.com/car1.jpg, https://images.unsplash.com/car2.jpg;\nhttps://images.unsplash.com/car3.jpg'
      const result = parseImageUrls(input)
      expect(result).toEqual([
        'https://images.unsplash.com/car1.jpg',
        'https://images.unsplash.com/car2.jpg',
        'https://images.unsplash.com/car3.jpg',
      ])
    })

    it('skips malformed or invalid URLs and triggers warning callback without aborting', () => {
      const warnings: string[] = []
      const input = 'https://images.unsplash.com/car1.jpg, not-a-valid-url, ftp://unsupported.com, https://images.unsplash.com/car2.jpg'
      const result = parseImageUrls(input, (w) => warnings.push(w))

      expect(result).toEqual([
        'https://images.unsplash.com/car1.jpg',
        'https://images.unsplash.com/car2.jpg',
      ])
      expect(warnings).toHaveLength(2)
      expect(warnings[0]).toContain('Malformed image URL')
      expect(warnings[1]).toContain('Invalid image URL')
    })

    it('deduplicates identical URLs while maintaining order', () => {
      const input = 'https://images.unsplash.com/car1.jpg, https://images.unsplash.com/car1.jpg, https://images.unsplash.com/car2.jpg'
      const result = parseImageUrls(input)
      expect(result).toEqual([
        'https://images.unsplash.com/car1.jpg',
        'https://images.unsplash.com/car2.jpg',
      ])
    })

    it('returns empty array for null, undefined, or empty string', () => {
      expect(parseImageUrls(null)).toEqual([])
      expect(parseImageUrls(undefined)).toEqual([])
      expect(parseImageUrls('')).toEqual([])
      expect(parseImageUrls('   ')).toEqual([])
    })
  })

  describe('Multi-image database synchronization', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('creates first image as primary and subsequent images as gallery with correct displayOrder', async () => {
      const rawGallery = 'https://images.com/front.jpg, https://images.com/interior.jpg; https://images.com/engine.jpg'
      const validUrls = parseImageUrls(rawGallery)

      expect(validUrls).toHaveLength(3)

      const vehicleId = 'veh-123'
      ;(prisma.vehicleImage.findMany as jest.Mock).mockResolvedValue([])

      // Simulate image creation pass
      for (let i = 0; i < validUrls.length; i++) {
        const url = validUrls[i]
        const shouldBePrimary = i === 0
        if (shouldBePrimary) {
          await prisma.vehicleImage.updateMany({
            where: { vehicleId, isPrimary: true },
            data: { isPrimary: false },
          })
        }
        await prisma.vehicleImage.create({
          data: {
            vehicleId,
            urlOriginal: url,
            isPrimary: shouldBePrimary,
            displayOrder: i,
            title: `Ferrari SF90 ${shouldBePrimary ? 'Exterior Primary' : `Gallery ${i + 1}`}`,
            mediaCategory: shouldBePrimary ? 'Exterior' : 'Gallery',
          },
        })
      }

      expect(prisma.vehicleImage.create).toHaveBeenCalledTimes(3)
      // First image
      expect(prisma.vehicleImage.create).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          vehicleId,
          urlOriginal: 'https://images.com/front.jpg',
          isPrimary: true,
          displayOrder: 0,
        }),
      })
      // Second image
      expect(prisma.vehicleImage.create).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          vehicleId,
          urlOriginal: 'https://images.com/interior.jpg',
          isPrimary: false,
          displayOrder: 1,
        }),
      })
      // Third image
      expect(prisma.vehicleImage.create).toHaveBeenNthCalledWith(3, {
        data: expect.objectContaining({
          vehicleId,
          urlOriginal: 'https://images.com/engine.jpg',
          isPrimary: false,
          displayOrder: 2,
        }),
      })
    })
  })
})
