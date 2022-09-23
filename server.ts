import Fastify from 'fastify';
import FastifyStatic from '@fastify/static';
import FastifyFormbody from '@fastify/formbody';
import { Stripe } from 'stripe';
import path from 'path';

const { STRIPE_API_KEY } = process.env

const fastify = Fastify({ logger: true })
const stripe = new Stripe(STRIPE_API_KEY, {
  apiVersion: '2022-08-01',
})

const checkIsAnnualPayment = (isAnnualPayment?: string): boolean => typeof isAnnualPayment === 'string';
const isValidAnnualPaymentParameter = (isAnnualPayment: string): boolean => isAnnualPayment === 'true';

fastify.register(FastifyStatic, {
  root: path.join(path.dirname(new URL(import.meta.url).pathname), '/dist'),
})

fastify.register(FastifyFormbody)

fastify.post<{ Body: { isAnnualPayment?: string; } }>('/create-checkout-session', async (request, reply) => {
  const isAnnualPayment = checkIsAnnualPayment(request.body.isAnnualPayment)
  if (isAnnualPayment && !isValidAnnualPaymentParameter(request.body.isAnnualPayment)) {
    reply.code(400).send('"isAnnualPayment" value invalid')
    return
  }
  const prices = await stripe.prices.list({
    limit: 1,
    lookup_keys: ['annual_membership_dues'],
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
    mode: 'subscription',
    success_url: 'http://localhost:3000',
    cancel_url: 'http://localhost:3000',
  })

  reply.redirect(303, session.url)
})

const start = async () => {
  await fastify.listen({ port: 3000 })
}

try {
  await start()
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
