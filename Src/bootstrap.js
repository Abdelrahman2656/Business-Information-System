import cors from "cors";
import dotenv from "dotenv";

import path from "path";
import { insertCourses } from "../Database/add-courses.js";
import { dbconnection } from "../Database/dbconnection.js";
import { globalErrorHandling } from "./Middleware/asyncHandler.js";
import { courseRouter, studentRouter } from "./Modules/index.js";

export default async function bootstrap  (app)  {
  //dotenv
  dotenv.config({ path: path.resolve("./.env") });
  
  //course data
  if (process.env.INSERT_COURSES === "true") {
    await insertCourses();
  }

  //database
  await dbconnection();
  //use cors middleware
  app.use(cors("*"));
  //app use json
  app.use(express.json());

  // Router
  app.use("/api/v1", studentRouter);
  app.use("/api/v1/course", courseRouter);
  //global error handling
  app.use(globalErrorHandling);
};
