# Shaarada Koota Montessori Platform

Production-ready school website and ERP platform for Shaarada Koota Montessori School.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- MySQL
- Role-based ERP login
- Razorpay-ready finance flow

## Environment strategy

This project now uses only these real env files:

- `.env.local`
  Local development only.
  Uses local MySQL and localhost URLs.

- `.env.production`
  Production-like or live operations only.
  Uses Railway or another managed MySQL instance and live URLs.

- `.env.example`
  Documentation template only.
  Contains placeholders and comments.

### Not used anymore

These files are intentionally no longer part of runtime loading:

- `.env`
- `.env.local.example`
- `.env.production.example`

## How environment loading works

- Local app runtime loads `.env.local`
- Local Prisma CLI commands load `.env.local`
- Production app runtime loads `.env.production` only if file-based env loading is needed
- Production-like seed runs must explicitly use production mode
- There is no fallback from production to localhost `.env.local`
- Prisma schema always reads `env("DATABASE_URL")` and `env("DIRECT_URL")`

## Local setup

1. Install Node.js 20+ and npm.
2. Create a local MySQL database such as `shaarada_koota_dev`.
3. Fill `.env.local` with your local credentials.
4. Install dependencies:

```bash
npm install
```

5. Generate Prisma client:

```bash
npx prisma generate
```

6. Push schema to local MySQL:

```bash
npx prisma db push
```

7. Seed local data:

```bash
npm run prisma:seed
```

8. Start development:

```bash
npm run dev
```

## Production-like or live database setup

1. Fill `.env.production` with Railway or managed MySQL credentials.
2. Run Prisma against the production database:

```bash
$env:ERP_ENV="production"
npx prisma db push
```

3. Seed production-like data only when you actually want it:

```bash
$env:ERP_ENV="production"
npm run prisma:seed
```

4. Clear the temporary shell override after use:

```bash
Remove-Item Env:ERP_ENV
```

## Vercel deployment

Vercel does not read local env files from your machine.
Set the same production values in the Vercel Environment Variables UI:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `APP_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- mail and payment credentials as needed

## Sample credentials

- Admin email: value from `ADMIN_EMAIL`
- Admin password: value from `ADMIN_PASSWORD`

Teacher and parent accounts are created from the ERP data itself and must exist in the connected database.

## Project structure

```text
app/
  api/
  admin/
  parent/
  teacher/
components/
  layout/
  portal/
  sections/
lib/
  env.ts
  erp-auth.ts
  prisma.ts
prisma/
  schema.prisma
  seed.ts
docs/
  deployment.md
  mysql-to-cloudsql.md
```

## Notes

- Local and production database credentials are now intentionally isolated.
- The seed script no longer loads both local and generic env files together.
- If production login fails, verify the production database schema exists and the Vercel environment values match the live database.

## Windows quick start

See [SETUP-WINDOWS.md](/C:/Users/Srira/OneDrive/Desktop/Shaarada%20Kuuta/SETUP-WINDOWS.md).
