export function pagination(query) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

export function like(value) {
  return `%${String(value || "").trim()}%`;
}
