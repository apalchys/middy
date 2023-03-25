const httpEventNormalizerMiddleware = () => {
  const httpEventNormalizerMiddlewareBefore = async (request) => {
    const { event } = request

    const version = event.version ?? '1.0'
    const isHttpEvent = isVersionHttpEvent[version]?.(event)
    if (!isHttpEvent) {
      throw new Error('Unknown http event format', {
        cause: { package: '@middy/http-event-normalizer' }
      })
    }

    // event.headers ??= {} // Will always have at least one header
    event.pathParameters ??= {}
    event.queryStringParameters ??= {}
    if (version === '1.0') {
      event.multiValueQueryStringParameters ??= {}
    }
  }

  return {
    before: httpEventNormalizerMiddlewareBefore
  }
}

const isVersionHttpEvent = {
  '1.0': (event) => typeof event.httpMethod !== 'undefined',
  '2.0': (event) => typeof event.requestContext.http.method !== 'undefined'
}

export default httpEventNormalizerMiddleware
