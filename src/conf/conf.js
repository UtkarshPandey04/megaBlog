const rawApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const apiUrl = rawApiUrl.replace(/\/+$/, "");

if (!rawApiUrl) {
    console.warn("Missing VITE_API_URL. API calls will use relative /api paths.");
}

if (import.meta.env.PROD && /localhost|127\.0\.0\.1/.test(apiUrl)) {
    console.warn("VITE_API_URL points to localhost in production. Update it in Vercel env vars.");
}

const conf = {
    apiUrl,
    tokenKey: "megablog_token",
};

export default conf
