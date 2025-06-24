import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { insertCourses } from "../Database/add-courses.js";
import dbconnection from "../Database/dbconnection.js";
import { globalErrorHandling } from "./Middleware/asyncHandler.js";
import { courseRouter, studentRouter } from "./Modules/index.js";
import { limiter } from "./Utils/Rate-Limiter/rate-limiter.js";

const bootstrap = async (app, express) => {
  //dotenv
  dotenv.config({ path: path.resolve("./.env") });
  app.set("trust proxy", 1);
  //rate limiter
  app.use(limiter);
  //helmet
  app.use(helmet());
  //use cors middleware
  app.use(cors());
  //app use json
  app.use(express.json());

  //database
  await dbconnection();
  //course data
  if (process.env.INSERT_COURSES === "true") {
    await insertCourses();
  }

  // Router
  app.use("/api/v1", studentRouter);
  app.use("/api/v1/course", courseRouter);
  //global error handling
  app.use(globalErrorHandling);
};
export default bootstrap;
