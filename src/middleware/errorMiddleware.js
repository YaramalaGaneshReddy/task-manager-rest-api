function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Route not found",
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  console.error("Unhandled application error:", error);
  return res.status(500).json({
    message: "Internal server error",
  });
}

module.exports = { notFoundHandler, errorHandler };
