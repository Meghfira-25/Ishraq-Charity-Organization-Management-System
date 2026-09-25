const API_BASE = import.meta.env.VITE_API_URL || "/api";

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function openProtectedFile(path) {
  if (!path) return;
  const token = localStorage.getItem("ishraq_token");
  let url = path;

  if (!url.startsWith("http") && !url.startsWith("/")) url = `/${url}`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    let message = "Unable to open file";
    try {
      const body = await response.json();
      message = body?.message || message;
    } catch {}
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const opened = window.open(objectUrl, "_blank", "noopener,noreferrer");
  if (!opened) {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  }
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export function resolvePublicAsset(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  if (path.startsWith("/uploads/")) return path;
  if (path.startsWith("/api/")) return path;
  return `${API_BASE.replace(/\/api\/?$/, "")}/${String(path).replace(/^\//, "")}`;
}
