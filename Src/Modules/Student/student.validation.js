import joi from "joi";
import { generalFields } from "../../Middleware/validation.js";

export const loginOrCreateStudentVal =joi.object({
    loginIdentifier:generalFields.loginIdentifier.required(),
    password : generalFields.password.required(),
}).required() 