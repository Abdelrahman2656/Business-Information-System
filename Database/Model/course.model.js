import { model, Schema } from "mongoose";

//schema 
const courseSchema= new Schema({
    courseCode:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    },
    credits:{
        type:Number,
        default:3
    },
    instructor:{
        type:String,
        required:true,
    },
    day:{
        type:String,
        required:true,
    },
    yearLevel:{
        type:String,
        required:true,
    },
    semester:{
        type:String,
        required:true,
    },
    capacity:{
        current:{type:Number,default:0},
        max:{type:Number,default:40}
    }
}  ,{
    timestamps: true, // إضافة التواريخ
  })



//model 
export const Course = model('Course',courseSchema)