import { Router } from "express";
import { asyncHandler } from "../../Middleware/asyncHandler.js";
import { isValid } from "../../Middleware/validation.js";
import * as studentService from "./student.service.js";
import * as studentValidation from "./student.validation.js";

const studentRouter = Router();

//signUp Or Login
studentRouter.post(
  "/student",
  isValid(studentValidation.loginOrCreateStudentVal),
  asyncHandler(studentService.loginOrCreateStudent)
);
//get all student
studentRouter.get("/all-student",asyncHandler(studentService.AllOfStudent))
export default studentRouter;
