This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backoffice Firebase Push Setup

The backoffice supports two notification channels:
- in-app notifications (Prisma + SSE)
- browser push notifications (Firebase Cloud Messaging)

### 1) Re-auth Firebase CLI (required on this machine)

```bash
npx firebase login --reauth
npx firebase use ballo-ads-3c6f7
```

### 2) Configure environment variables

Set the Firebase values in `.env.local` (see `.env.example` for required keys):
- public web config: `NEXT_PUBLIC_FIREBASE_*`
- web push key: `NEXT_PUBLIC_FCM_VAPID_KEY`
- server admin config: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

### 3) Run locally

```bash
npm run dev
```

### 4) Verify push subscription

Log in to backoffice and allow notifications in the browser.
The app subscribes automatically via:
- `POST /api/admin/notifications/subscribe`

### 5) Send a test push

```bash
curl -X POST "http://localhost:3000/api/admin/notifications/test-push" \
  -H "Content-Type: application/json" \
  -b "admin-token=<YOUR_ADMIN_TOKEN_COOKIE>" \
  -d '{"title":"Test push","body":"FCM is working","link":"/admin/dashboard"}'
```

## Backoffice Notification Taxonomy

- **Moderation:** `campaign_approval_request`, `campaign_approval_decision`, `sender_id_approval_request`, `sender_id_approval_decision`
- **Campaign lifecycle:** `campaign_activated`, `campaign_cancelled`
- **Finance:** `low_balance_alert`, `purchase_order_failed`, `purchase_order_expiring`, `purchase_order_expired`, `manual_credit_allocation`
- **Security:** `api_key_rotated`, `api_key_revoked`, `backoffice_user_created`, `backoffice_user_roles_changed`, `backoffice_role_permissions_changed`
- **Operations:** `dispatch_control_changed`, `scheduler_job_control_changed`, `reliability_alert`

### Routing defaults

- All events are persisted as in-app notifications.
- `high` and `critical` severities are also pushed via Firebase topic notifications.
- Events are deduplicated by semantic `dedupeKey` and honor per-event cooldown windows.
- Role targeting is applied server-side using JWT role claims from `admin-token`.

### Operational verification

1. Trigger an action in backoffice (e.g. campaign approval/reject, scheduler pause/resume, API key rotate).
2. Confirm a new row appears in `Notification` table with `category`, `severity`, `targetRoles`, and `dedupeKey`.
3. Verify `GET /api/admin/notifications` only returns role-relevant rows.
4. Verify SSE stream (`/api/admin/notifications/stream`) emits only role-relevant notifications.
5. Verify push appears for `high`/`critical` events only.
