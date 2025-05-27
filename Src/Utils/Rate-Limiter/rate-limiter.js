import rateLimit from "express-rate-limit";
import { AppError } from "../AppError.js";

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100 , 
    handler:(req ,res ,next, options)=>{
    return next(new AppError(options.message , options.statusCode))
  }
})