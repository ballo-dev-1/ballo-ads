# How to View Waitlist Data

There are several ways to view the submitted waitlist data:

## Method 1: Using Prisma Studio (Easiest - Visual Interface)

Prisma Studio provides a visual interface to view and manage your database data.

1. **Run Prisma Studio:**
   ```bash
   npm run db:studio
   ```

2. **Open in Browser:**
   - Prisma Studio will automatically open at `http://localhost:5555`
   - You'll see a list of your database tables
   - Click on the `Waitlist` table to view all entries
   - You can view, edit, and delete entries directly from the interface

## Method 2: Using the API Endpoint (Programmatic)

You can fetch the data via the API endpoint:

### Get All Entries:
```bash
curl http://localhost:3000/api/waitlist
```

Or in your browser, visit:
```
http://localhost:3000/api/waitlist
```

### With Pagination:
```bash
curl "http://localhost:3000/api/waitlist?page=1&limit=10"
```

### Response Format:
```json
{
  "data": [
    {
      "id": "cmxxx...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 100,
    "totalPages": 1
  }
}
```

## Method 3: Using Prisma Client Directly (In Code)

You can query the database directly in your code:

```typescript
import { prisma } from '@/lib/prisma'

// Get all entries
const entries = await prisma.waitlist.findMany({
  orderBy: {
    createdAt: 'desc',
  },
})

// Get entry by email
const entry = await prisma.waitlist.findUnique({
  where: { email: 'user@example.com' },
})

// Get entries with pagination
const entries = await prisma.waitlist.findMany({
  skip: 0,
  take: 10,
  orderBy: { createdAt: 'desc' },
})
```

## Method 4: Export to CSV (Using a Script)

Create a script to export data to CSV:

```typescript
// scripts/export-waitlist.ts
import { prisma } from '../lib/prisma'

async function exportWaitlist() {
  const entries = await prisma.waitlist.findMany({
    orderBy: { createdAt: 'desc' },
  })
  
  // Convert to CSV
  const csv = [
    'Name,Email,Phone,Created At',
    ...entries.map(e => 
      `"${e.name}","${e.email}","${e.phone}","${e.createdAt}"`
    )
  ].join('\n')
  
  console.log(csv)
  // Or write to file using fs
}

exportWaitlist()
```

## Method 5: Create an Admin Page (Recommended for Production)

For production, you should create a protected admin page:

1. Create `app/admin/waitlist/page.tsx`
2. Add authentication (e.g., NextAuth, or simple password protection)
3. Fetch data using the API endpoint or Prisma directly
4. Display in a table format

## Security Note

⚠️ **Important:** The GET endpoint is currently open. For production, you should:
- Add authentication/authorization
- Use environment variables to restrict access
- Or remove the GET endpoint and only use Prisma Studio locally

