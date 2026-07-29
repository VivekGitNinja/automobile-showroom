import { createApp } from '../app'
import { invokeApp } from './testUtils'

const app = createApp()

describe('Health API', () => {
  it('should return 200 or 503 based on service availability', async () => {
    const response = await invokeApp(app, {
      method: 'GET',
      url: '/api/v1/health',
    })

    expect([200, 503]).toContain(response.status)
    expect(response.body).toHaveProperty('status')
    expect(response.body).toHaveProperty('timestamp')
  })
})
