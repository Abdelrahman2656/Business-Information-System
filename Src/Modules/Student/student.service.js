import { Student } from "../../../Database/index.js";
import { AppError } from "../../Utils/AppError.js";
import { messages } from "../../Utils/constant/messages.js";
import { generateID } from "../../Utils/Email/emailEvent.js";
import { comparePassword } from "../../Utils/Encryption/compare.js";
import { generateToken } from "../../Utils/Token/token.js";

//---------------------------------------Login Or Create -------------------------------------------------------
export const loginOrCreateStudent = async (req, res, next) => {
  //get data from req
  const { loginIdentifier, password, role ,email} = req.body;
  //check exist
  let userExist = await Student.findOne({
    $or: [
      { loginIdentifier },
      { customId: loginIdentifier }
    ],
  });
  
  if (userExist) {
    if (userExist.email === loginIdentifier) {
      return next(new AppError(messages.user.customIdRequired, 400));
    }
    let match =await comparePassword({ password, hashPassword: userExist.password });
    if (!match) {
      return next(new AppError(messages.user.Incorrect, 400));
    }
    //generate token
    const access_token = generateToken({
      payload: {
        _id: userExist._id,
        loginIdentifier: userExist.loginIdentifier,
      },
      options: { expiresIn: "1d" },
    });
    const refresh_token = generateToken({
      payload: { _id: userExist._id, loginIdentifier: userExist.loginIdentifier },
      options: { expiresIn: "7d" },
    });
    //send response
    return res.status(200).json({
      message: messages.user.loginSuccessfully,
      success: true,
      access_token,
      refresh_token,
      UserData: userExist,
    });
  }
  //create customId
  let year = new Date().getFullYear();
  let randomId = Math.floor(100000 + Math.random() * 900000);
  let customId = `${year}${randomId}`;
  //create student
  const student = new Student({
    email:loginIdentifier,
    customId,
    role,
    password,
    loginIdentifier
  });
  const studentCreated = await student.save();
  if (!studentCreated) {
    return next(new AppError(messages.user.failToCreate, 500));
  }
  //send email 
  await generateID(loginIdentifier,customId,password)

  //send response
  return res.status(201)
    .json({
      message: messages.user.createdSuccessfully,
      success:true,
      StudentData:studentCreated
    });
};

//---------------------------------------All Student -------------------------------------------------------
export const AllOfStudent =async(req,res,next)=>{
    //get data 
    let students = await Student.find()
    //count
    let TotalStudents = await Student.countDocuments()
    //send response 
    return res.status(200).json({success:true , TotalStudents , StudentData : students})
}
