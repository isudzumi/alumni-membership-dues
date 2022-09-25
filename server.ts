import Fastify from 'fastify';
import FastifyStatic from '@fastify/static';
import FastifyFormbody from '@fastify/formbody';
import { Static, Type } from "@sinclair/typebox";
import { Stripe } from 'stripe';
import path from 'path';

const { STRIPE_API_KEY } = process.env

if (!STRIPE_API_KEY) {
  throw new Error(`STRIPE_API_KEY not set`);
}

const fastify = Fastify({ logger: { level: 'warn' } })
const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
})

const Payment =
  Type.Object({
    isAnnualPayment:
      Type.Readonly(
        Type.Boolean({
          default: false
        }),
      )
  })

type PaymentType = Static<typeof Payment>

fastify.register(FastifyStatic, {
  root: path.join(path.dirname(new URL(import.meta.url).pathname), '/dist'),
})

fastify.register(FastifyFormbody)

fastify.post<{ Body: PaymentType }>('/create-checkout-session', {
  schema: {
    body: Payment
  },
  preValidation: (request, _, done) => {
    if (!request.body) {
      Object.assign(request, {
        body: {}
      })
    }
    done()
  },
}, async (request, reply) => {
  const { isAnnualPayment } = request.body

  const prices = await stripe.prices.list({
    limit: 1,
    type: isAnnualPayment ? 'recurring' : 'one_time',
    expand: ['data.product'],
  })

  if (!prices.data.length) {
    reply.code(400).send('Specified price object not found')
    return
  }
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data.at(0)?.id,
        quantity: 1,
      }
    ],
    mode: isAnnualPayment ? 'subscription' : 'payment',
    success_url: 'http://localhost:8080',
    cancel_url: 'http://localhost:8080',
  })

  if (!session.url) {
    throw new Error('Clould not retrieve Stripe session URL')
  }

  reply.redirect(303, session.url)
})

await fastify.listen({ port: process.env.PORT || 8080 })

