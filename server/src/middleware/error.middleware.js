export function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(
  err,
  req,
  res,
  next
) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || 500;

  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Internal server error"
        : err.message,
  });
}
