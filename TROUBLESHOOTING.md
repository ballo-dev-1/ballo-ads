# Troubleshooting 500 Error on Deployed Version

If you're getting a 500 error when submitting the waitlist form on Vercel, check the following:

## 1. Environment Variables in Vercel

Make sure all three environment variables are set in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables (for all environments: Production, Preview, Development):

```
DATABASE_URL=postgres://6377b0a8a3fdefebfea3dc9b15077d02ace86a477ff994d112774588e16ba4b2:sk_q9ti05Yg6S9uQAKqhVipV@db.prisma.io:5432/postgres?sslmode=require
POSTGRES_URL=postgres://6377b0a8a3fdefebfea3dc9b15077d02ace86a477ff994d112774588e16ba4b2:sk_q9ti05Yg6S9uQAKqhVipV@db.prisma.io:5432/postgres?sslmode=require
PRISMA_DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19xOXRpMDVZZzZTOXVRQUtxaFZpcFYiLCJhcGlfa2V5IjoiMDFLQTZBQlAySEdDTVlXMlM1Qlg5NTZSUVgiLCJ0ZW5hbnRfaWQiOiI2Mzc3YjBhOGEzZmRlZmViZmVhM2RjOWIxNTA3N2QwMmFjZTg2YTQ3N2ZmOTk0ZDExMjc3NDU4OGUxNmJhNGIyIiwiaW50ZXJuYWxfc2VjcmV0IjoiMjNiZWYxNjYtMTMxNS00Y2E3LWE2ZTMtZjRjMzBkNTkzODFiIn0.776P-RgcRBD8aq-F-Qzfz_E1hcN9io2_nGE7FoTIRWY
```

**Important:** After adding environment variables, you must **redeploy** your application for them to take effect.

## 2. Check Vercel Build Logs

1. Go to your Vercel project dashboard
2. Click on the latest deployment
3. Check the **Build Logs** for any errors
4. Look for:
   - Prisma client generation errors
   - Database connection errors
   - Missing environment variable warnings

## 3. Check Vercel Function Logs

1. Go to your Vercel project dashboard
2. Click on **Functions** tab
3. Look for `/api/waitlist` function logs
4. Check for detailed error messages (we've added better error logging)

## 4. Verify Prisma Client Generation

The build script now includes `prisma generate`:
- `postinstall` script runs `prisma generate` after npm install
- `build` script runs `prisma generate && next build`

If you see Prisma errors in build logs, the client might not be generating correctly.

## 5. Database Connection Issues

If environment variables are set correctly but you still get errors:

1. Verify the database is accessible from Vercel's servers
2. Check if your database allows connections from Vercel's IP ranges
3. Verify SSL mode is set correctly (`sslmode=require`)

## 6. Common Error Messages

### "DATABASE_URL environment variable is not set"
- Solution: Add `DATABASE_URL` to Vercel environment variables and redeploy

### "Prisma Client is not generated"
- Solution: The `postinstall` script should handle this. Check build logs to confirm `prisma generate` runs successfully.

### "Connection timeout" or "Connection refused"
- Solution: Check database credentials and network access

## 7. Testing Locally

To test if everything works locally:

```bash
# Make sure .env file exists with DATABASE_URL
npm run build
npm start
# Then test the form submission
```

## 8. Force Redeploy

After making changes:
1. Push your changes to GitHub
2. Vercel will auto-deploy, OR
3. Manually trigger a redeploy in Vercel dashboard

## Still Having Issues?

Check the Vercel function logs for the specific error message. The updated error handling will provide more details about what's failing.

