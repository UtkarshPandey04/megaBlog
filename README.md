# MegaBlog (Vite Frontend)

## Vercel Deployment

1. Import this repo/project in Vercel.
2. Set project root to this folder (`MegaBlog`).
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variables in Vercel:
   - `MONGO_URL` = your MongoDB connection string
   - `JWT_SECRET` = JWT secret
   - `CLIENT_ORIGIN` = `https://<your-vercel-domain>`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` (if email verification is enabled)
   - `VITE_TINYMCE_API_KEY` = your TinyMCE key
   - Optional: `VITE_API_URL` (leave empty to use same-domain `/api` on Vercel)
5. Redeploy. API routes are served from `/api/*` via Vercel Functions.

## Notes

- SPA routing is configured via `vercel.json` rewrite to `index.html`.
- Do not commit real `.env` values. Use `.env.example` as template.
