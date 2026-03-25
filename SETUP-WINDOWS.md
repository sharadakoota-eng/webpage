# Windows Setup Guide

## 1. Install software

Install these first:

- Node.js 20+ from https://nodejs.org
- MySQL Server 8+
- Git from https://git-scm.com

After Node.js is installed, confirm:

```bash
node -v
npm -v
```

## 2. Database

You already created:

```sql
CREATE DATABASE shaarada_koota_dev;
```

That is the correct local database name.

## 3. Create `.env.local`

Create a file named `.env.local` in the project root with content like:

```env
DATABASE_URL="mysql://root:yourpassword@127.0.0.1:3306/shaarada_koota_dev"
DIRECT_URL="mysql://root:yourpassword@127.0.0.1:3306/shaarada_koota_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@shaaradakoota.com"
ADMIN_PASSWORD="StrongPassword123!"
FRONTDESK_EMAILS="frontdesk@shaaradakuuta.com"
NOTIFICATION_FROM_EMAIL="noreply@shaaradakuuta.com"
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
```

## 4. Install project dependencies

Run these from the project folder:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name initial
npm run prisma:seed
npm run dev
```

## 5. Open the app

Once the dev server starts, open:

```text
http://localhost:3000
```

## 6. Sample login

- Admin email: value from `ADMIN_EMAIL`
- Admin password: value from `ADMIN_PASSWORD`

## Important note

`requirements.txt` is only a helper note here. This is a Node.js project, so installation must happen through `npm`, not `pip`.
