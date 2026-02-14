# MegaBlog (Vite Frontend)

## Vercel Deployment

1. Import this repo/project in Vercel.
2. Set project root to `12MegaBlog` if deploying from monorepo.
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add frontend environment variables in Vercel:
   - `VITE_API_URL` = your deployed backend base URL (example: `https://your-backend.com`)
   - `VITE_TINYMCE_API_KEY` = your TinyMCE key
5. Redeploy.

## Notes

- SPA routing is configured via `vercel.json` rewrite to `index.html`.
- Do not commit real `.env` values. Use `.env.example` as template.
