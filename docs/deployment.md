# Deployment Guide

## Recommended initial hosting

- App hosting: Vercel
- Database: managed MySQL provider or self-managed MySQL VM
- Media: Cloudinary
- Email: SMTP provider

## Vercel deployment steps

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Set the framework preset to Next.js.
4. Add environment variables from `.env.production.example`.
5. Ensure `DATABASE_URL` points to your production MySQL instance.
6. Run Prisma migrations in CI or manually:

```bash
npx prisma migrate deploy
```

7. If desired, run seed data once in production with non-demo content.

## MySQL connection notes

- Use standard MySQL connection strings.
- Keep separate values for `DATABASE_URL` and `DIRECT_URL`.
- Enable SSL in the connection string if your provider requires it.
- If using Vercel with an external MySQL provider, confirm the database accepts connections from Vercel regions.

## Storage notes

- Store gallery images, receipts, and documents in Cloudinary or equivalent object storage.
- Save only the returned URLs and metadata in MySQL.

## Security notes

- Replace all sample credentials before launch.
- Use a strong `NEXTAUTH_SECRET`.
- Limit admin access by role.
- Add rate limiting to form endpoints before public launch.
- Add CAPTCHA to inquiry and contact forms for production.
