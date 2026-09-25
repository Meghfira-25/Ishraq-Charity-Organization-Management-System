export const ROLES = ["Admin", "Registration-Officer", "Distribution-Officer"];

export function required(body, fields) {
  const missing = fields.filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === "");
  return missing;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

export function positiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function safeInt(value) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}
