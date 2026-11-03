export const resolveMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  try {
    const apiBase = import.meta.env.VITE_API_URL || "https://api.kibegi.com/api";
    const apiOrigin = new URL(apiBase).origin;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return new URL(normalizedPath, apiOrigin).toString();
  } catch {
    return path;
  }
};
