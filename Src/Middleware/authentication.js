import { Student } from "../../Database/index.js";
import { AppError } from "../Utils/AppError.js";
import { messages } from "../Utils/constant/messages.js";
import { verifyToken } from "../Utils/Token/token.js";

export const isAuthentication = () => {
  return async (req, res, next) => {
    //get token const
    const { authorization } = req.headers;
    if (!authorization?.startsWith("abdelrahman")) {
      return next(new AppError("Invalid Bearer Token", 409));
    }
    const token = authorization.split(" ")[1];
    //check token
    const payload =  verifyToken({
      token,
      secretKey: process.env.SECRET_KEY,
    });
    console.log("Decoded Payload:", payload); // تسجيل المحتوى
    if (payload.message) {
      return next(new AppError(payload.message, 401));
    }
   
    //check user
   let authUser = await Student.findOne({ _id: payload._id });
    if (!authUser) {
      console.error(`User not found with id: ${payload._id}`); 
      return next(new AppError(messages.user.notFound, 404));
    }
    req.authUser = authUser;
    next();
  };
};
