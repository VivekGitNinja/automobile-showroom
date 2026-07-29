import { EventEmitter } from 'events'

export interface MockResponse {
  status: number
  statusCode: number
  body: any
  headers: Record<string, string>
}

export function invokeApp(
  app: any,
  options: {
    method: string
    url: string
    body?: any
    headers?: Record<string, string>
    query?: Record<string, string>
  }
): Promise<MockResponse> {
  return new Promise((resolve, reject) => {
    const req: any = new EventEmitter()
    const fullUrl = options.url
    const urlParts = fullUrl.split('?')
    const path = urlParts[0]

    req.method = options.method.toUpperCase()
    req.url = fullUrl
    req.originalUrl = fullUrl
    req.baseUrl = ''
    req.path = path
    req.query = options.query || {}
    req.headers = {}
    
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        req.headers[k.toLowerCase()] = v
      }
    }

    req.body = options.body || {}
    req.connection = { remoteAddress: '127.0.0.1' }
    req.socket = req.connection

    let statusCode = 200
    let body: any = null
    const responseHeaders: Record<string, string> = {}

    const res: any = new EventEmitter()
    res.statusCode = 200
    res.headersSent = false

    res.setHeader = (key: string, value: string) => {
      responseHeaders[key.toLowerCase()] = String(value)
      return res
    }
    res.getHeader = (key: string) => responseHeaders[key.toLowerCase()]
    res.removeHeader = (key: string) => {
      delete responseHeaders[key.toLowerCase()]
    }
    res.hasHeader = (key: string) => Object.prototype.hasOwnProperty.call(responseHeaders, key.toLowerCase())
    res.getHeaderNames = () => Object.keys(responseHeaders)
    res.getHeaders = () => ({ ...responseHeaders })
    res.writeHead = (code: number, headers?: any) => {
      statusCode = code
      res.statusCode = code
      if (headers) {
        for (const [k, v] of Object.entries(headers)) {
          responseHeaders[k.toLowerCase()] = String(v)
        }
      }
      return res
    }

    res.status = (code: number) => {
      statusCode = code
      res.statusCode = code
      return res
    }
    res.json = (data: any) => {
      body = data
      res.headersSent = true
      resolve({ status: statusCode, statusCode, body, headers: responseHeaders })
      return res
    }
    res.send = (data: any) => {
      body = data
      res.headersSent = true
      resolve({ status: statusCode, statusCode, body, headers: responseHeaders })
      return res
    }
    res.end = (data?: any) => {
      if (data && !body) body = data
      res.headersSent = true
      resolve({ status: statusCode, statusCode, body, headers: responseHeaders })
      return res
    }

    try {
      app(req, res, (err: any) => {
        if (err) reject(err)
        else resolve({ status: 404, statusCode: 404, body: { error: 'Not Found' }, headers: responseHeaders })
      })
    } catch (e) {
      reject(e)
    }
  })
}
