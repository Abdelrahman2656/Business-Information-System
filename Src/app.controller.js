import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { insertCourses } from "../Database/add-courses.js";
import { dbconnection } from "../Database/dbconnection.js";
import { globalErrorHandling } from "./Middleware/asyncHandler.js";
import { courseRouter, studentRouter } from "./Modules/index.js";

const bootstrap  =async(app,express) => {
  //dotenv
  dotenv.config({ path: path.resolve("./.env") });
  //use cors middleware
  app.use(cors());
  //app use json
  app.use(express.json());
  
  //course data
  if (process.env.INSERT_COURSES === "true") {
    await insertCourses();
  }

  //database
   dbconnection();

  // Router
  app.use("/api/v1", studentRouter);
  app.use("/api/v1/course", courseRouter);
  //global error handling
  app.use(globalErrorHandling);
};
export default bootstrap