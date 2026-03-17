# Shaarada Kuuta Montessori Platform

Production-ready, mobile-first website and school management platform scaffold for Shaarada Kuuta Montessori - A House of Learning.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- MySQL
- NextAuth credentials-based role login
- Cloudinary-ready media setup
- Razorpay-ready payment data model
- Vercel deployment target

## Included modules

### Phase 1

- Public website
- Admissions, inquiry, contact, and visit booking flows
- Gallery, testimonials, events, FAQ, fee information
- Admin portal shell
- Lead management data model
- Event-driven notification architecture

### Phase 2 ready

- Parent portal shell
- Teacher portal shell
- Students, classes, attendance, homework updates
- Announcements and records

### Phase 3 ready

- Fee structures
- Invoices
- Payments
- Receipts
- Leave requests
- Audit logs and reporting foundations

## Local setup

1. Install Node.js 20+ and npm.
2. Create a MySQL database, for example `shaarada_kuuta_dev`.
3. Copy `.env.local.example` to `.env.local` and update credentials.
4. Install dependencies:

```bash
npm install
```

5. Generate Prisma client:

```bash
npx prisma generate
```

6. Run migrations:

```bash
npx prisma migrate dev --name initial
```

7. Seed sample data:

```bash
npm run prisma:seed
```

8. Start development:

```bash
npm run dev
```

## Sample credentials

- Admin: value from `ADMIN_EMAIL`, default `admin@shaaradakuuta.com`
- Password: value from `ADMIN_PASSWORD`, default `ChangeMe123!`
- Teacher: `teacher@shaaradakuuta.com`
- Parent: `parent@shaaradakuuta.com`

## Project structure

```text
app/
  api/
  admin/
  parent/
  teacher/
  ...public pages
components/
  layout/
  portal/
  sections/
  ui/
lib/
  auth.ts
  content.ts
  notifications/
  prisma.ts
  site.ts
prisma/
  schema.prisma
  seed.ts
docs/
  deployment.md
  mysql-to-cloudsql.md
```

## Notes

- The UI is intentionally mobile-first with sticky call-to-action support.
- Environment variables drive all infrastructure-specific values.
- Prisma is configured for MySQL now and remains compatible with Google Cloud SQL for MySQL later.
- External notification channels are abstracted so email can go live first and WhatsApp or SMS can be plugged in later.

## What still needs to be run after Node is installed

- `npm install`
- `npx prisma generate`
- `npx prisma migrate dev --name initial`
- `npm run prisma:seed`
- `npm run dev`

## Windows quick start

See [SETUP-WINDOWS.md](/C:/Users/Srira/OneDrive/Desktop/Shaarada%20Kuuta/SETUP-WINDOWS.md) for a direct setup checklist.
