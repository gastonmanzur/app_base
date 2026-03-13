# Environment variables

## API (`apps/api/.env`)
- `NODE_ENV=development`
- `PORT=4000`
- `MONGO_URI=mongodb://localhost:27017/starter`
- `CORS_ORIGIN=http://localhost:5173`
- `JWT_ACCESS_SECRET=<min 32 chars>`
- `JWT_REFRESH_SECRET=<min 32 chars>`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `EMAIL_TOKEN_EXPIRES_IN_MINUTES=60`
- `RESET_TOKEN_EXPIRES_IN_MINUTES=30`
- `APP_BASE_URL=http://localhost:4000`
- `WEB_BASE_URL=http://localhost:5173`
- `AVATAR_STORAGE_DIR=storage/avatars` (filesystem path used by the local avatar storage provider)
- `AVATAR_PUBLIC_BASE_PATH=/media/avatars` (public mounted path for avatar visualization)
- `AVATAR_MAX_SIZE_BYTES=2097152` (2MB max upload size)
- `GOOGLE_CLIENT_ID=<google oauth web client id>`
- `SMTP_HOST=<smtp host, optional in dev>`
- `SMTP_PORT=587`
- `SMTP_USER=<smtp user>`
- `SMTP_PASS=<smtp password>`
- `SMTP_FROM=no-reply@example.com`

> If `SMTP_HOST` is empty, the API uses Nodemailer `jsonTransport` and logs mail payloads for development.

## Web (`apps/web/.env`)
- `VITE_API_URL=http://localhost:4000/api`

## Avatar local storage layout (development)
- Root directory: `${AVATAR_STORAGE_DIR}`
- Each uploaded avatar is stored as a generated immutable key: `<timestamp>-<uuid>.webp`
- Public URL format: `${APP_BASE_URL}${AVATAR_PUBLIC_BASE_PATH}/{key}`
