/**
 * One-off seed runner.
 *
 *   node --env-file=.env.local --import=tsx supabase/seed/run.ts
 *
 * Loads the service-role key from .env.local, builds an admin client
 * targeting the demo schema, and invokes runSeed().
 */
import { createClient } from '@supabase/supabase-js'
import { runSeed } from './seed'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}

const client = createClient(url, serviceKey, {
  db: { schema: 'demo' },
  auth: { autoRefreshToken: false, persistSession: false },
})

runSeed(client)
  .then((summary) => {
    console.log('Seed complete:', summary)
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
