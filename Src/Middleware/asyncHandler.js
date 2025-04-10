import { AppError } from "../Utils/AppError.js";

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next)?.catch((err) => {
      const message = err.message || "Something went wrong";
      const statusCode = err.statusCode || 500;
      next(new AppError(message, statusCode));
    });
  };
};

//global error handling
export const globalErrorHandling = (err, req, res, next) => {
  if (process.env.MODE == "DEV") {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message, success: false, stack: err.stack  });
  }
  return res
    .status(err.statusCode || 500)
    .json({ message: err.message, success: false });
};
