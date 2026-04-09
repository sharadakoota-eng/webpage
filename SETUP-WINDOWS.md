# Windows Setup Guide

## 1. Install software

Install:

- Node.js 20+
- MySQL Server 8+
- Git

Check installation:

```bash
node -v
npm -v
```

## 2. Create local database

Example:

```sql
CREATE DATABASE shaarada_koota_dev;
```

## 3. Fill `.env.local`

Use `.env.local` only for local development:

```env
DATABASE_URL="mysql://root:yourpassword@127.0.0.1:3306/shaarada_koota_dev"
DIRECT_URL="mysql://root:yourpassword@127.0.0.1:3306/shaarada_koota_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@shaaradakoota.com"
ADMIN_PASSWORD="StrongPassword123!"
FRONTDESK_EMAILS="frontdesk@shaaradakoota.com"
NOTIFICATION_FROM_EMAIL="noreply@shaaradakoota.com"
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_USER=""
SMTP_PASSWORD=""
WHATSAPP_PROVIDER="disabled"
SMS_PROVIDER="disabled"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
```

## 4. Install and run

From the project folder:

```bash
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

## 5. Open the app

```text
http://localhost:3000
```

## 6. Local login

- Admin email: value from `ADMIN_EMAIL`
- Admin password: value from `ADMIN_PASSWORD`

## 7. Production-like commands on Windows

If you want Prisma CLI or seed to use `.env.production`, run:

```powershell
$env:ERP_ENV="production"
npx prisma db push
npm run prisma:seed
Remove-Item Env:ERP_ENV
```

## Important note

This project no longer uses `.env` as a runtime source. Keep local values in `.env.local` only.
