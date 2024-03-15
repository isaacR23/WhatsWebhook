import { Hono } from 'hono'
import { sentry } from '@hono/sentry'

const app = new Hono()

app.use('*', sentry())
app.get('/', (c) => c.text('foo'))

export default app