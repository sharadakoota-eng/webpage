# Deployment Guide

## Recommended hosting

- App hosting: Vercel
- Database: Railway MySQL or another managed MySQL provider
- Media: Cloudinary
- Email: SMTP provider

## Environment rules

This project uses only:

- `.env.local` for local development
- `.env.production` for production-like or live CLI usage
- Vercel Environment Variables for deployed production runtime

This project does **not** load `.env`, `.env.local.example`, or `.env.production.example`.

## Vercel deployment steps

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set the framework to Next.js.
4. Add production environment variables in Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `APP_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - any mail, media, and Razorpay variables you use
5. Ensure `DATABASE_URL` points to the live managed MySQL instance.
6. Push Prisma schema to the production database before testing ERP login:

```bash
$env:ERP_ENV="production"
npx prisma db push
```

7. Seed only if you intentionally want demo or bootstrap data:

```bash
$env:ERP_ENV="production"
npm run prisma:seed
```

8. Redeploy after any Vercel env changes.

## MySQL connection notes

- Use the public/external MySQL connection string for local CLI access.
- Keep `DATABASE_URL` and `DIRECT_URL` aligned.
- Enable SSL in the connection string if your provider requires it.
- Never let production fall back to localhost credentials.

## Security notes

- Replace all sample credentials before launch.
- Use a strong `NEXTAUTH_SECRET`.
- Keep `.env.local` and `.env.production` out of source control.
- Store real production secrets only in Vercel or your secure local env files.
