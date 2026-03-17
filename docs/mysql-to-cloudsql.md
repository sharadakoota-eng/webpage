# MySQL to Google Cloud SQL Migration Guide

## Why this migration is straightforward

- Prisma provider remains `mysql`
- Database settings are environment-driven
- No vendor-specific SQL is required in the schema
- Application code uses Prisma instead of raw SQL

## Migration checklist

1. Create a Google Cloud SQL for MySQL instance.
2. Create the target database and user credentials.
3. Back up the current MySQL database.
4. Export the existing schema and data.
5. Import the dump into Cloud SQL.
6. Update `DATABASE_URL` and `DIRECT_URL` in Vercel.
7. Run:

```bash
npx prisma migrate deploy
```

8. Run smoke tests for:
- public pages
- inquiry form
- contact form
- visit booking
- admin login
- notifications

## Export and import example

```bash
mysqldump -u root -p --databases shaarada_kuuta > shaarada_kuuta_backup.sql
mysql -u cloudsql_user -p -h CLOUD_SQL_HOST shaarada_kuuta < shaarada_kuuta_backup.sql
```

## Environment switch

Only the connection strings need to change:

```env
DATABASE_URL="mysql://user:password@cloudsql-host:3306/shaarada_kuuta"
DIRECT_URL="mysql://user:password@cloudsql-host:3306/shaarada_kuuta"
```

## Seed script reuse

The seed script is idempotent for core records and can be reused on staging or fresh environments after adjusting any demo data you do not want in production.
