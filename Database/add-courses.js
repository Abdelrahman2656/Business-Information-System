import dotenv from "dotenv";
import fs from "fs";
import path from 'path';
import { Course } from "../Database/Model/course.model.js";
import dbconnection from "./dbconnection.js";


dotenv.config({ path: path.resolve("./.env") });
let dirPath = path.join(process.cwd(), 'Database/path/course');

// دالة لتحميل البيانات من جميع ملفات JSON في المجلد المحدد
const loadJsonFilesFromDir = async (dirPath) => {
  const allData = [];

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (path.extname(fullPath) === ".json") {
      try {
        const rawData = fs.readFileSync(fullPath, "utf-8");
        const jsonData = JSON.parse(rawData);

        if (Array.isArray(jsonData)) {
          allData.push(...jsonData); // لو الملف فيه مصفوفة بيانات
        } else {
          allData.push(jsonData); // لو ملف واحد فيه عنصر واحد
        }
      } catch (err) {
        console.error(`❌ Error reading or parsing file ${file}:`, err.message);
      }
    }
  }

  return allData;
};

// دالة لإدخال الكورسات من ملفات JSON إلى قاعدة البيانات
export const insertCourses = async () => {
  try {
    await dbconnection(); // الاتصال بقاعدة البيانات
    console.log("🔌 Database connected successfully!");

    const existingCourses = await Course.countDocuments();
    console.log("📊 Existing courses count:", existingCourses);

    if (existingCourses > 0) {
      console.log("ℹ️ Courses already exist in the database. Skipping insertion.");
      return;
    }

    const coursesData = await loadJsonFilesFromDir(dirPath);

    if (coursesData.length === 0) {
      console.log("⚠️ No course data found in the JSON files.");
      return;
    }

    const result = await Course.insertMany(coursesData);
    console.log(`✅ ${result.length} courses inserted successfully!`);
  } catch (error) {
    console.error('🚨 Error while inserting courses:', error);
  } finally {
    // mongoose.disconnect(); // إنهاء الاتصال بعد الإدخال
  }
};

  
  