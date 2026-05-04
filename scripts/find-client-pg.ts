
import { Client } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('Connected to database')

    const res = await client.query("SELECT id, company_name FROM crm_clients WHERE company_name ILIKE '%ballo%' OR company_name ILIKE '%innovations%'")
    console.log('Found clients:', JSON.stringify(res.rows, null, 2))

    if (res.rows.length === 0) {
      console.log('No client found. Creating a test client for George.')
      // If no client found, we might need to create one, but let's see if we can find it first.
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await client.end()
  }
}

main()
