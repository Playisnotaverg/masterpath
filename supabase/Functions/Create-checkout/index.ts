import Stripe from 'npm:stripe@16'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { httpClient: Stripe.createFetchHttpClient() })
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    // Identify the user from their login token, never from the request body.
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return json({ error: 'Please sign in first.' }, 401)

    const site = Deno.env.get('SITE_URL')!
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_ID')!, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${site}/?checkout=success`,
      cancel_url: `${site}/?checkout=cancel`,
    })
    return json({ url: session.url })
  } catch (e) {
    return json({ error: (e as Error).message }, 500)
  }
})
