export const globalErrorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};
