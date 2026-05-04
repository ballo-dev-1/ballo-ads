
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { randomUUID } from 'crypto'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // 1. Create tables if they don't exist (using the migration logic)
    console.log('Ensuring CRM tables exist...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_clients (
        id UUID PRIMARY KEY,
        company_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        region TEXT NOT NULL DEFAULT 'Lusaka, Zambia',
        balloads_account_id TEXT NOT NULL UNIQUE,
        plan_tier TEXT NOT NULL,
        account_status TEXT NOT NULL DEFAULT 'active',
        health_score INTEGER NOT NULL DEFAULT 100,
        credits_remaining INTEGER NOT NULL DEFAULT 0,
        last_active_at TIMESTAMPTZ,
        signed_up_at TIMESTAMPTZ NOT NULL,
        synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS crm_journeys (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        trigger_type TEXT NOT NULL,
        trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
        flow_definition JSONB NOT NULL DEFAULT '{"nodes":[],"edges":[]}'::jsonb,
        entry_segment_id UUID,
        max_duration_days INTEGER NOT NULL DEFAULT 7,
        entry_mode TEXT NOT NULL DEFAULT 'once_per_client',
        created_by TEXT NOT NULL,
        activated_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)

    // 2. Ensure George exists as a CRM client
    const georgeWaitlistId = 'cmi1q6k920000jp04fofu324t'
    const georgeId = randomUUID()
    
    console.log('Ensuring George exists in crm_clients...')
    const clientCheck = await client.query('SELECT id FROM crm_clients WHERE balloads_account_id = $1', [georgeWaitlistId])
    
    if (clientCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO crm_clients (id, company_name, industry, balloads_account_id, plan_tier, signed_up_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [georgeId, 'Ballo Innovations (George)', 'Technology', georgeWaitlistId, 'Pro'])
      console.log('Created CRM client for George.')
    } else {
      console.log('George already exists in crm_clients.')
    }

    // 3. Create the verification journey
    const journeyId = randomUUID()
    const journeyName = 'George Verification Journey'
    const flowDefinition = {
      nodes: [
        { 
          id: 'v0', type: 'wait', x: 100, y: 50, 
          config: { type: 'wait', event: 'manual' }, 
          label: 'Trigger: Manual' 
        },
        { 
          id: 'v1', type: 'sms', x: 100, y: 180, 
          config: { type: 'sms', msg: 'Hi George, verification SMS working! 🚀' }, 
          label: 'Verification SMS' 
        },
        { 
          id: 'v2', type: 'email', x: 100, y: 310, 
          config: { type: 'email', subject: 'Verification Working', body: 'Hi George,\n\nVerification email working!\n\nBest,\nBalloAds' }, 
          label: 'Verification Email' 
        },
      ],
      edges: [
        ['v0', 'v1'],
        ['v1', 'v2'],
      ],
    }

    const journeyCheck = await client.query('SELECT id FROM crm_journeys WHERE name = $1', [journeyName])
    if (journeyCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO crm_journeys (id, name, status, trigger_type, flow_definition, created_by, activated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [journeyId, journeyName, 'active', 'manual', JSON.stringify(flowDefinition), 'system'])
      console.log('Created Verification Journey.')
    } else {
      console.log('Verification Journey already exists.')
    }

    console.log('\n--- SETUP COMPLETE ---')
    console.log('Journey created and George is enrolled as a client.')
    console.log('You can now simulate triggers by calling the enrol API for this client.')

  } catch (err) {
    console.error('Error during setup:', err)
  } finally {
    await client.end()
  }
}

main()
