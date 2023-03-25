import test from 'ava'
import middy from '../../core/index.js'
import httpRouter from '../index.js'

// const event = {}
const context = {
  getRemainingTimeInMillis: () => 1000
}

// Types of routes
test('It should route to a static route', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a static route with trailing slash', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/user/'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/user',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic route with `{variable}`', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/user/1'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/user/{id}/',
      handler: (event) => {
        t.deepEqual(event.pathParameters, { id: '1' })
        return true
      }
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic route with `{variable}` with trailing slash', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/user/1/'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/user/{id}',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic route with multiple `{variable}`', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/user/1/transactions/50'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/user/{id}',
      handler: (event) => {
        t.deepEqual(event.pathParameters, { id: '1', transactions: '50' })
        return true
      }
    },
    {
      method: 'GET',
      path: '/user/{id}/transactions/{transactionId}',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic route (/) with `{proxy+}`', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/any'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/{proxy+}',
      handler: () => {
        t.deepEqual(event.pathParameters, { proxy: 'any' })
        return true
      }
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic route (/path) with `{proxy+}`', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/path'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/path/{proxy+}',
      handler: () => {
        t.deepEqual(event.pathParameters, { proxy: '' })
        return true
      }
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic route (/path/to) with `{proxy+}`', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/path/to'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/path/{proxy+}',
      handler: (event) => {
        t.deepEqual(event.pathParameters, { proxy: 'to' })
        t.truthy(event.pathParameters.__proto__) // eslint-disable-line no-proto
        return true
      }
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should populate pathParameters to a dynamic route even if they already exist in the event', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/user/123',
    pathParameters: {
      previous: '321'
    }
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/user/{id}',
      handler: (event) => {
        t.deepEqual(event.pathParameters, { id: '123', previous: '321' })
        t.truthy(event.pathParameters.__proto__) // eslint-disable-line no-proto
        return true
      }
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should thrown 404 when route not found', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/notfound'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/',
      handler: () => true
    }
  ])
  try {
    await handler(event, context)
  } catch (e) {
    t.is(e.message, 'Route does not exist')
    t.is(e.statusCode, 404)
  }
})

// route methods
test('It should route to a static POST method', async (t) => {
  const event = {
    httpMethod: 'POST',
    path: '/'
  }
  const handler = httpRouter([
    {
      method: 'POST',
      path: '/',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a static ANY method', async (t) => {
  const event = {
    httpMethod: 'POST',
    path: '/'
  }
  const handler = httpRouter([
    {
      method: 'ANY',
      path: '/',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic POST method', async (t) => {
  const event = {
    httpMethod: 'POST',
    path: '/user/1'
  }
  const handler = httpRouter([
    {
      method: 'POST',
      path: '/user/{id}',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should route to a dynamic ANY method', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/user/1'
  }
  const handler = httpRouter([
    {
      method: 'ANY',
      path: '/user/{id}',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

// event versions
test('It should route to a v2 event', async (t) => {
  const event = {
    version: '2.0',
    requestContext: {
      http: {
        method: 'GET',
        path: '/'
      }
    }
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/',
      handler: () => true
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

// with middleware
test('It should run middleware that are part of route handler', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/',
      handler: middy(() => false).after((request) => {
        request.response = true
      })
    }
  ])
  const response = await handler(event, context)
  t.true(response)
})

test('It should run middleware part of router', async (t) => {
  const event = {
    httpMethod: 'GET',
    path: '/'
  }
  const handler = middy(
    httpRouter([
      {
        method: 'GET',
        path: '/',
        handler: () => false
      }
    ])
  ).after((request) => {
    request.response = true
  })
  const response = await handler(event, context)
  t.true(response)
})

// Errors
test('It should throw when unknown method is used', async (t) => {
  try {
    httpRouter([
      {
        method: 'ALL',
        path: '/',
        handler: () => true
      }
    ])
  } catch (e) {
    t.is(e.message, 'Method not allowed')
  }
})

test('It should throw when not a http event', async (t) => {
  const event = {
    path: '/'
  }
  const handler = httpRouter([
    {
      method: 'GET',
      path: '/',
      handler: () => true
    }
  ])
  try {
    await handler(event, context)
  } catch (e) {
    t.is(e.message, 'Unknown http event format')
  }
})
