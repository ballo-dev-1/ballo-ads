# Database Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```
DATABASE_URL="postgres://6377b0a8a3fdefebfea3dc9b15077d02ace86a477ff994d112774588e16ba4b2:sk_q9ti05Yg6S9uQAKqhVipV@db.prisma.io:5432/postgres?sslmode=require"
POSTGRES_URL="postgres://6377b0a8a3fdefebfea3dc9b15077d02ace86a477ff994d112774588e16ba4b2:sk_q9ti05Yg6S9uQAKqhVipV@db.prisma.io:5432/postgres?sslmode=require"
PRISMA_DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19xOXRpMDVZZzZTOXVRQUtxaFZpcFYiLCJhcGlfa2V5IjoiMDFLQTZBQlAySEdDTVlXMlM1Qlg5NTZSUVgiLCJ0ZW5hbnRfaWQiOiI2Mzc3YjBhOGEzZmRlZmViZmVhM2RjOWIxNTA3N2QwMmFjZTg2YTQ3N2ZmOTk0ZDExMjc3NDU4OGUxNmJhNGIyIiwiaW50ZXJuYWxfc2VjcmV0IjoiMjNiZWYxNjYtMTMxNS00Y2E3LWE2ZTMtZjRjMzBkNTkzODFiIn0.776P-RgcRBD8aq-F-Qzfz_E1hcN9io2_nGE7FoTIRWY"
```

## Database Migration

After creating the `.env.local` file, run the following command to create the database tables:

```bash
npm run db:migrate
```

Or if you prefer to use Prisma directly:

```bash
npx prisma migrate dev --name init
```

## Vercel Deployment

When deploying to Vercel, make sure to add these environment variables in your Vercel project settings:
- `DATABASE_URL`
- `POSTGRES_URL`
- `PRISMA_DATABASE_URL`

## Testing the API

The waitlist form will automatically submit to `/api/waitlist` when users fill out and submit the form. The API will:
- Validate the input data
- Check for duplicate emails
- Store the data in the PostgreSQL database
- Return appropriate success/error messages

