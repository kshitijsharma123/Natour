const AppError = require("./../utils/appError");

// This function handle the error coming from DB
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 404);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.error).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    // Destrcting the error

    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(error);

    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    if (err.isOperatinal) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error("That the hell", err);

      res.status(500).json({
        status: "error",
        message: "Something is not working",
      });
    }
  }
  next();
};
