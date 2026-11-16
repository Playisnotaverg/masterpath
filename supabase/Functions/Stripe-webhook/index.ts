import Stripe from 'npm:stripe@16'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() })
const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Deploy with: supabase functions deploy stripe-webhook --no-verify-jwt
// (Stripe calls this, not a logged-in user. The Stripe signature below is what secures it.)
Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text() // raw body is required for signature checking
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature ?? '', Deno.env.get('STRIPE_WEBHOOK_SECRET')!, undefined, cryptoProvider)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    if (userId) {
      const { error } = await admin.from('profiles')
        .update({ is_pro: true, stripe_customer_id: session.customer as string, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) return new Response(error.message, { status: 500 }) // Stripe will retry
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await admin.from('profiles').update({ is_pro: false }).eq('stripe_customer_id', sub.customer as string)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
