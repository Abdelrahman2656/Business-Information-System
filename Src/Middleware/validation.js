import joi from "joi";
import { AppError } from "../Utils/AppError.js";

//generalfields
export const generalFields = {
  email:joi.string().email(),
  password:joi.string().pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)),
  loginIdentifier:joi.string().pattern(new RegExp(/^([0-9]{10}|[\w-.]+@([\w-]+\.)+[\w-]{2,4})$/)),
  objectId: joi.string().hex().length(24)
}



//validation
export const isValid = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body,...req.params,...req.query }
    let {error}=schema.validate(data,{abortEarly:false})
    if(error){
        let errArr = []
        error.details.forEach((err) => {
          errArr.push(err.message)
      });
      console.log(errArr);
      return next(new AppError(errArr.join(", "), 400));
  
    }
    next()
  };
};
