import { model, Schema } from "mongoose";
import { roles } from "../../Src/Utils/constant/enum.js";
import { hashPassword } from "../../Src/Utils/Encryption/hash.js";

const years= ["firstYear","secondYear","thirdYear","fourthYear"]
const semesters = ["fall" , "spring", "summer"]

//schema
const studentSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },
    loginIdentifier: {
      type: String,
      lowercase: true,
      unique: true,
      sparse:true
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    customId: {
        type: String,
        unique: true,
        sparse: true 
      },
      yearLevelIndex:{
        type :Number,
        default :0
      },
      currentSemester:{
        type:String,
        enum:semesters,
        default:"fall"
      },
      registerCourses:[{
        course: { type: Schema.Types.ObjectId, ref: "Course" },
        semester: String,
        yearLevel: String
    }]
  },
  {
    timestamps: true,
  }
);

//hash password
studentSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = hashPassword({
      password:this.password,
      SALT_ROUND: process.env.SALT_ROUND,
    });
  }
  next();
});
//get year level;
studentSchema.methods.getYearLevel=function(){
  return years[this.yearLevelIndex]||"Graduated"
}
//current semester
studentSchema.methods.getCurrentSemester=function(){
  return this.currentSemester
}
//next semester
studentSchema.methods.advanceSemester=function(){
  if(this.currentSemester == "fall"){
    this.currentSemester = "spring"
  }else if(this.currentSemester =="spring"){
    this.currentSemester = "summer"
  }else if(this.currentSemester == "summer"){
    this.currentSemester = "fall"
    this.yearLevelIndex +=1
  }
  return this.save()
}

//real 
studentSchema.methods.scheduleAdvance = function () {
  // Define semester date ranges
  const currentDate = new Date();

  

  const fallStart = new Date(currentDate.getFullYear(), 9, 1);  // October 1
const fallEnd = new Date(currentDate.getFullYear() + 1, 0, 1); // January 1 next year

const springStart = new Date(currentDate.getFullYear(), 1, 1); // February 1
const springEnd = new Date(currentDate.getFullYear(), 5, 1);   // June 1

const summerStart = new Date(currentDate.getFullYear(), 6, 1); // July 1
const summerEnd = new Date(currentDate.getFullYear(), 8, 30);  // September 30
  // Calculate delay until the next semester starts
  let delay = 0;

  // Check if current date is in fall
  if (currentDate >= fallStart && currentDate <= fallEnd) {
    delay = fallEnd - currentDate; // time until next semester (spring)
  }
  // Check if current date is in spring
  else if (currentDate >= springStart && currentDate <= springEnd) {
    delay = springEnd - currentDate; // time until next semester (summer)
  }
  // Check if current date is in summer
  else if (currentDate >= summerStart && currentDate <= summerEnd) {
    delay = summerEnd - currentDate; // time until next semester (fall)
  }

  setTimeout(async () => {
    await this.advanceSemester();
    console.log(`✅ ${this.name} advanced to ${this.getYearLevel()} - ${this.currentSemester}`);
  }, delay);
};
//model
export const Student = model("Student", studentSchema);
