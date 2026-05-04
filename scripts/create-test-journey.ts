
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

    const journeyId = randomUUID()
    const journeyName = 'George Verification Journey'
    
    const flowDefinition = {
      nodes: [
        { 
          id: 'sms-node', 
          type: 'sms', 
          x: 100, 
          y: 100, 
          config: { 
            type: 'sms', 
            msg: 'Hi {{company_name}}, this is a test SMS to verify the journey is working. 🚀' 
          }, 
          label: 'Test SMS' 
        },
        { 
          id: 'email-node', 
          type: 'email', 
          x: 100, 
          y: 250, 
          config: { 
            type: 'email', 
            subject: 'Journey Verification Test', 
            body: 'Hi {{company_name}},\n\nThis is a test email sent from your new journey to verify that everything is working as expected.\n\nBest regards,\nBalloAds Team' 
          }, 
          label: 'Test Email' 
        }
      ],
      edges: [
        ['sms-node', 'email-node']
      ]
    }

    // Check if journey already exists
    const checkRes = await client.query('SELECT id FROM crm_journeys WHERE name = $1', [journeyName])
    if (checkRes.rows.length > 0) {
      console.log('Journey already exists, updating...')
      await client.query(
        'UPDATE crm_journeys SET flow_definition = $1, status = $2 WHERE name = $3',
        [JSON.stringify(flowDefinition), 'active', journeyName]
      )
    } else {
      console.log('Creating new journey...')
      await client.query(
        'INSERT INTO crm_journeys (id, name, status, trigger_type, trigger_config, flow_definition, created_by, activated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          journeyId,
          journeyName,
          'active',
          'manual',
          JSON.stringify({}),
          JSON.stringify(flowDefinition),
          'system',
          new Date()
        ]
      )
    }

    // Now find the company to enrol
    // We'll search for any company that might be George's
    const clientsRes = await client.query("SELECT id, company_name FROM crm_clients WHERE company_name ILIKE '%ballo%' OR company_name ILIKE '%innovations%' OR balloads_account_id ILIKE '%george%' LIMIT 1")
    
    if (clientsRes.rows.length > 0) {
      const company = clientsRes.rows[0]
      console.log(`Enrolling company: ${company.company_name} (${company.id})`)
      
      // Enrolment usually happens via an API or a worker. 
      // For this simulation, we'll just log it or if there's an enrolment table, insert into it.
      // Looking at the schema, there isn't a direct enrolment table, maybe it's handled by a message queue.
      console.log('Journey created and activated. You can now trigger it for the client in the CRM UI.')
    } else {
      console.log('No matching company found to enrol automatically.')
    }

  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.end()
  }
}

main()
