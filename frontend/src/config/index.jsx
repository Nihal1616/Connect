import axios from "axios";


// Prefer an environment-configured API root so deployed frontend can target the deployed backend.
// Prefer a build-time environment variable (set this in Vercel/Netlify or when running locally).
// Fallback to the deployed backend URL; for local dev you can set NEXT_PUBLIC_API_URL to http://localhost:8080
export const BASE_URL = "https://connect-ybbm.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});

// Returns a public URL for an image value coming from the backend.
// - If `value` is already an absolute URL (starts with http), return it.
// - If `value` is a path starting with '/', prefix BASE_URL.
// - Otherwise treat `value` as a filename inside /uploads and return BASE_URL/uploads/{value}.
// - If value is falsy, return the default image URL.
export function getImageUrl(value) {
    const defaultImg = `${BASE_URL}/uploads/default.jpg`;
    if (!value) return defaultImg;
    if (typeof value !== "string") return defaultImg;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    if (value.startsWith("/")) return `${BASE_URL}${value}`;
    return `${BASE_URL}/uploads/${value}`;
}