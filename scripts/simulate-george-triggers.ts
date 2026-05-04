
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const DEV_API_BASE = 'https://dev-api.balloads.com'
const GEORGE_COMPANY_ID = 'cmi1q6k920000jp04fofu324t' // Using his waitlist ID as it's often mapped to account ID

async function login() {
  console.log('Logging in to Dev API...')
  const res = await fetch(`${DEV_API_BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin@balloads.com', password: 'admin123' }),
  })

  if (!res.ok) {
    throw new Error(`Login failed: ${res.statusText}`)
  }

  const data = await res.json()
  console.log('Logged in successfully.')
  return data.token
}

async function enrol(token: string, triggerType: string) {
  console.log(`Enrolling George with trigger: ${triggerType}...`)
  const res = await fetch(`${DEV_API_BASE}/api/crm/v1/journeys/enrol`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ triggerType, companyId: GEORGE_COMPANY_ID }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error(`Failed to enrol (${triggerType}):`, error)
    return
  }

  const data = await res.json()
  console.log(`Enrolled successfully (${triggerType}):`, data)
}

async function main() {
  try {
    const token = await login()
    
    // Simulate all requested triggers back-to-back
    const triggers = ['inactive_30d', 'credits_low', 'payment_failed', 'manual']
    
    for (const trigger of triggers) {
      await enrol(token, trigger)
      // Small delay between enrolments
      await new Promise(r => setTimeout(r, 1000))
    }
    
    console.log('\n--- SIMULATION COMPLETE ---')
    console.log('All triggers have been sent to George.')
  } catch (err) {
    console.error('Error:', err)
  }
}

main()
