export function ok(
  res,
  data = null,
  message = "Operation successful",
  status = 200
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function fail(
  res,
  message,
  status = 400,
  errors = undefined
) {
  const body = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  return res.status(status).json(body);
}